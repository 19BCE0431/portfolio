import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { Resend } from "resend";

type AnalyticsRow = {
  metricValues?: Array<{
    value?: string | null;
  }> | null;
};

type ReportRow = {
  dimensions: string[];
  metrics: number[];
};

type DeliveryResult = {
  status: "sent" | "skipped" | "failed";
  reason?: string;
  id?: string;
};

type InsightTone = "good" | "watch" | "opportunity" | "setup";

type Insight = {
  title: string;
  body: string;
  tone: InsightTone;
};

type MetricSummary = {
  activeUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  engagementRate: number;
  averageSessionDuration: number;
  eventCount: number;
  keyEvents: number;
};

type ProviderStatus = "connected" | "needs_config" | "manual" | "failed";

type ProviderDigest = {
  name: string;
  status: ProviderStatus;
  headline: string;
  detail: string;
  dashboardUrl?: string;
};

type ClarityInformationRow = Record<string, string | number | null | undefined>;

type ClarityApiMetric = {
  metricName?: string;
  information?: ClarityInformationRow[];
};

type ClarityHighlight = {
  label: string;
  value: number;
  displayValue: string;
  detail?: string;
};

type ClarityDigest = {
  configured: boolean;
  status: ProviderStatus;
  projectId?: string;
  dashboardUrl?: string;
  summary: string;
  topTraffic: ClarityHighlight[];
  frictionSignals: ClarityHighlight[];
  setupNotes: string[];
};

type VercelDigest = {
  status: ProviderStatus;
  environment: string;
  productionUrl: string;
  deploymentUrl?: string;
  region?: string;
  commitSha?: string;
  dashboardUrl: string;
  summary: string;
};

type ReportingWindow = {
  dateLabel: string;
  generatedAtLabel: string;
  windowLabel: string;
  comparisonLabel: string;
  gaDate: string;
  previousGaDate: string;
};

export type AnalyticsDigest = {
  configured: boolean;
  dateLabel: string;
  generatedAtLabel: string;
  windowLabel: string;
  comparisonLabel: string;
  propertyId?: string;
  subject: string;
  summary: MetricSummary;
  comparison: Partial<Record<keyof MetricSummary, number | null>>;
  insights: Insight[];
  providers: ProviderDigest[];
  topPages: ReportRow[];
  topSources: ReportRow[];
  topLocations: ReportRow[];
  topDevices: ReportRow[];
  topEvents: ReportRow[];
  clarity: ClarityDigest;
  vercel: VercelDigest;
  setupNotes: string[];
};

const summaryMetrics = [
  "activeUsers",
  "newUsers",
  "sessions",
  "screenPageViews",
  "engagementRate",
  "averageSessionDuration",
  "eventCount",
  "keyEvents",
];

let analyticsClient: BetaAnalyticsDataClient | null = null;
let resendClient: Resend | null = null;

export async function buildDailyAnalyticsDigest(): Promise<AnalyticsDigest> {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim();
  const reportingWindow = buildReportingWindow();
  const clarity = await fetchClarityDigest();
  const vercel = buildVercelDigest();

  if (!propertyId) {
    return createSetupDigest({
      reportingWindow,
      note: "GA4_PROPERTY_ID is missing.",
      clarity,
      vercel,
    });
  }

  const googleConfigNotes = getGoogleAnalyticsConfigNotes();

  if (googleConfigNotes.length) {
    return createSetupDigest({
      reportingWindow,
      note: googleConfigNotes[0],
      propertyId,
      clarity,
      vercel,
      setupNotes: googleConfigNotes,
    });
  }

  try {
    const [current, previous, topPages, topSources, topLocations, topDevices, topEvents] =
      await Promise.all([
        fetchSummary(propertyId, reportingWindow.gaDate),
        fetchSummary(propertyId, reportingWindow.previousGaDate),
        fetchRows(propertyId, ["unifiedPagePathScreen", "pageTitle"], [
          "screenPageViews",
          "activeUsers",
          "averageSessionDuration",
        ], reportingWindow.gaDate),
        fetchRows(propertyId, ["sessionDefaultChannelGroup", "sessionSourceMedium"], [
          "sessions",
          "activeUsers",
        ], reportingWindow.gaDate),
        fetchRows(
          propertyId,
          ["country", "city"],
          ["activeUsers", "sessions"],
          reportingWindow.gaDate,
        ),
        fetchRows(
          propertyId,
          ["deviceCategory"],
          ["activeUsers", "screenPageViews"],
          reportingWindow.gaDate,
        ),
        fetchRows(
          propertyId,
          ["eventName"],
          ["eventCount", "activeUsers"],
          reportingWindow.gaDate,
          8,
        ),
      ]);

    const comparison = buildComparison(current, previous);
    const insights = buildExecutiveInsights({
      summary: current,
      comparison,
      topPages,
      topSources,
      topLocations,
      topDevices,
      topEvents,
      clarity,
    });
    const subject = `Portfolio analytics brief: ${current.newUsers} new users, ${current.pageViews} views (${reportingWindow.dateLabel})`;

    return {
      configured: true,
      dateLabel: reportingWindow.dateLabel,
      generatedAtLabel: reportingWindow.generatedAtLabel,
      windowLabel: reportingWindow.windowLabel,
      comparisonLabel: reportingWindow.comparisonLabel,
      propertyId,
      subject,
      summary: current,
      comparison,
      insights,
      providers: buildProviderDigests({
        gaStatus: "connected",
        gaHeadline: "GA4 Data API connected",
        gaDetail: `Property ${propertyId} returned yesterday's acquisition, behavior, geography, device, and event data.`,
        clarity,
        vercel,
      }),
      topPages,
      topSources,
      topLocations,
      topDevices,
      topEvents,
      clarity,
      vercel,
      setupNotes: [],
    };
  } catch (error) {
    return createSetupDigest({
      reportingWindow,
      note: error instanceof Error ? error.message : "Google Analytics Data API failed.",
      propertyId,
      clarity,
      vercel,
    });
  }
}

export async function sendAnalyticsEmail(digest: AnalyticsDigest): Promise<DeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.ANALYTICS_EMAIL_FROM?.trim();
  const to = process.env.ANALYTICS_EMAIL_TO?.trim() || "cm.mohhithh@gmail.com";

  if (!apiKey || !from || !to) {
    const missing = [
      !apiKey ? "RESEND_API_KEY" : "",
      !from ? "ANALYTICS_EMAIL_FROM" : "",
      !to ? "ANALYTICS_EMAIL_TO" : "",
    ].filter(Boolean);

    return {
      status: "skipped",
      reason: `Missing ${missing.join(", ")}.`,
    };
  }

  try {
    const response = await getResendClient(apiKey).emails.send({
      from,
      to,
      subject: digest.subject,
      html: renderDigestHtml(digest),
      text: renderDigestText(digest),
      tags: [
        {
          name: "category",
          value: "portfolio-analytics",
        },
      ],
    });

    if (response.error) {
      return {
        status: "failed",
        reason: response.error.message,
      };
    }

    return {
      status: "sent",
      id: response.data.id,
    };
  } catch (error) {
    return {
      status: "failed",
      reason: error instanceof Error ? error.message : "Email delivery failed.",
    };
  }
}

export async function sendAnalyticsWhatsApp(digest: AnalyticsDigest): Promise<DeliveryResult> {
  const enabled =
    process.env.ANALYTICS_WHATSAPP_NOTIFY === "true" ||
    process.env.WHATSAPP_NOTIFY === "true";

  if (!enabled) {
    return {
      status: "skipped",
      reason: "ANALYTICS_WHATSAPP_NOTIFY is not enabled.",
    };
  }

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const toNumber = process.env.WHATSAPP_TO_NUMBER?.trim();

  if (!accessToken || !phoneNumberId || !toNumber) {
    return {
      status: "skipped",
      reason: "Missing WhatsApp Cloud API credentials.",
    };
  }

  const graphApiVersion = process.env.WHATSAPP_GRAPH_API_VERSION || "v23.0";
  const message = renderWhatsAppDigest(digest);

  try {
    const response = await fetch(
      `https://graph.facebook.com/${graphApiVersion}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: toNumber,
          type: "text",
          text: {
            preview_url: false,
            body: message,
          },
        }),
      },
    );

    if (!response.ok) {
      return {
        status: "failed",
        reason: `WhatsApp Cloud API returned ${response.status}.`,
      };
    }

    const payload = (await response.json()) as { messages?: Array<{ id?: string }> };

    return {
      status: "sent",
      id: payload.messages?.[0]?.id,
    };
  } catch (error) {
    return {
      status: "failed",
      reason: error instanceof Error ? error.message : "WhatsApp delivery failed.",
    };
  }
}

async function fetchSummary(propertyId: string, date: string): Promise<MetricSummary> {
  const [response] = await getAnalyticsClient().runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: date, endDate: date }],
    metrics: summaryMetrics.map((name) => ({ name })),
  });

  const row = response.rows?.[0];

  return {
    activeUsers: getMetric(row, 0),
    newUsers: getMetric(row, 1),
    sessions: getMetric(row, 2),
    pageViews: getMetric(row, 3),
    engagementRate: getMetric(row, 4),
    averageSessionDuration: getMetric(row, 5),
    eventCount: getMetric(row, 6),
    keyEvents: getMetric(row, 7),
  };
}

async function fetchRows(
  propertyId: string,
  dimensions: string[],
  metrics: string[],
  date: string,
  limit = 6,
): Promise<ReportRow[]> {
  const [response] = await getAnalyticsClient().runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: date, endDate: date }],
    dimensions: dimensions.map((name) => ({ name })),
    metrics: metrics.map((name) => ({ name })),
    limit,
    orderBys: [
      {
        metric: {
          metricName: metrics[0],
        },
        desc: true,
      },
    ],
  });

  return (response.rows || []).map((row) => ({
    dimensions: (row.dimensionValues || []).map((value) => value.value || "(not set)"),
    metrics: (row.metricValues || []).map((value) => Number(value.value || 0)),
  }));
}

async function fetchClarityDigest(): Promise<ClarityDigest> {
  const projectId =
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim() || "wswfgi70h5";
  const apiToken =
    process.env.CLARITY_API_TOKEN?.trim() ||
    process.env.MICROSOFT_CLARITY_API_TOKEN?.trim();
  const dashboardUrl = `https://clarity.microsoft.com/projects/view/${projectId}/dashboard`;

  if (!apiToken) {
    return {
      configured: false,
      status: "needs_config",
      projectId,
      dashboardUrl,
      summary:
        "Clarity tracking is installed, but automated behavior export needs a Clarity Data Export API token.",
      topTraffic: [],
      frictionSignals: [],
      setupNotes: [
        "CLARITY_API_TOKEN is missing, so the email can link to Clarity but cannot pull heatmap/session-friction rows automatically.",
      ],
    };
  }

  try {
    const params = new URLSearchParams({
      numOfDays: "1",
      dimension1: "URL",
      dimension2: "Device",
      dimension3: "Country/Region",
    });
    const response = await fetch(
      `https://www.clarity.ms/export-data/api/v1/project-live-insights?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      return {
        configured: false,
        status: "failed",
        projectId,
        dashboardUrl,
        summary: `Clarity export failed with HTTP ${response.status}.`,
        topTraffic: [],
        frictionSignals: [],
        setupNotes: [
          `Clarity Data Export API returned HTTP ${response.status}. Regenerate the token if it is expired or unauthorized.`,
        ],
      };
    }

    const payload = (await response.json()) as unknown;
    const metrics = Array.isArray(payload) ? (payload as ClarityApiMetric[]) : [];
    const topTraffic = extractClarityHighlights(metrics, "Traffic", [
      "totalSessionCount",
      "sessionsCount",
      "sessionCount",
      "traffic",
    ]);
    const frictionSignals = [
      ...extractClarityHighlights(metrics, "Dead Click Count", [
        "deadClickCount",
        "DeadClickCount",
        "subTotal",
        "sessionsCount",
        "count",
        "value",
      ], 3),
      ...extractClarityHighlights(metrics, "Excessive Scroll", [
        "excessiveScroll",
        "ExcessiveScroll",
        "subTotal",
        "sessionsCount",
        "count",
        "value",
      ], 3),
      ...extractClarityHighlights(metrics, "Rage Click Count", [
        "rageClickCount",
        "RageClickCount",
        "subTotal",
        "sessionsCount",
        "count",
        "value",
      ], 3),
      ...extractClarityHighlights(metrics, "Quickback Click", [
        "quickbackClick",
        "QuickbackClick",
        "subTotal",
        "sessionsCount",
        "count",
        "value",
      ], 3),
      ...extractClarityHighlights(metrics, "Script Error Count", [
        "scriptErrorCount",
        "ScriptErrorCount",
        "subTotal",
        "sessionsCount",
        "count",
        "value",
      ], 3),
      ...extractClarityHighlights(metrics, "Error Click Count", [
        "errorClickCount",
        "ErrorClickCount",
        "subTotal",
        "sessionsCount",
        "count",
        "value",
      ], 3),
    ]
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return {
      configured: true,
      status: "connected",
      projectId,
      dashboardUrl,
      summary: topTraffic.length
        ? "Clarity behavior export is connected for traffic and friction signals."
        : "Clarity export is connected, but no behavior rows were returned for the last 24 hours.",
      topTraffic,
      frictionSignals,
      setupNotes: [],
    };
  } catch (error) {
    return {
      configured: false,
      status: "failed",
      projectId,
      dashboardUrl,
      summary: "Clarity export could not be read.",
      topTraffic: [],
      frictionSignals: [],
      setupNotes: [
        error instanceof Error ? error.message : "Clarity Data Export API failed.",
      ],
    };
  }
}

function buildVercelDigest(): VercelDigest {
  const productionHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || "www.mohitsaikrishna.in";
  const deploymentHost = process.env.VERCEL_URL;
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);

  return {
    status: "manual",
    environment: process.env.VERCEL_ENV || "local",
    productionUrl: `https://${productionHost}`,
    deploymentUrl: deploymentHost ? `https://${deploymentHost}` : undefined,
    region: process.env.VERCEL_REGION,
    commitSha,
    dashboardUrl: "https://vercel.com/19bce0431s-projects/portfolio/analytics",
    summary:
      "Vercel Web Analytics and Speed Insights are installed; detailed Vercel panels remain in the Vercel dashboard/export flow while this email records deployment context.",
  };
}

function getGoogleAnalyticsConfigNotes() {
  const hasPackedCredentials = Boolean(process.env.GA4_SERVICE_ACCOUNT_JSON?.trim());
  const hasSplitCredentials = Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim(),
  );
  const hasApplicationCredentials = Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim(),
  );

  if (hasPackedCredentials || hasSplitCredentials || hasApplicationCredentials) {
    return [];
  }

  return [
    "GA4 service-account credentials are missing. Set GA4_SERVICE_ACCOUNT_JSON, or set GOOGLE_SERVICE_ACCOUNT_EMAIL plus GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.",
  ];
}

function getAnalyticsClient() {
  if (analyticsClient) {
    return analyticsClient;
  }

  const credentials = getGoogleCredentials();

  analyticsClient = credentials
    ? new BetaAnalyticsDataClient({ credentials })
    : new BetaAnalyticsDataClient();

  return analyticsClient;
}

function getGoogleCredentials() {
  const serviceAccountJson = process.env.GA4_SERVICE_ACCOUNT_JSON?.trim();

  if (serviceAccountJson) {
    const rawJson = serviceAccountJson.startsWith("{")
      ? serviceAccountJson
      : Buffer.from(serviceAccountJson, "base64").toString("utf8");
    const parsed = JSON.parse(rawJson) as {
      client_email?: string;
      private_key?: string;
    };

    if (parsed.client_email && parsed.private_key) {
      return {
        client_email: parsed.client_email,
        private_key: normalizePrivateKey(parsed.private_key),
      };
    }
  }

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim();

  if (!clientEmail || !privateKey) {
    return undefined;
  }

  return {
    client_email: clientEmail,
    private_key: normalizePrivateKey(privateKey),
  };
}

function normalizePrivateKey(privateKey: string) {
  return privateKey.replace(/\\n/g, "\n");
}

function getResendClient(apiKey: string) {
  if (!resendClient || resendClient.key !== apiKey) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

function getMetric(row: AnalyticsRow | null | undefined, index: number) {
  return Number(row?.metricValues?.[index]?.value || 0);
}

function buildComparison(
  current: MetricSummary,
  previous: MetricSummary,
): Partial<Record<keyof MetricSummary, number | null>> {
  return {
    activeUsers: percentChange(current.activeUsers, previous.activeUsers),
    newUsers: percentChange(current.newUsers, previous.newUsers),
    sessions: percentChange(current.sessions, previous.sessions),
    pageViews: percentChange(current.pageViews, previous.pageViews),
    eventCount: percentChange(current.eventCount, previous.eventCount),
    keyEvents: percentChange(current.keyEvents, previous.keyEvents),
  };
}

function percentChange(current: number, previous: number) {
  if (!previous) {
    return current ? null : 0;
  }

  return ((current - previous) / previous) * 100;
}

function createSetupDigest({
  reportingWindow,
  note,
  propertyId,
  clarity,
  vercel,
  setupNotes = [],
}: {
  reportingWindow: ReportingWindow;
  note: string;
  propertyId?: string;
  clarity: ClarityDigest;
  vercel: VercelDigest;
  setupNotes?: string[];
}): AnalyticsDigest {
  const allSetupNotes = [
    note,
    ...setupNotes.filter((setupNote) => setupNote !== note),
    ...clarity.setupNotes,
    "Add GA4 Data API credentials and grant the service account Viewer access to your GA4 property.",
  ];

  return {
    configured: false,
    dateLabel: reportingWindow.dateLabel,
    generatedAtLabel: reportingWindow.generatedAtLabel,
    windowLabel: reportingWindow.windowLabel,
    comparisonLabel: reportingWindow.comparisonLabel,
    propertyId,
    subject: `Portfolio analytics setup: GA4 access needed (${reportingWindow.dateLabel})`,
    summary: {
      activeUsers: 0,
      newUsers: 0,
      sessions: 0,
      pageViews: 0,
      engagementRate: 0,
      averageSessionDuration: 0,
      eventCount: 0,
      keyEvents: 0,
    },
    comparison: {},
    insights: [
      {
        title: "GA4 server access is the blocker",
        body: `The report is scheduled for the previous full day (${reportingWindow.windowLabel}), but GA4 cannot be read automatically until a service account is granted Viewer access.`,
        tone: "setup",
      },
      {
        title: clarity.configured ? "Clarity behavior export is connected" : "Tracking is installed",
        body: clarity.configured
          ? "Microsoft Clarity can now feed behavior and friction signals into the daily brief; GA4 remains the source of truth for previous-day users, sessions, sources, locations, and pages."
          : "GA4, Microsoft Clarity, Vercel Web Analytics, and Speed Insights are present in the app; the missing part is private server-side access for automated reporting.",
        tone: clarity.configured ? "good" : "watch",
      },
    ],
    providers: buildProviderDigests({
      gaStatus: "needs_config",
      gaHeadline: "GA4 reporting is not fully connected",
      gaDetail: note,
      clarity,
      vercel,
    }),
    topPages: [],
    topSources: [],
    topLocations: [],
    topDevices: [],
    topEvents: [],
    clarity,
    vercel,
    setupNotes: Array.from(new Set(allSetupNotes)),
  };
}

function buildProviderDigests({
  gaStatus,
  gaHeadline,
  gaDetail,
  clarity,
  vercel,
}: {
  gaStatus: ProviderStatus;
  gaHeadline: string;
  gaDetail: string;
  clarity: ClarityDigest;
  vercel: VercelDigest;
}): ProviderDigest[] {
  return [
    {
      name: "Google Analytics 4",
      status: gaStatus,
      headline: gaHeadline,
      detail: gaDetail,
      dashboardUrl: "https://analytics.google.com/",
    },
    {
      name: "Microsoft Clarity",
      status: clarity.status,
      headline: clarity.configured
        ? "Behavior export connected"
        : "Tracking installed; API export needs token",
      detail: clarity.summary,
      dashboardUrl: clarity.dashboardUrl,
    },
    {
      name: "Vercel Analytics / Speed Insights",
      status: vercel.status,
      headline: "Instrumentation installed",
      detail: vercel.summary,
      dashboardUrl: vercel.dashboardUrl,
    },
  ];
}

function buildExecutiveInsights({
  summary,
  comparison,
  topPages,
  topSources,
  topLocations,
  topDevices,
  topEvents,
  clarity,
}: {
  summary: MetricSummary;
  comparison: Partial<Record<keyof MetricSummary, number | null>>;
  topPages: ReportRow[];
  topSources: ReportRow[];
  topLocations: ReportRow[];
  topDevices: ReportRow[];
  topEvents: ReportRow[];
  clarity: ClarityDigest;
}): Insight[] {
  const insights: Insight[] = [];
  const pageDepth = summary.sessions
    ? summary.pageViews / summary.sessions
    : 0;
  const topPage = topPages[0];
  const topSource = topSources[0];
  const topLocation = topLocations[0];
  const mobile = topDevices.find(
    (row) => row.dimensions[0]?.toLowerCase() === "mobile",
  );
  const mobileShare =
    summary.activeUsers && mobile
      ? (mobile.metrics[0] / summary.activeUsers) * 100
      : 0;

  if (!summary.activeUsers) {
    insights.push({
      title: "No measurable visitor volume yesterday",
      body: "The report ran, but GA4 returned zero active users. Visit the live site once from a normal browser and confirm Realtime in GA4 if this looks wrong.",
      tone: "watch",
    });
  } else {
    insights.push({
      title: "Traffic pulse",
      body: `${formatNumber(summary.activeUsers)} active users created ${formatNumber(summary.pageViews)} page views across ${formatNumber(summary.sessions)} sessions ${formatDelta(comparison.activeUsers)}.`,
      tone: comparison.activeUsers && comparison.activeUsers > 20 ? "good" : "watch",
    });
  }

  insights.push({
    title: "Engagement quality",
    body: `${formatPercent(summary.engagementRate)} engagement, ${formatDuration(summary.averageSessionDuration)} average session, and ${pageDepth.toFixed(1)} pages per session.`,
    tone:
      summary.engagementRate >= 0.6 || summary.averageSessionDuration >= 60
        ? "good"
        : "opportunity",
  });

  if (topPage) {
    const [path, title] = topPage.dimensions;
    insights.push({
      title: "Main attention point",
      body: `${title || path} led with ${formatNumber(topPage.metrics[0])} views. Treat this as the primary page to polish, shorten, or connect to a stronger next action.`,
      tone: "opportunity",
    });
  }

  if (topSource) {
    const [channel, source] = topSource.dimensions;
    const sourceShare = summary.sessions
      ? (topSource.metrics[0] / summary.sessions) * 100
      : 0;
    insights.push({
      title: "Acquisition signal",
      body: `${channel} / ${source} brought ${formatNumber(topSource.metrics[0])} sessions${sourceShare ? ` (${sourceShare.toFixed(0)}% of sessions)` : ""}.`,
      tone: sourceShare > 70 ? "watch" : "good",
    });
  }

  if (topLocation) {
    const [country, city] = topLocation.dimensions;
    insights.push({
      title: "Geography",
      body: `${city}, ${country} was the strongest location cluster with ${formatNumber(topLocation.metrics[0])} users.`,
      tone: "good",
    });
  }

  if (mobileShare) {
    insights.push({
      title: "Device priority",
      body: `Mobile represented ${mobileShare.toFixed(0)}% of users yesterday, so navigation, scroll rhythm, and tap targets should stay the first UX priority.`,
      tone: mobileShare >= 50 ? "opportunity" : "watch",
    });
  }

  if (!summary.keyEvents) {
    insights.push({
      title: "Conversion tracking gap",
      body: "GA4 key events are still zero. Add key events for contact clicks, resume opens, project opens, and outbound social taps so the report can score intent, not only traffic.",
      tone: "setup",
    });
  }

  if (topEvents[0]) {
    insights.push({
      title: "Event texture",
      body: `${topEvents[0].dimensions[0]} was the top event with ${formatNumber(topEvents[0].metrics[0])} hits.`,
      tone: "watch",
    });
  }

  if (clarity.configured && clarity.frictionSignals.length) {
    const topFriction = clarity.frictionSignals[0];
    insights.push({
      title: "Behavior friction",
      body: `${topFriction.label} showed ${topFriction.displayValue}; inspect the related Clarity recording/heatmap before changing layout.`,
      tone: topFriction.value > 0 ? "opportunity" : "good",
    });
  } else if (!clarity.configured) {
    insights.push({
      title: "Clarity automation gap",
      body: "Clarity is tracking on the website, but the daily email needs CLARITY_API_TOKEN to include heatmap and friction rows automatically.",
      tone: "setup",
    });
  }

  return insights.slice(0, 9);
}

function extractClarityHighlights(
  metrics: ClarityApiMetric[],
  metricName: string,
  valueKeys: string[],
  limit = 5,
): ClarityHighlight[] {
  const metric = findClarityMetric(metrics, metricName);
  const displayMetricName = humanizeMetricName(metric?.metricName || metricName);

  return (metric?.information || [])
    .map((row) => {
      const value = readClarityNumber(row, valueKeys);
      const label = buildClarityLabel(row);

      return {
        label: `${displayMetricName}: ${label}`,
        value,
        displayValue: formatNumber(value),
        detail: buildClarityDetail(row),
      };
    })
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function findClarityMetric(metrics: ClarityApiMetric[], metricName: string) {
  const target = normalizeMetricName(metricName);

  return metrics.find(
    (metric) => normalizeMetricName(metric.metricName || "") === target,
  );
}

function readClarityNumber(row: ClarityInformationRow, preferredKeys: string[]) {
  for (const key of preferredKeys) {
    const direct = coerceNumber(row[key]);

    if (direct !== null) {
      return direct;
    }

    const matchingKey = Object.keys(row).find(
      (rowKey) => normalizeMetricName(rowKey) === normalizeMetricName(key),
    );
    const matching = matchingKey ? coerceNumber(row[matchingKey]) : null;

    if (matching !== null) {
      return matching;
    }
  }

  const fallback = Object.entries(row)
    .map(([key, value]) => ({
      key,
      value: coerceNumber(value),
    }))
    .filter(
      (entry): entry is { key: string; value: number } =>
        entry.value !== null &&
        !["pagespersessionpercentage", "distantusercount"].includes(
          normalizeMetricName(entry.key),
        ),
    )
    .sort((a, b) => b.value - a.value)[0];

  return fallback?.value || 0;
}

function buildClarityLabel(row: ClarityInformationRow) {
  const parts = [
    row.URL,
    row.Url,
    row.PageUrl,
    row.url,
    row.Device,
    row["Country/Region"],
    row.Country,
    row.OS,
    row.Browser,
    row.Source,
    row.Medium,
    row.Channel,
  ]
    .filter(Boolean)
    .map((part) => shortenText(String(part), 80));

  return Array.from(new Set(parts)).slice(0, 3).join(" / ") || "All traffic";
}

function buildClarityDetail(row: ClarityInformationRow) {
  const sessions =
    coerceNumber(row.totalSessionCount) ||
    coerceNumber(row.sessionsCount) ||
    coerceNumber(row.sessionCount);
  const users =
    coerceNumber(row.distinctUserCount) ||
    coerceNumber(row.distantUserCount) ||
    coerceNumber(row.userCount);
  const views = coerceNumber(row.pagesViews) || coerceNumber(row.pageViews);
  const affectedRate = coerceNumber(row.sessionsWithMetricPercentage);
  const details = [
    sessions ? `${formatNumber(sessions)} sessions` : "",
    users ? `${formatNumber(users)} users` : "",
    views ? `${formatNumber(views)} views` : "",
    affectedRate ? `${formatPercent(affectedRate / 100)} affected sessions` : "",
  ].filter(Boolean);

  return details.join(", ") || undefined;
}

function normalizeMetricName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function humanizeMetricName(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/count$/i, "count")
    .replace(/\s+/g, " ")
    .trim();
}

function coerceNumber(value: string | number | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/,/g, ""));

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function buildReportingWindow(): ReportingWindow {
  const reportDate = getDatePartsInIndia(1);
  const previousDate = getDatePartsInIndia(2);
  const dateLabel = formatIndianDateLabel(reportDate);
  const previousDateLabel = formatIndianDateLabel(previousDate);

  return {
    dateLabel,
    generatedAtLabel: formatGeneratedAt(),
    windowLabel: `${dateLabel}, 12:00 AM-11:59 PM IST`,
    comparisonLabel: `Compared with ${previousDateLabel}`,
    gaDate: formatGaDate(reportDate),
    previousGaDate: formatGaDate(previousDate),
  };
}

function getDatePartsInIndia(daysAgo: number) {
  const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const read = (type: string) => parts.find((part) => part.type === type)?.value || "";

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
  };
}

function formatGaDate(date: { year: string; month: string; day: string }) {
  return `${date.year}-${date.month}-${date.day}`;
}

function formatIndianDateLabel(date: { year: string; month: string; day: string }) {
  const parsed = new Date(`${date.year}-${date.month}-${date.day}T12:00:00+05:30`);

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata",
  }).format(parsed);
}

function formatGeneratedAt() {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date());
}

function renderDigestText(digest: AnalyticsDigest) {
  const lines = [
    digest.subject,
    "",
    `Reporting window: ${digest.windowLabel}`,
    digest.comparisonLabel,
    `Generated: ${digest.generatedAtLabel}`,
    "Scheduled send: 6:30 AM IST",
    "",
    "Executive read",
    ...digest.insights.map((insight) => `- ${insight.title}: ${insight.body}`),
    "",
    "Provider health",
    ...digest.providers.map(
      (provider) =>
        `- ${provider.name}: ${provider.status} - ${provider.headline}. ${provider.detail}`,
    ),
    "",
    digest.configured
      ? [
          "Previous-day scorecard",
          `- Active users: ${formatNumber(digest.summary.activeUsers)} ${formatDelta(digest.comparison.activeUsers)}`,
          `- New users: ${formatNumber(digest.summary.newUsers)} ${formatDelta(digest.comparison.newUsers)}`,
          `- Sessions: ${formatNumber(digest.summary.sessions)} ${formatDelta(digest.comparison.sessions)}`,
          `- Page views: ${formatNumber(digest.summary.pageViews)} ${formatDelta(digest.comparison.pageViews)}`,
          `- Engagement rate: ${formatPercent(digest.summary.engagementRate)}`,
          `- Avg session: ${formatDuration(digest.summary.averageSessionDuration)}`,
          `- Key events: ${formatNumber(digest.summary.keyEvents)} ${formatDelta(digest.comparison.keyEvents)}`,
          "",
          renderTextTable("Top pages", digest.topPages, (row) => {
            const [path, title] = row.dimensions;
            return `${path} - ${title || "Untitled"} (${formatNumber(row.metrics[0])} views, ${formatDuration(row.metrics[2])} avg)`;
          }),
          renderTextTable("Top sources", digest.topSources, (row) => {
            const [channel, source] = row.dimensions;
            return `${channel} / ${source} (${formatNumber(row.metrics[0])} sessions)`;
          }),
          renderTextTable("Top locations", digest.topLocations, (row) => {
            const [country, city] = row.dimensions;
            return `${city}, ${country} (${formatNumber(row.metrics[0])} users)`;
          }),
          renderTextTable("Devices", digest.topDevices, (row) => {
            const [device] = row.dimensions;
            return `${device} (${formatNumber(row.metrics[0])} users, ${formatNumber(row.metrics[1])} views)`;
          }),
          renderTextTable("Events", digest.topEvents, (row) => {
            const [eventName] = row.dimensions;
            return `${eventName} (${formatNumber(row.metrics[0])} events)`;
          }),
        ].join("\n")
      : [
          "Previous-day GA4 scorecard",
          "- Not shown yet. GA4 server credentials are still missing, so the report will not display zeroes that could be mistaken for real traffic.",
        ].join("\n"),
    renderTextList(
      "Clarity traffic / friction (last 24 hours from Clarity API)",
      [...digest.clarity.topTraffic, ...digest.clarity.frictionSignals],
      (row) =>
        `${row.label}: ${row.displayValue}${row.detail ? ` (${row.detail})` : ""}`,
    ),
    "",
    "Vercel",
    `- Environment: ${digest.vercel.environment}`,
    `- Production: ${digest.vercel.productionUrl}`,
    digest.vercel.deploymentUrl ? `- Deployment: ${digest.vercel.deploymentUrl}` : "",
    digest.vercel.region ? `- Region: ${digest.vercel.region}` : "",
    digest.vercel.commitSha ? `- Commit: ${digest.vercel.commitSha}` : "",
    `- Dashboard: ${digest.vercel.dashboardUrl}`,
    "",
    "Notes",
    "- Visitors are anonymous. Names are not available unless a visitor signs in or knowingly submits a form.",
    "- GA4 is the automated source for previous calendar-day users, sessions, pages, sources, locations, and devices.",
    "- Clarity's Data Export API returns the last 24 hours at run time; heatmaps and recordings remain in the Clarity dashboard.",
    "- Vercel Web Analytics and Speed Insights support CSV/dashboard export; this email includes Vercel deployment context unless a data drain/export is added.",
  ];

  if (digest.setupNotes.length) {
    lines.push("", "Setup notes", ...digest.setupNotes.map((note) => `- ${note}`));
  }

  return lines.filter(Boolean).join("\n");
}

function renderDigestHtml(digest: AnalyticsDigest) {
  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #1f2723; line-height: 1.5; max-width: 720px;">
      <p style="color: #647067; margin: 0 0 6px; text-transform: uppercase; letter-spacing: .08em; font-size: 12px;">Previous-day portfolio intelligence</p>
      <h1 style="font-size: 24px; margin: 0 0 10px;">Portfolio analytics brief</h1>
      <div style="border: 1px solid #e7ebe7; border-radius: 10px; padding: 12px 14px; margin: 0 0 18px; background: #fbfcfb;">
        <p style="margin: 0 0 4px;"><strong>Reporting window:</strong> ${escapeHtml(digest.windowLabel)}</p>
        <p style="margin: 0 0 4px; color: #647067;">${escapeHtml(digest.comparisonLabel)}</p>
        <p style="margin: 0; color: #647067;">Generated ${escapeHtml(digest.generatedAtLabel)}. Daily scheduled send: 6:30 AM IST.</p>
      </div>
      ${digest.configured ? "" : renderNotice(digest.setupNotes)}
      ${renderInsightsHtml(digest.insights)}
      ${renderProvidersHtml(digest.providers)}
      ${digest.configured ? renderGaMetricsHtml(digest) : renderGaPendingHtml()}
      ${renderClarityHtml(digest.clarity)}
      ${renderVercelHtml(digest.vercel)}
      <p style="color: #647067; font-size: 13px; margin-top: 22px;">
        Visitors are anonymous. Names are not available unless a visitor signs in or knowingly submits a form.
        GA4 powers the previous calendar-day scorecard. Microsoft Clarity's API contributes last-24-hours behavior signals, while heatmaps and recordings remain in the Clarity dashboard.
        Vercel Web Analytics and Speed Insights remain available in the Vercel dashboard/CSV export flow.
      </p>
    </div>
  `;
}

function renderWhatsAppDigest(digest: AnalyticsDigest) {
  const locations = digest.topLocations
    .slice(0, 3)
    .map((row) => {
      const [country, city] = row.dimensions;
      return `${city}, ${country}`;
    })
    .join("; ");
  const pages = digest.topPages
    .slice(0, 3)
    .map((row) => row.dimensions[0])
    .join("; ");

  return [
    `Portfolio analytics - ${digest.dateLabel}`,
    `Visitors: ${formatNumber(digest.summary.activeUsers)} ${formatDelta(digest.comparison.activeUsers)}`,
    `Views: ${formatNumber(digest.summary.pageViews)} ${formatDelta(digest.comparison.pageViews)}`,
    `Engagement: ${formatPercent(digest.summary.engagementRate)}`,
    locations ? `Top locations: ${locations}` : "",
    pages ? `Top pages: ${pages}` : "",
    digest.configured ? "" : `Setup needed: ${digest.setupNotes[0]}`,
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 1200);
}

function renderInsightsHtml(insights: Insight[]) {
  if (!insights.length) {
    return "";
  }

  return `
    <h2 style="font-size: 17px; margin: 24px 0 8px;">Executive read</h2>
    <div style="border: 1px solid #e7ebe7; border-radius: 10px; overflow: hidden; margin-bottom: 22px;">
      ${insights
        .map(
          (insight) => `
            <div style="border-bottom: 1px solid #e7ebe7; padding: 12px 14px;">
              <p style="font-size: 12px; color: ${getInsightColor(insight.tone)}; text-transform: uppercase; letter-spacing: .08em; margin: 0 0 4px;">${escapeHtml(insight.tone)}</p>
              <strong>${escapeHtml(insight.title)}</strong>
              <p style="color: #3b463f; margin: 4px 0 0;">${escapeHtml(insight.body)}</p>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderProvidersHtml(providers: ProviderDigest[]) {
  return `
    <h2 style="font-size: 17px; margin: 24px 0 8px;">Provider health</h2>
    <table style="border-collapse: collapse; width: 100%; margin-bottom: 22px;">
      <tbody>
        ${providers
          .map(
            (provider) => `
              <tr>
                <td style="border-bottom: 1px solid #e7ebe7; padding: 10px 10px 10px 0; vertical-align: top;">
                  <strong>${escapeHtml(provider.name)}</strong><br />
                  <span style="color: ${getProviderColor(provider.status)}; font-size: 12px; text-transform: uppercase; letter-spacing: .08em;">${escapeHtml(provider.status)}</span>
                </td>
                <td style="border-bottom: 1px solid #e7ebe7; padding: 10px 0; vertical-align: top;">
                  <strong>${escapeHtml(provider.headline)}</strong>
                  <p style="color: #647067; margin: 3px 0 0;">${escapeHtml(provider.detail)}</p>
                  ${provider.dashboardUrl ? `<a href="${escapeHtml(provider.dashboardUrl)}" style="color: #1f5f4a;">Open dashboard</a>` : ""}
                </td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderGaMetricsHtml(digest: AnalyticsDigest) {
  return `
    <h2 style="font-size: 17px; margin: 24px 0 8px;">Previous-day scorecard</h2>
    <table style="border-collapse: collapse; width: 100%; margin: 0 0 22px;">
      <tbody>
        ${renderMetricRow("Active users", formatNumber(digest.summary.activeUsers), formatDelta(digest.comparison.activeUsers))}
        ${renderMetricRow("New users", formatNumber(digest.summary.newUsers), formatDelta(digest.comparison.newUsers))}
        ${renderMetricRow("Sessions", formatNumber(digest.summary.sessions), formatDelta(digest.comparison.sessions))}
        ${renderMetricRow("Page views", formatNumber(digest.summary.pageViews), formatDelta(digest.comparison.pageViews))}
        ${renderMetricRow("Engagement rate", formatPercent(digest.summary.engagementRate), "")}
        ${renderMetricRow("Avg session", formatDuration(digest.summary.averageSessionDuration), "")}
        ${renderMetricRow("Key events", formatNumber(digest.summary.keyEvents), formatDelta(digest.comparison.keyEvents))}
      </tbody>
    </table>
    ${renderHtmlTable("Top pages", digest.topPages, (row) => {
      const [path, title] = row.dimensions;
      return [path, title || "Untitled", `${formatNumber(row.metrics[0])} views`, `${formatDuration(row.metrics[2])} avg`];
    })}
    ${renderHtmlTable("Top sources", digest.topSources, (row) => {
      const [channel, source] = row.dimensions;
      return [channel, source, `${formatNumber(row.metrics[0])} sessions`, `${formatNumber(row.metrics[1])} users`];
    })}
    ${renderHtmlTable("Top locations", digest.topLocations, (row) => {
      const [country, city] = row.dimensions;
      return [city, country, `${formatNumber(row.metrics[0])} users`, `${formatNumber(row.metrics[1])} sessions`];
    })}
    ${renderHtmlTable("Devices", digest.topDevices, (row) => {
      const [device] = row.dimensions;
      return [device, `${formatNumber(row.metrics[0])} users`, `${formatNumber(row.metrics[1])} views`];
    })}
    ${renderHtmlTable("Events", digest.topEvents, (row) => {
      const [eventName] = row.dimensions;
      return [eventName, `${formatNumber(row.metrics[0])} events`, `${formatNumber(row.metrics[1])} users`];
    })}
  `;
}

function renderGaPendingHtml() {
  return `
    <h2 style="font-size: 17px; margin: 24px 0 8px;">Previous-day GA4 scorecard</h2>
    <div style="border: 1px solid #e7ebe7; border-radius: 10px; padding: 14px; margin-bottom: 22px;">
      <strong>Automated GA4 metrics unavailable</strong>
      <p style="color: #647067; margin: 6px 0 0;">
        I am not showing zero visitors, zero views, or empty tables here because GA4 service-account access is not connected yet.
        Once that credential is added, this section will show previous-day users, new users, sessions, page views, sources, pages, locations, devices, events, and day-over-day movement.
      </p>
    </div>
  `;
}

function renderClarityHtml(clarity: ClarityDigest) {
  return `
    <h2 style="font-size: 17px; margin: 24px 0 8px;">Microsoft Clarity</h2>
    <p style="color: #647067; margin: 0 0 10px;">${escapeHtml(clarity.summary)}</p>
    <p style="color: #647067; font-size: 12px; margin: -4px 0 10px;">Window: last 24 hours at report run time. Clarity's Data Export API does not expose a midnight-to-midnight custom date range.</p>
    ${renderHighlightTable("Traffic and behavior", [
      ...clarity.topTraffic,
      ...clarity.frictionSignals,
    ])}
    ${
      clarity.dashboardUrl
        ? `<p style="margin: 10px 0 0;"><a href="${escapeHtml(clarity.dashboardUrl)}" style="color: #1f5f4a;">Open Clarity dashboard</a></p>`
        : ""
    }
  `;
}

function renderVercelHtml(vercel: VercelDigest) {
  const rows = [
    ["Environment", vercel.environment],
    ["Production", vercel.productionUrl],
    ["Deployment", vercel.deploymentUrl || "Not available in local runs"],
    ["Region", vercel.region || "Assigned by Vercel at runtime"],
    ["Commit", vercel.commitSha || "Not available"],
  ];

  return `
    <h2 style="font-size: 17px; margin: 24px 0 8px;">Vercel</h2>
    <p style="color: #647067; margin: 0 0 10px;">${escapeHtml(vercel.summary)}</p>
    <table style="border-collapse: collapse; width: 100%;">
      <tbody>
        ${rows
          .map(
            ([label, value]) => `
              <tr>
                <td style="border-bottom: 1px solid #e7ebe7; color: #647067; padding: 8px 10px 8px 0;">${escapeHtml(label)}</td>
                <td style="border-bottom: 1px solid #e7ebe7; padding: 8px 0;">${escapeHtml(value)}</td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
    <p style="margin: 10px 0 0;"><a href="${escapeHtml(vercel.dashboardUrl)}" style="color: #1f5f4a;">Open Vercel analytics</a></p>
  `;
}

function renderHighlightTable(title: string, rows: ClarityHighlight[]) {
  if (!rows.length) {
    return `<p style="color: #647067; margin: 0 0 12px;">No automated Clarity rows yet.</p>`;
  }

  return `
    <h3 style="font-size: 14px; margin: 12px 0 6px;">${escapeHtml(title)}</h3>
    <table style="border-collapse: collapse; width: 100%;">
      <tbody>
        ${rows
          .map(
            (row) => `
              <tr>
                <td style="border-bottom: 1px solid #e7ebe7; padding: 8px 10px 8px 0; vertical-align: top;">${escapeHtml(row.label)}</td>
                <td style="border-bottom: 1px solid #e7ebe7; padding: 8px 0; text-align: right; font-weight: 700;">${escapeHtml(row.displayValue)}</td>
              </tr>
              ${
                row.detail
                  ? `<tr><td colspan="2" style="color: #647067; font-size: 12px; padding: 0 0 8px;">${escapeHtml(row.detail)}</td></tr>`
                  : ""
              }
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderMetricRow(label: string, value: string, delta: string) {
  return `
    <tr>
      <td style="border-bottom: 1px solid #e7ebe7; padding: 10px 0; color: #647067;">${escapeHtml(label)}</td>
      <td style="border-bottom: 1px solid #e7ebe7; padding: 10px 0; text-align: right; font-weight: 700;">${escapeHtml(value)}</td>
      <td style="border-bottom: 1px solid #e7ebe7; padding: 10px 0 10px 14px; text-align: right; color: #647067;">${escapeHtml(delta)}</td>
    </tr>
  `;
}

function renderNotice(notes: string[]) {
  return `
    <div style="background: #fff6de; border: 1px solid #f1d38a; border-radius: 8px; padding: 12px 14px; margin-bottom: 18px;">
      <strong>Access needed before GA4 numbers can be analyzed</strong>
      <ul style="margin: 8px 0 0 18px; padding: 0;">
        ${notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}
      </ul>
    </div>
  `;
}

function renderHtmlTable(
  title: string,
  rows: ReportRow[],
  mapRow: (row: ReportRow) => string[],
) {
  if (!rows.length) {
    return `
      <h2 style="font-size: 17px; margin: 24px 0 8px;">${escapeHtml(title)}</h2>
      <p style="color: #647067; margin: 0 0 12px;">No data for this section yet.</p>
    `;
  }

  return `
    <h2 style="font-size: 17px; margin: 24px 0 8px;">${escapeHtml(title)}</h2>
    <table style="border-collapse: collapse; width: 100%;">
      <tbody>
        ${rows
          .map((row) => {
            const cells = mapRow(row);

            return `
              <tr>
                ${cells
                  .map(
                    (cell) =>
                      `<td style="border-bottom: 1px solid #e7ebe7; padding: 8px 10px 8px 0; vertical-align: top;">${escapeHtml(cell)}</td>`,
                  )
                  .join("")}
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

function renderTextTable(
  title: string,
  rows: ReportRow[],
  mapRow: (row: ReportRow) => string,
) {
  if (!rows.length) {
    return `${title}\n- No data yet.`;
  }

  return [
    title,
    ...rows.map((row, index) => `${index + 1}. ${mapRow(row)}`),
  ].join("\n");
}

function renderTextList<T>(
  title: string,
  rows: T[],
  mapRow: (row: T) => string,
) {
  if (!rows.length) {
    return `${title}\n- No data yet.`;
  }

  return [
    title,
    ...rows.map((row, index) => `${index + 1}. ${mapRow(row)}`),
  ].join("\n");
}

function formatDelta(delta: number | null | undefined) {
  if (delta === undefined) {
    return "";
  }

  if (delta === null) {
    return "(new activity)";
  }

  if (Math.abs(delta) < 0.05) {
    return "(flat vs previous day)";
  }

  const sign = delta > 0 ? "+" : "";

  return `(${sign}${delta.toFixed(1)}% vs previous day)`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0s";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  if (!minutes) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

function getInsightColor(tone: InsightTone) {
  switch (tone) {
    case "good":
      return "#1f7a4d";
    case "opportunity":
      return "#9a5b00";
    case "setup":
      return "#9b2c2c";
    default:
      return "#647067";
  }
}

function getProviderColor(status: ProviderStatus) {
  switch (status) {
    case "connected":
      return "#1f7a4d";
    case "failed":
      return "#9b2c2c";
    case "needs_config":
      return "#9a5b00";
    default:
      return "#647067";
  }
}

function shortenText(value: string, limit: number) {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit - 1)}...`;
}

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
