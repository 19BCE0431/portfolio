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

export type AnalyticsDigest = {
  configured: boolean;
  dateLabel: string;
  propertyId?: string;
  subject: string;
  summary: MetricSummary;
  comparison: Partial<Record<keyof MetricSummary, number | null>>;
  topPages: ReportRow[];
  topSources: ReportRow[];
  topLocations: ReportRow[];
  topDevices: ReportRow[];
  topEvents: ReportRow[];
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
  const dateLabel = formatYesterday();

  if (!propertyId) {
    return createSetupDigest(dateLabel, "GA4_PROPERTY_ID is missing.");
  }

  try {
    const [current, previous, topPages, topSources, topLocations, topDevices, topEvents] =
      await Promise.all([
        fetchSummary(propertyId, "yesterday"),
        fetchSummary(propertyId, "2daysAgo"),
        fetchRows(propertyId, ["unifiedPagePathScreen", "pageTitle"], [
          "screenPageViews",
          "activeUsers",
          "averageSessionDuration",
        ]),
        fetchRows(propertyId, ["sessionDefaultChannelGroup", "sessionSourceMedium"], [
          "sessions",
          "activeUsers",
        ]),
        fetchRows(propertyId, ["country", "city"], ["activeUsers", "sessions"]),
        fetchRows(propertyId, ["deviceCategory"], ["activeUsers", "screenPageViews"]),
        fetchRows(propertyId, ["eventName"], ["eventCount", "activeUsers"], 8),
      ]);

    const subject = `Portfolio analytics: ${current.activeUsers} visitors, ${current.pageViews} views (${dateLabel})`;

    return {
      configured: true,
      dateLabel,
      propertyId,
      subject,
      summary: current,
      comparison: buildComparison(current, previous),
      topPages,
      topSources,
      topLocations,
      topDevices,
      topEvents,
      setupNotes: [],
    };
  } catch (error) {
    return createSetupDigest(
      dateLabel,
      error instanceof Error ? error.message : "Google Analytics Data API failed.",
      propertyId,
    );
  }
}

export async function sendAnalyticsEmail(digest: AnalyticsDigest): Promise<DeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.ANALYTICS_EMAIL_FROM?.trim();
  const to = process.env.ANALYTICS_EMAIL_TO?.trim() || "cm.mohhithh@gmail.com";

  if (!apiKey || !from || !to) {
    return {
      status: "skipped",
      reason: "Missing RESEND_API_KEY, ANALYTICS_EMAIL_FROM, or ANALYTICS_EMAIL_TO.",
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
  limit = 6,
): Promise<ReportRow[]> {
  const [response] = await getAnalyticsClient().runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
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

function createSetupDigest(
  dateLabel: string,
  note: string,
  propertyId?: string,
): AnalyticsDigest {
  return {
    configured: false,
    dateLabel,
    propertyId,
    subject: `Portfolio analytics setup needs attention (${dateLabel})`,
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
    topPages: [],
    topSources: [],
    topLocations: [],
    topDevices: [],
    topEvents: [],
    setupNotes: [
      note,
      "Add GA4 Data API credentials and grant the service account Viewer access to your GA4 property.",
    ],
  };
}

function formatYesterday() {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata",
  }).format(yesterday);
}

function renderDigestText(digest: AnalyticsDigest) {
  const lines = [
    digest.subject,
    "",
    `Date: ${digest.dateLabel}`,
    "",
    "Summary",
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
    "",
    "Notes",
    "- Visitors are anonymous. Names are not available unless a visitor signs in or knowingly submits a form.",
    "- Clarity heatmaps and recordings live in the Microsoft Clarity dashboard after NEXT_PUBLIC_CLARITY_PROJECT_ID is set.",
  ];

  if (digest.setupNotes.length) {
    lines.push("", "Setup notes", ...digest.setupNotes.map((note) => `- ${note}`));
  }

  return lines.filter(Boolean).join("\n");
}

function renderDigestHtml(digest: AnalyticsDigest) {
  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #1f2723; line-height: 1.5; max-width: 720px;">
      <p style="color: #647067; margin: 0 0 6px;">${escapeHtml(digest.dateLabel)}</p>
      <h1 style="font-size: 24px; margin: 0 0 18px;">Portfolio analytics digest</h1>
      ${digest.configured ? "" : renderNotice(digest.setupNotes)}
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
      <p style="color: #647067; font-size: 13px; margin-top: 22px;">
        Visitors are anonymous. Names are not available unless a visitor signs in or knowingly submits a form.
        Microsoft Clarity provides heatmaps and session recordings separately after the Clarity project ID is configured.
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
      <strong>Setup needed</strong>
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

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
