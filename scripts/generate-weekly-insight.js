#!/usr/bin/env node

const fs = require("node:fs/promises");
const { existsSync } = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_TIME_ZONE = "Asia/Kolkata";

const OUTPUT_DIRS = {
  researchNotes: path.join(ROOT, "content", "research-notes"),
  journal: path.join(ROOT, "content", "journal"),
  linkedinDrafts: path.join(ROOT, "content", "linkedin-drafts"),
  generatedAssets: path.join(ROOT, "content", "generated-assets"),
  analytics: path.join(ROOT, "content", "analytics"),
  analyticsReports: path.join(ROOT, "content", "analytics", "reports"),
};

const ANALYTICS_FILES = {
  linkedIn: path.join(ROOT, "content", "analytics", "linkedin-performance.csv"),
  journal: path.join(ROOT, "content", "analytics", "journal-performance.csv"),
};

const WEEKLY_CATEGORIES = [
  "AI & Business",
  "Product Strategy",
  "Indian Consumer Behavior",
  "Market Signals",
  "Brand & Marketing Lessons",
  "Business History with Modern Relevance",
  "MBA Learning Notes",
  "Data Science Applied to Decisions",
];

const CONTENT_PILLARS = [
  {
    category: "AI & Business",
    audienceValue: "how AI changes work, pricing, adoption, marketing, or decision-making",
  },
  {
    category: "Product Strategy",
    audienceValue: "what product choices reveal about distribution, friction, behavior, and timing",
  },
  {
    category: "Indian Consumer Behavior",
    audienceValue: "how Indian customers choose, trust, save, spend, switch, or repeat",
  },
  {
    category: "Market Signals",
    audienceValue: "how pricing, supply chains, macro events, and category shifts shape decisions",
  },
  {
    category: "Brand & Marketing Lessons",
    audienceValue: "how brands create memory, trust, value perception, and behavior change",
  },
  {
    category: "Business History with Modern Relevance",
    audienceValue: "older business decisions that still affect today's markets, money, and choices",
  },
  {
    category: "MBA Learning Notes",
    audienceValue: "what a student can learn from a current business event without turning it into exam prep",
  },
  {
    category: "Data Science Applied to Decisions",
    audienceValue: "how data, automation, and analytics improve judgment instead of becoming dashboards for their own sake",
  },
];

const DISCOVERY_QUERIES = [
  {
    query: '("AI" OR "artificial intelligence") ("product" OR "workflow" OR "marketing") ("India" OR "business")',
    categoryHint: "AI & Business",
    lens: "AI workflow adoption and business impact",
  },
  {
    query: '("quick commerce" OR "ecommerce" OR "retail") ("India" OR "Indian consumers") ("strategy" OR "pricing" OR "brand")',
    categoryHint: "Indian Consumer Behavior",
    lens: "Indian consumer behavior and product strategy",
  },
  {
    query: '("product strategy" OR "pricing strategy" OR "distribution") ("brand" OR "consumer behavior" OR "market signal")',
    categoryHint: "Product Strategy",
    lens: "product, pricing, and distribution lessons",
  },
  {
    query: '("supply chain" OR "shipping route" OR "gold" OR "lithium" OR "rupee") ("India" OR "inflation" OR "business")',
    categoryHint: "Market Signals",
    lens: "business history, market signals, and India relevance",
  },
  {
    query: '("OpenAI" OR "Google AI" OR "Microsoft AI") ("students" OR "marketing" OR "business" OR "product managers")',
    categoryHint: "AI & Business",
    lens: "AI product moves through an MBA and early-career lens",
  },
];

const TOPIC_SCORE_WEIGHTS = {
  usefulness: 1.3,
  novelty: 1,
  shareability: 1,
  commentPotential: 0.95,
  clarity: 1,
  credibility: 1.15,
  visualPotential: 0.7,
  personalFit: 1.2,
  historicalFit: 0.8,
};

const BANNED_STYLE_PHRASES = [
  "in today's fast-paced world",
  "ai is changing everything",
  "game changer",
  "revolutionizing",
  "unlocking potential",
  "dynamic landscape",
];

const RSS_FEEDS = [
  {
    name: "OpenAI News",
    url: "https://openai.com/news/rss.xml",
    category: "AI & Business",
  },
  {
    name: "Google AI Blog",
    url: "https://blog.google/technology/ai/rss/",
    category: "AI & Business",
  },
  {
    name: "Microsoft AI Blog",
    url: "https://blogs.microsoft.com/ai/feed/",
    category: "Data Science Applied to Decisions",
  },
  {
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    category: "Market Signals",
  },
];

const FALLBACK_TOPICS = [
  {
    title: "Why OpenAI's latest product moves matter for Indian MBA students",
    category: "AI & Business",
    summary:
      "Use this only as a review scaffold when live discovery is unavailable. The angle is how AI product changes affect student workflows, marketing work, and early product careers.",
    sourceLinks: [
      {
        title: "Google News search: OpenAI product launch business students India",
        url: "https://news.google.com/search?q=OpenAI%20product%20launch%20business%20students%20India",
        publisher: "Google News",
        datePublished: "",
        accessed: "",
        claimSupported: "Source discovery only. Replace with specific sources before publishing.",
      },
    ],
  },
  {
    title: "What quick commerce teaches about speed as product strategy",
    category: "Product Strategy",
    summary:
      "A review scaffold for studying how speed becomes a product promise, a cost structure, and a consumer habit in Indian markets.",
    sourceLinks: [
      {
        title: "Google News search: quick commerce India speed product strategy",
        url: "https://news.google.com/search?q=quick%20commerce%20India%20speed%20product%20strategy",
        publisher: "Google News",
        datePublished: "",
        accessed: "",
        claimSupported: "Source discovery only. Replace with specific sources before publishing.",
      },
    ],
  },
  {
    title: "What Zudio teaches about value fashion and consumer psychology",
    category: "Indian Consumer Behavior",
    summary:
      "A review scaffold for understanding value perception, store experience, and repeat behavior in Indian retail without overclaiming.",
    sourceLinks: [
      {
        title: "Google News search: Zudio value fashion consumer psychology India",
        url: "https://news.google.com/search?q=Zudio%20value%20fashion%20consumer%20psychology%20India",
        publisher: "Google News",
        datePublished: "",
        accessed: "",
        claimSupported: "Source discovery only. Replace with specific sources before publishing.",
      },
    ],
  },
  {
    title: "Why gold is emotional in India, not just financial",
    category: "Indian Consumer Behavior",
    summary:
      "A review scaffold for connecting culture, trust, family decisions, savings behavior, and market signals around gold.",
    sourceLinks: [
      {
        title: "Google News search: gold India consumer behavior savings culture",
        url: "https://news.google.com/search?q=gold%20India%20consumer%20behavior%20savings%20culture",
        publisher: "Google News",
        datePublished: "",
        accessed: "",
        claimSupported: "Source discovery only. Replace with specific sources before publishing.",
      },
    ],
  },
  {
    title: "How one shipping route can affect inflation",
    category: "Market Signals",
    summary:
      "A review scaffold for explaining how distant logistics shocks move through costs, pricing, and consumer decisions.",
    sourceLinks: [
      {
        title: "Google News search: shipping route inflation India business prices",
        url: "https://news.google.com/search?q=shipping%20route%20inflation%20India%20business%20prices",
        publisher: "Google News",
        datePublished: "",
        accessed: "",
        claimSupported: "Source discovery only. Replace with specific sources before publishing.",
      },
    ],
  },
  {
    title: "Why the 1944 Bretton Woods meeting still affects your rupee today",
    category: "Business History with Modern Relevance",
    summary:
      "A review scaffold for turning business history into a modern explanation of currency, trade, and policy signals.",
    sourceLinks: [
      {
        title: "Google News search: Bretton Woods rupee dollar system business history",
        url: "https://news.google.com/search?q=Bretton%20Woods%20rupee%20dollar%20system%20business%20history",
        publisher: "Google News",
        datePublished: "",
        accessed: "",
        claimSupported: "Source discovery only. Replace with specific sources before publishing.",
      },
    ],
  },
  {
    title: "How pricing becomes a market signal",
    category: "Market Signals",
    summary:
      "A review scaffold for studying how price communicates scarcity, quality, positioning, and willingness to pay.",
    sourceLinks: [
      {
        title: "Google News search: pricing as market signal business strategy",
        url: "https://news.google.com/search?q=pricing%20as%20market%20signal%20business%20strategy",
        publisher: "Google News",
        datePublished: "",
        accessed: "",
        claimSupported: "Source discovery only. Replace with specific sources before publishing.",
      },
    ],
  },
  {
    title: "Why India's lithium story matters for business learners",
    category: "Market Signals",
    summary:
      "A review scaffold for connecting resources, supply chains, EV economics, policy, and long-term market positioning.",
    sourceLinks: [
      {
        title: "Google News search: India lithium discovery business EV supply chain",
        url: "https://news.google.com/search?q=India%20lithium%20discovery%20business%20EV%20supply%20chain",
        publisher: "Google News",
        datePublished: "",
        accessed: "",
        claimSupported: "Source discovery only. Replace with specific sources before publishing.",
      },
    ],
  },
];

main().catch((error) => {
  console.error("Weekly insight generation failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

async function main() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const args = parseArgs(process.argv.slice(2));
  const date = args.date || localDate(new Date());
  const autoPublish = Boolean(
    args.publish || process.env.WEEKLY_INSIGHT_AUTO_PUBLISH === "true",
  );
  const status = resolveStatus(
    args.status || process.env.WEEKLY_INSIGHT_STATUS || "review",
    autoPublish,
  );
  const dryRun = Boolean(args["dry-run"]);
  const useAi = Boolean(
    args["use-ai"] || (!dryRun && process.env.WEEKLY_INSIGHT_USE_OPENAI === "true"),
  );
  const manifestPath = args.manifest ? path.resolve(ROOT, String(args.manifest)) : "";
  const forcedTopic = args.topic ? String(args.topic) : "";

  await ensureOutputDirs();
  const performanceInsights = await loadPerformanceInsights();

  const candidate = forcedTopic
    ? prepareManualCandidate(forcedTopic, date, performanceInsights)
    : await discoverBestTopic(date, performanceInsights);

  const draft = await createDraft(candidate, {
    date,
    status,
    autoPublish,
    useAi,
    portfolioBaseUrl: process.env.WEEKLY_INSIGHT_PORTFOLIO_BASE_URL || "",
    performanceInsights,
  });

  const files = await buildOutputFiles(draft, candidate, { date, status });
  const manifest = buildManifest(draft, candidate, files, { date, status });

  if (dryRun) {
    printDryRun(candidate, files, manifest);
    return;
  }

  await writeFiles(files);
  if (manifestPath) {
    await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  }
  printSuccess(candidate, files, manifestPath);
}

function parseArgs(argv) {
  const result = {};

  for (let index = 0; index < argv.length; index += 1) {
    const raw = argv[index];
    if (!raw.startsWith("--")) {
      continue;
    }

    const withoutPrefix = raw.slice(2);
    const [key, inlineValue] = withoutPrefix.split("=");

    if (inlineValue !== undefined) {
      result[key] = inlineValue;
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      result[key] = true;
      continue;
    }

    result[key] = next;
    index += 1;
  }

  return result;
}

function loadEnvFile(fileName) {
  const filePath = path.join(ROOT, fileName);
  if (!existsSync(filePath)) {
    return;
  }

  const raw = require("node:fs").readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [key, ...valueParts] = trimmed.split("=");
    if (process.env[key]) {
      continue;
    }

    process.env[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
  }
}

async function ensureOutputDirs() {
  await Promise.all(Object.values(OUTPUT_DIRS).map((dir) => fs.mkdir(dir, { recursive: true })));
}

function resolveStatus(status, autoPublish) {
  if (autoPublish) {
    return "published";
  }

  if (status === "draft" || status === "review") {
    return status;
  }

  return "review";
}

async function discoverBestTopic(date, performanceInsights = emptyPerformanceInsights()) {
  const [serpCandidates, newsCandidates, rssCandidates] = await Promise.all([
    fetchSerpApiCandidates(date),
    fetchNewsApiCandidates(date),
    fetchRssCandidates(date),
  ]);

  const candidates = dedupeCandidates([
    ...serpCandidates,
    ...newsCandidates,
    ...rssCandidates,
    ...FALLBACK_TOPICS.map((topic) => ({ ...topic, accessed: date, fallback: true })),
  ]);

  const scored = candidates
    .map((candidate) => {
      const enriched = withResearchSourceHints(candidate, date);
      const topicScore = scoreCandidate(enriched, date, performanceInsights);
      return {
        ...enriched,
        topicScore,
        score: topicScore.total,
      };
    })
    .sort((first, second) => second.score - first.score);

  const selected = scored[0];
  return {
    ...selected,
    candidatePool: scored.slice(0, 8).map(toCandidateScoreSummary),
    performanceInsights: summarizePerformanceInsights(performanceInsights),
    selectedTopicRationale: buildSelectionRationale(selected),
  };
}

async function fetchSerpApiCandidates(date) {
  if (!process.env.SERP_API_KEY) {
    return [];
  }

  const batches = await Promise.all(
    DISCOVERY_QUERIES.map(async (discovery) => {
      const url = new URL("https://serpapi.com/search.json");
      url.searchParams.set("engine", "google_news");
      url.searchParams.set("q", discovery.query);
      url.searchParams.set("api_key", process.env.SERP_API_KEY);

      try {
        const data = await fetchJson(url.toString());
        const results = Array.isArray(data.news_results) ? data.news_results : [];

        return results.slice(0, 6).map((item) => ({
          title: cleanText(item.title || "Untitled news result"),
          url: item.link || "",
          publisher: item.source || "Google News",
          datePublished: item.date || "",
          accessed: date,
          summary: cleanText(item.snippet || ""),
          category: inferCategory(`${item.title || ""} ${item.snippet || ""}`) || discovery.categoryHint,
          discoveryQuery: discovery.query,
          topicLens: discovery.lens,
          sourceLinks: [
            {
              title: cleanText(item.title || "Google News result"),
              url: item.link || "",
              publisher: item.source || "Google News",
              datePublished: item.date || "",
              accessed: date,
              claimSupported: `Discovery source for ${discovery.lens}. Verify factual claims before publishing.`,
            },
          ],
        }));
      } catch (error) {
        console.warn(`SERP API source collection skipped for ${discovery.categoryHint}: ${readableError(error)}`);
        return [];
      }
    }),
  );

  return batches.flat();
}

async function fetchNewsApiCandidates(date) {
  if (!process.env.NEWS_API_KEY) {
    return [];
  }

  const batches = await Promise.all(
    DISCOVERY_QUERIES.map(async (discovery) => {
      const url = new URL("https://newsapi.org/v2/everything");
      url.searchParams.set("q", discovery.query);
      url.searchParams.set("language", "en");
      url.searchParams.set("sortBy", "publishedAt");
      url.searchParams.set("pageSize", "6");
      url.searchParams.set("apiKey", process.env.NEWS_API_KEY);

      try {
        const data = await fetchJson(url.toString());
        const articles = Array.isArray(data.articles) ? data.articles : [];

        return articles.map((article) => ({
          title: cleanText(article.title || "Untitled article"),
          url: article.url || "",
          publisher: article.source?.name || "News API",
          datePublished: article.publishedAt || "",
          accessed: date,
          summary: cleanText(article.description || ""),
          category: inferCategory(`${article.title || ""} ${article.description || ""}`) || discovery.categoryHint,
          discoveryQuery: discovery.query,
          topicLens: discovery.lens,
          sourceLinks: [
            {
              title: cleanText(article.title || "News API article"),
              url: article.url || "",
              publisher: article.source?.name || "News API",
              datePublished: article.publishedAt || "",
              accessed: date,
              claimSupported: `Discovery source for ${discovery.lens}. Verify factual claims before publishing.`,
            },
          ],
        }));
      } catch (error) {
        console.warn(`News API source collection skipped for ${discovery.categoryHint}: ${readableError(error)}`);
        return [];
      }
    }),
  );

  return batches.flat();
}

async function fetchRssCandidates(date) {
  const results = await Promise.all(
    RSS_FEEDS.map(async (feed) => {
      try {
        const response = await fetchWithTimeout(feed.url);
        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }

        const xml = await response.text();
        return parseFeedItems(xml, feed).slice(0, 8).map((item) => ({
          ...item,
          accessed: date,
          sourceLinks: [
            {
              title: item.title,
              url: item.url,
              publisher: feed.name,
              datePublished: item.datePublished,
              accessed: date,
              claimSupported: "Primary or credible source for topic discovery. Verify detailed claims before publishing.",
            },
          ],
        }));
      } catch (error) {
        console.warn(`${feed.name} feed skipped: ${readableError(error)}`);
        return [];
      }
    }),
  );

  return results.flat();
}

function parseFeedItems(xml, feed) {
  const blocks =
    xml.match(/<item[\s\S]*?<\/item>/gi) ||
    xml.match(/<entry[\s\S]*?<\/entry>/gi) ||
    [];

  return blocks.map((block) => {
    const title = cleanText(extractTag(block, "title") || "Untitled update");
    const atomLink = block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*\/?>/i)?.[1] || "";
    const rssLink = extractTag(block, "link");
    const summary = cleanText(extractTag(block, "description") || extractTag(block, "summary") || extractTag(block, "content"));
    const datePublished = cleanText(extractTag(block, "pubDate") || extractTag(block, "published") || extractTag(block, "updated"));

    return {
      title,
      url: cleanText(atomLink || rssLink || feed.url),
      publisher: feed.name,
      datePublished,
      summary,
      category: feed.category,
    };
  });
}

function extractTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function decodeXml(value) {
  return String(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchJson(url) {
  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchWithTimeout(url, timeoutMs = 9000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "mohit-portfolio-weekly-insight-generator/1.0",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

function dedupeCandidates(candidates) {
  const seen = new Set();
  const clean = [];

  for (const candidate of candidates) {
    const key = slugify(candidate.title || "");
    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    clean.push(candidate);
  }

  return clean;
}

function scoreCandidate(candidate, currentDate, performanceInsights = emptyPerformanceInsights()) {
  const text = `${candidate.title || ""} ${candidate.summary || ""}`.toLowerCase();
  const age = daysOld(candidate.datePublished, currentDate);
  const hasDirectSource = Boolean(candidate.url && !candidate.url.includes("news.google.com/search"));
  const sourceCount = Array.isArray(candidate.sourceLinks) ? candidate.sourceLinks.length : 0;
  const analyticsFit = scoreAnalyticsFit(candidate, performanceInsights);

  const recency = clampScore(age <= 7 ? 10 : age <= 21 ? 8 : age <= 45 ? 5 : 2);
  const indiaRelevance = scoreByTerms(text, ["india", "indian", "rupee", "zudio", "zepto", "swiggy", "gold", "lithium", "retail", "ecommerce"]);
  const businessRelevance = scoreByTerms(text, ["pricing", "market", "business", "strategy", "revenue", "inflation", "brand", "consumer", "supply chain"]);
  const productMarketingLesson = scoreByTerms(text, ["product", "workflow", "adoption", "marketing", "distribution", "friction", "packaging", "launch"]);
  const sourceAvailability = clampScore((hasDirectSource ? 6 : 2) + Math.min(sourceCount, 4));

  const dimensions = {
    usefulness: clampScore(3 + businessRelevance * 0.45 + productMarketingLesson * 0.35 + indiaRelevance * 0.2),
    novelty: clampScore(2 + scoreByTerms(text, ["why", "hidden", "signals", "friction", "behavior", "history", "route", "gold", "lithium", "pricing"]) * 0.7),
    shareability: clampScore(2 + scoreByTerms(text, ["why", "what", "how", "india", "consumer", "students", "mba", "pricing", "gold", "zudio", "zepto"]) * 0.65),
    commentPotential: clampScore(2 + scoreByTerms(text, ["problem", "strategy", "distribution", "pricing", "behavior", "market", "brand", "consumer"]) * 0.65),
    clarity: clampScore(text.length > 40 && text.length < 260 ? 8 : text.length <= 40 ? 6 : 5),
    credibility: sourceAvailability,
    visualPotential: clampScore(2 + scoreByTerms(text, ["map", "route", "gold", "lithium", "pricing", "workflow", "consumer", "brand", "market"]) * 0.75),
    personalFit: clampScore(3 + scoreByTerms(text, ["mba", "student", "product", "marketing", "strategy", "consumer", "ai", "automation", "data", "business"]) * 0.5),
    historicalFit: analyticsFit.historicalFit,
  };

  let total = Object.entries(dimensions).reduce((sum, [key, value]) => {
    return sum + value * (TOPIC_SCORE_WEIGHTS[key] || 1);
  }, 0);

  total += recency * 0.9;
  total += indiaRelevance * 0.55;
  total += businessRelevance * 0.5;
  total += productMarketingLesson * 0.45;
  total += analyticsFit.totalBoost;

  if (candidate.fallback) {
    total -= 7;
  }

  return {
    ...dimensions,
    recency,
    indiaRelevance,
    businessRelevance,
    productMarketingLesson,
    sourceAvailability,
    analyticsBoost: analyticsFit.totalBoost,
    historicalPillarFit: analyticsFit.pillarFit,
    hookPerformance: analyticsFit.hookFit,
    audienceResponse: analyticsFit.audienceResponse,
    total: Math.round(total),
  };
}

function countMatches(text, terms) {
  return terms.reduce((count, term) => count + (text.includes(term) ? 1 : 0), 0);
}

function scoreByTerms(text, terms) {
  return clampScore(countMatches(text, terms) * 2);
}

function clampScore(value) {
  return Math.max(0, Math.min(10, Math.round(value)));
}

async function loadPerformanceInsights() {
  const [linkedInRows, journalRows] = await Promise.all([
    readCsvIfExists(ANALYTICS_FILES.linkedIn),
    readCsvIfExists(ANALYTICS_FILES.journal),
  ]);

  const linkedIn = linkedInRows
    .map(normalizeLinkedInAnalyticsRow)
    .filter((row) => row.postSlug || row.topic);
  const journal = journalRows
    .map(normalizeJournalAnalyticsRow)
    .filter((row) => row.articleSlug);

  return {
    linkedIn,
    journal,
    topPillars: rankAnalyticsGroups(groupAnalyticsBy(linkedIn, "pillar"), scoreLinkedInAnalyticsGroup),
    topHooks: rankAnalyticsGroups(groupAnalyticsBy(linkedIn, "hookType"), scoreLinkedInAnalyticsGroup),
    topFormats: rankAnalyticsGroups(groupAnalyticsBy(linkedIn, "format"), scoreLinkedInAnalyticsGroup),
    topJournalSources: rankAnalyticsGroups(groupAnalyticsBy(journal, "source"), scoreJournalAnalyticsGroup),
    bestTopics: [...linkedIn]
      .sort((first, second) => second.performanceScore - first.performanceScore)
      .slice(0, 8)
      .map((row) => ({
        topic: row.topic,
        pillar: row.pillar,
        hookType: row.hookType,
        format: row.format,
        score: row.performanceScore,
        clicks: row.clicks,
        comments: row.comments,
      })),
  };
}

function emptyPerformanceInsights() {
  return {
    linkedIn: [],
    journal: [],
    topPillars: [],
    topHooks: [],
    topFormats: [],
    topJournalSources: [],
    bestTopics: [],
  };
}

function scoreAnalyticsFit(candidate, performanceInsights = emptyPerformanceInsights()) {
  const category = normalizeCategory(candidate.category || inferCategory(candidate.title));
  const hookType = inferHookType(candidate.title);
  const text = `${candidate.title || ""} ${candidate.summary || ""}`.toLowerCase();

  const pillar = performanceInsights.topPillars.find((item) => item.key === category);
  const hook = performanceInsights.topHooks.find((item) => item.key === hookType);
  const matchingTopic = performanceInsights.bestTopics.find((item) => {
    const topic = String(item.topic || "").toLowerCase();
    return topic && topic.split(/\s+/).some((word) => word.length > 4 && text.includes(word));
  });

  const pillarFit = pillar ? clampScore(4 + pillar.normalizedScore) : 0;
  const hookFit = hook ? clampScore(3 + hook.normalizedScore) : 0;
  const audienceResponse = matchingTopic
    ? clampScore(4 + Math.min(6, matchingTopic.comments + matchingTopic.clicks * 0.4))
    : 0;
  const historicalFit = clampScore(pillarFit * 0.45 + hookFit * 0.25 + audienceResponse * 0.3);

  return {
    pillarFit,
    hookFit,
    audienceResponse,
    historicalFit,
    totalBoost: Math.round(historicalFit * 1.15),
  };
}

function summarizePerformanceInsights(performanceInsights = emptyPerformanceInsights()) {
  return {
    linkedInRows: performanceInsights.linkedIn.length,
    journalRows: performanceInsights.journal.length,
    topPillars: performanceInsights.topPillars.slice(0, 3).map(toAnalyticsSummary),
    topHooks: performanceInsights.topHooks.slice(0, 3).map(toAnalyticsSummary),
    topFormats: performanceInsights.topFormats.slice(0, 3).map(toAnalyticsSummary),
    bestTopics: performanceInsights.bestTopics.slice(0, 3),
  };
}

function toAnalyticsSummary(item) {
  return {
    key: item.key,
    score: item.score,
    count: item.count,
  };
}

async function readCsvIfExists(filePath) {
  if (!existsSync(filePath)) {
    return [];
  }

  const raw = await fs.readFile(filePath, "utf8");
  return parseCsv(raw);
}

function parseCsv(raw) {
  const rows = parseCsvRows(raw).filter((row) => row.some((cell) => cell.trim()));
  if (rows.length <= 1) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((row) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index] ? row[index].trim() : "";
    });
    return record;
  });
}

function parseCsvRows(raw) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    const next = raw[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function normalizeLinkedInAnalyticsRow(row) {
  const impressions = numericValue(row.impressions);
  const reactions = numericValue(row.reactions);
  const comments = numericValue(row.comments);
  const reposts = numericValue(row.reposts);
  const clicks = numericValue(row.clicks);
  const profileVisits = numericValue(row.profileVisits);
  const engagementRate =
    numericValue(row.engagementRate) ||
    (impressions
      ? ((reactions + comments * 2 + reposts * 3 + clicks * 2 + profileVisits) / impressions) * 100
      : 0);

  return {
    ...row,
    impressions,
    reactions,
    comments,
    reposts,
    clicks,
    profileVisits,
    engagementRate,
    performanceScore: Math.round(engagementRate * 10 + comments * 2 + clicks * 1.5 + reposts * 2),
  };
}

function normalizeJournalAnalyticsRow(row) {
  const pageViews = numericValue(row.pageViews);
  const readTime = numericValue(row.readTime);
  const clicksFromLinkedIn = numericValue(row.clicksFromLinkedIn);

  return {
    ...row,
    pageViews,
    readTime,
    clicksFromLinkedIn,
    performanceScore: Math.round(pageViews + clicksFromLinkedIn * 2 + readTime * 0.2),
  };
}

function groupAnalyticsBy(rows, key) {
  return rows.reduce((groups, row) => {
    const groupKey = cleanText(row[key] || "unknown") || "unknown";
    groups[groupKey] = groups[groupKey] || [];
    groups[groupKey].push(row);
    return groups;
  }, {});
}

function rankAnalyticsGroups(groups, scoreFn) {
  const ranked = Object.entries(groups)
    .filter(([key]) => key && key !== "unknown")
    .map(([key, rows]) => ({
      key,
      count: rows.length,
      score: scoreFn(rows),
    }))
    .sort((first, second) => second.score - first.score);

  const topScore = ranked[0]?.score || 0;
  return ranked.map((item) => ({
    ...item,
    normalizedScore: topScore ? clampScore((item.score / topScore) * 10) : 0,
  }));
}

function scoreLinkedInAnalyticsGroup(rows) {
  const impressions = rows.reduce((total, row) => total + numericValue(row.impressions), 0);
  const comments = rows.reduce((total, row) => total + numericValue(row.comments), 0);
  const clicks = rows.reduce((total, row) => total + numericValue(row.clicks), 0);
  const engagement = rows.reduce((total, row) => total + numericValue(row.engagementRate), 0) / rows.length;
  return Math.round(engagement * 10 + comments * 2 + clicks + impressions * 0.01);
}

function scoreJournalAnalyticsGroup(rows) {
  return Math.round(
    rows.reduce((total, row) => total + numericValue(row.pageViews) + numericValue(row.clicksFromLinkedIn) * 2, 0),
  );
}

function inferHookType(title) {
  const lower = String(title || "").trim().toLowerCase();

  if (lower.startsWith("why ")) return "why";
  if (lower.startsWith("what ")) return "what";
  if (lower.startsWith("how ")) return "how";
  if (lower.includes("teaches")) return "lesson";
  if (lower.includes("?")) return "question";
  return "insight";
}

function numericValue(value) {
  const parsed = Number(String(value || "").replace(/%$/, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function withResearchSourceHints(candidate, date) {
  const topic = candidate.title || "";
  const sourceLinks = Array.isArray(candidate.sourceLinks) ? [...candidate.sourceLinks] : [];
  const existingUrls = new Set(sourceLinks.map((source) => source.url).filter(Boolean));

  const hints = [
    {
      title: `Google News search: ${topic}`,
      url: `https://news.google.com/search?q=${encodeURIComponent(topic)}`,
      publisher: "Google News",
      datePublished: "",
      accessed: date,
      claimSupported: "Source discovery only. Use this to find current coverage, then cite specific sources.",
    },
    {
      title: `Google News search: ${topic} India business analysis`,
      url: `https://news.google.com/search?q=${encodeURIComponent(`${topic} India business analysis`)}`,
      publisher: "Google News",
      datePublished: "",
      accessed: date,
      claimSupported: "Source discovery only for India and business relevance. Replace with credible source links before publishing.",
    },
  ];

  for (const hint of hints) {
    if (!existingUrls.has(hint.url)) {
      sourceLinks.push(hint);
      existingUrls.add(hint.url);
    }
  }

  return {
    ...candidate,
    sourceLinks,
  };
}

function toCandidateScoreSummary(candidate) {
  return {
    title: candidate.title,
    category: candidate.category,
    summary: candidate.summary || "",
    total: candidate.topicScore?.total || candidate.score || 0,
    scores: {
      usefulness: candidate.topicScore?.usefulness || 0,
      novelty: candidate.topicScore?.novelty || 0,
      shareability: candidate.topicScore?.shareability || 0,
      commentPotential: candidate.topicScore?.commentPotential || 0,
      clarity: candidate.topicScore?.clarity || 0,
      credibility: candidate.topicScore?.credibility || 0,
      visualPotential: candidate.topicScore?.visualPotential || 0,
      personalFit: candidate.topicScore?.personalFit || 0,
      historicalFit: candidate.topicScore?.historicalFit || 0,
    },
    drivers: {
      recency: candidate.topicScore?.recency || 0,
      indiaRelevance: candidate.topicScore?.indiaRelevance || 0,
      businessRelevance: candidate.topicScore?.businessRelevance || 0,
      productMarketingLesson: candidate.topicScore?.productMarketingLesson || 0,
      sourceAvailability: candidate.topicScore?.sourceAvailability || 0,
      analyticsBoost: candidate.topicScore?.analyticsBoost || 0,
      historicalPillarFit: candidate.topicScore?.historicalPillarFit || 0,
      hookPerformance: candidate.topicScore?.hookPerformance || 0,
      audienceResponse: candidate.topicScore?.audienceResponse || 0,
    },
    sourceCount: Array.isArray(candidate.sourceLinks) ? candidate.sourceLinks.length : 0,
  };
}

function buildSelectionRationale(candidate) {
  const score = candidate.topicScore || {};
  const reasons = [];

  if ((score.usefulness || 0) >= 7) reasons.push("it has a practical learning angle for MBA, product, marketing, or early-career readers");
  if ((score.indiaRelevance || 0) >= 6) reasons.push("it connects to Indian markets or consumer behavior");
  if ((score.commentPotential || 0) >= 7) reasons.push("it can invite a thoughtful discussion rather than a passive news-summary read");
  if ((score.visualPotential || 0) >= 7) reasons.push("it can be supported by a clean visual or carousel");
  if ((score.credibility || 0) >= 6) reasons.push("it has enough source material to begin a review-backed draft");
  if ((score.analyticsBoost || 0) > 0) reasons.push("past content analytics suggest this direction has audience response");

  if (!reasons.length) {
    reasons.push("it is the strongest available topic after balancing relevance, clarity, sources, and portfolio fit");
  }

  return `Selected because ${reasons.join(", ")}.`;
}

function prepareManualCandidate(topic, date, performanceInsights) {
  const enriched = withResearchSourceHints(createManualCandidate(topic, date), date);
  const topicScore = scoreCandidate(enriched, date, performanceInsights);

  return {
    ...enriched,
    topicScore,
    score: topicScore.total,
    candidatePool: [toCandidateScoreSummary({ ...enriched, topicScore, score: topicScore.total })],
    performanceInsights: summarizePerformanceInsights(performanceInsights),
    selectedTopicRationale: buildSelectionRationale({ ...enriched, topicScore }),
  };
}

function daysOld(dateValue, fallbackDate) {
  const parsed = Date.parse(dateValue || "");
  const current = Date.parse(fallbackDate);

  if (Number.isNaN(parsed) || Number.isNaN(current)) {
    return 30;
  }

  return Math.max(0, Math.floor((current - parsed) / 86400000));
}

function createManualCandidate(topic, date) {
  return {
    title: topic,
    url: "",
    publisher: "Manual topic",
    datePublished: date,
    accessed: date,
    summary: "Manual topic supplied from the command line.",
    category: inferCategory(topic),
    sourceLinks: [
      {
        title: `Google News search: ${topic}`,
        url: `https://news.google.com/search?q=${encodeURIComponent(topic)}`,
        publisher: "Google News",
        datePublished: "",
        accessed: date,
        claimSupported: "Source discovery only. Replace with specific sources before publishing.",
      },
    ],
  };
}

async function createDraft(candidate, options) {
  if (options.useAi && process.env.OPENAI_API_KEY) {
    try {
      return await createDraftWithOpenAI(candidate, options);
    } catch (error) {
      console.warn(`OpenAI generation skipped: ${readableError(error)}`);
    }
  }

  return createTemplateDraft(candidate, options);
}

async function createDraftWithOpenAI(candidate, options) {
  const prompt = {
    instruction:
      options.autoPublish
        ? "Create a publication-ready weekly portfolio blog and LinkedIn draft for Mohit. Use only the provided sources. Mark unsupported claims as TODO so validation can block publishing. The topic must be explained through an MBA, product, marketing, Indian business, or consumer-behavior lens."
        : "Create a grounded weekly portfolio blog draft and LinkedIn draft for Mohit. Use only the provided sources. Mark unsupported claims as TODO. The topic must be explained through an MBA, product, marketing, Indian business, or consumer-behavior lens.",
    candidate,
    contentPillars: CONTENT_PILLARS,
    topicScoring: candidate.topicScore,
    selectedTopicRationale: candidate.selectedTopicRationale,
    performanceInsights: candidate.performanceInsights || summarizePerformanceInsights(options.performanceInsights),
    style: {
      voice: "sharp, story-driven, human, useful, practical, premium, readable, not academic, not clickbait",
      audience:
        "MBA students, product management aspirants, marketing and strategy learners, business-curious students, early professionals, and Indian readers interested in business, AI, economy, brands, and consumer behavior",
      avoidPhrases: BANNED_STYLE_PHRASES,
      requiredSections: [
        "Strong opening hook",
        "Short story/context",
        "What happened",
        "Why it matters",
        "Hidden business, product, or marketing lesson",
        "India, MBA, or student relevance",
        "My interpretation",
        "Key takeaways",
        "Sources/further reading",
        ...(options.autoPublish ? [] : ["Review TODOs"]),
      ],
      articleRules: [
        "Do not write general knowledge or exam-prep content.",
        "Do not summarize news for its own sake.",
        "Teach one practical idea that a product, marketing, strategy, MBA, or business learner can use.",
        "Separate sourced facts from Mohit's interpretation.",
        "Use short paragraphs and specific examples.",
        "Do not claim deep expertise or insider knowledge.",
      ],
      linkedinRules: [
        "Start with a strong first line.",
        "Use 2 to 3 sentences of context.",
        "Include 3 to 5 crisp points.",
        "Link to the full portfolio article.",
        "End with one thoughtful engagement question.",
        "Use minimal hashtags.",
      ],
      visualRules: [
        "Generate a portfolio hero image prompt.",
        "Generate a LinkedIn image prompt.",
        "Generate an optional carousel outline.",
        "Add alt text and image disclosure metadata.",
        "Visuals should be premium, editorial, abstract, modern, and copyright-safe.",
        "Avoid logos, fake screenshots, copyrighted UI, neon, cyberpunk, and corporate stock imagery.",
      ],
    },
    outputSchema: {
      title: "string",
      slug: "string",
      category: "string",
      tags: ["string"],
      summary: "string",
      keyInsight: "string",
      portfolioHeroImagePrompt: "string",
      heroImagePrompt: "string",
      heroAltText: "string",
      linkedinImagePrompt: "string",
      linkedinImageAltText: "string",
      carouselPrompt: "string",
      suggestedVisualStyle: "string",
      visualStyle: "string",
      altText: "string",
      visualPrompts: [
        {
          prompt: "string",
          altText: "string",
          suggestedUse: "string",
        },
      ],
      carouselOutline: ["string"],
      imageDisclosureMetadata: {
        recommendedUse: "string",
        copyrightStatus: "string",
        disclosureNote: "string",
      },
      imageGeneratedByAI: true,
      engagementQuestion: "string",
      articleMarkdown: "string",
      linkedinMarkdown: "string",
    },
  };

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1",
      input: [
        {
          role: "system",
          content:
            "You are a careful editorial assistant. Return valid JSON only. Do not invent facts, citations, metrics, quotes, or source details.",
        },
        {
          role: "user",
          content: JSON.stringify(prompt, null, 2),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = extractOpenAIText(data);
  const parsed = parseJsonObject(text);

  return normalizeDraft(parsed, candidate, options);
}

function extractOpenAIText(data) {
  if (typeof data.output_text === "string") {
    return data.output_text;
  }

  const chunks = [];
  for (const output of data.output || []) {
    for (const content of output.content || []) {
      if (typeof content.text === "string") {
        chunks.push(content.text);
      }
    }
  }

  return chunks.join("\n");
}

function parseJsonObject(text) {
  const trimmed = String(text || "").trim();
  const unfenced = trimmed.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  return JSON.parse(unfenced);
}

function createTemplateDraft(candidate, options) {
  const category = candidate.category || inferCategory(candidate.title);
  const tags = buildTags(candidate, category);
  const baseTitle = candidate.title.replace(/\s+-\s+.*$/, "").trim();
  const title = titleCase(baseTitle.match(/^(why|what|how)\b/i) ? baseTitle : `What ${baseTitle} reveals about business decisions`);
  const slug = slugify(title);
  const articleUrl = buildArticleUrl(options.portfolioBaseUrl, slug);
  const sourceTitle = candidate.sourceLinks?.[0]?.title || candidate.title;
  const sourcePublisher = candidate.sourceLinks?.[0]?.publisher || candidate.publisher || "source";
  const engagementQuestion = buildEngagementQuestion(candidate);

  const articleMarkdown = `# ${title}

<!-- TODO: Human approval required before publishing. Verify every source-backed claim and only then change status to published. -->

## Strong Opening Hook

The interesting part is not the headline. It is the choice underneath it: what people trust, what businesses price, what teams adopt, and what customers quietly refuse.

## Short Story / Context

This draft starts from **${escapeMarkdown(candidate.title)}** and treats it as a business-learning topic, not a news summary.

For review, the first source signal is **${escapeMarkdown(sourceTitle)}** from ${escapeMarkdown(sourcePublisher)}. Replace this paragraph with a tighter story once the specific facts are checked.

## What Happened

This draft was generated from the selected weekly topic: **${escapeMarkdown(candidate.title)}**.

Primary source signal to review: **${escapeMarkdown(sourceTitle)}** from ${escapeMarkdown(sourcePublisher)}.

TODO before publishing: replace this conservative summary with verified details from the stored source links.

## Why It Matters

For an MBA, product, marketing, or strategy reader, the useful layer is the decision around adoption: who this affects, what behavior it changes, what tradeoff it creates, and how a business should read the signal.

## The Hidden Business / Product Lesson

The strongest angle to sharpen during review is this: the market rarely rewards capability by itself. It rewards capability that is packaged clearly, priced believably, distributed well, and trusted by the people expected to use it.

This piece should explain the decision lesson behind the event: what becomes easier, what becomes harder, and what a product, marketing, or strategy team should watch next.

## India / MBA / Student Relevance

For Indian students and early professionals, the point is not to memorize the event. The point is to practice reading signals: price, convenience, trust, distribution, brand memory, or workflow change.

TODO before publishing: add the most relevant India or student angle from verified sources.

## My Interpretation

I read this as a useful prompt for business judgment. A trend becomes worth studying when it changes how someone chooses: a customer, a team, a brand, a product manager, or a market.

The question I would carry forward is simple: does this development reduce friction, reveal demand, improve trust, or change the economics of a decision?

## Key Takeaways

- Look past the headline and identify the behavior or decision it changes.
- Ask whether the business lesson is about pricing, trust, speed, distribution, brand, or workflow.
- Keep the India or student relevance specific, not forced.
- Use sources to support facts and keep interpretation clearly marked.

## Review TODOs

- Verify the primary source and add at least one supporting source.
- Replace any generic phrasing with source-specific details.
- Add the clearest business, product, marketing, or consumer behavior lesson.
- Add one thoughtful LinkedIn question that invites comments without baiting.
- Confirm the article link and hero image prompt before publishing.

## Sources / Further Reading

${formatMarkdownSources(candidate.sourceLinks)}
`;

  const linkedinMarkdown = `${candidate.title} is worth studying beyond the headline.

The useful question is: what choice does it change for a customer, a product team, a marketer, or a business learner?

My working read:

- The signal matters more than the announcement.
- The lesson is likely in adoption, pricing, trust, distribution, or friction.
- The India/MBA angle should be specific enough to teach something practical.
- The final article needs verified sources before it moves out of review.

Full article: ${articleUrl}

${engagementQuestion}

#AI #ProductStrategy #Business`;

  return normalizeDraft(
    {
      title,
      slug,
      category,
      tags,
      summary:
        "A review-ready weekly insight draft on how a recent AI, product, or business development connects to practical business judgment.",
      keyInsight:
        "The strongest story is not the announcement. It is the behavior, decision, or business tradeoff the event changes.",
      portfolioHeroImagePrompt:
        "Create a premium editorial abstract hero image for a business insight article. Show layered market signals, product decisions, consumer-choice paths, and subtle analytical lines on a warm off-white and charcoal palette. No logos, no product screenshots, no faces, no copyrighted UI, no neon, no crypto styling, no fake corporate stock-photo look.",
      heroImagePrompt:
        "Create a premium editorial abstract hero image for a business insight article. Show layered market signals, product decisions, consumer-choice paths, and subtle analytical lines on a warm off-white and charcoal palette. No logos, no product screenshots, no faces, no copyrighted UI, no neon, no crypto styling, no fake corporate stock-photo look.",
      heroAltText:
        "Abstract editorial visual of market signals, product decisions, and consumer choice paths.",
      linkedinImagePrompt:
        "Create a square LinkedIn-safe editorial visual with one clear central metaphor for the article topic: market signals becoming business decisions. Use refined contrast, warm neutral lighting, clean negative space, no brand logos, no real screenshots, no cartoon style.",
      linkedinImageAltText:
        "Editorial visual showing market signals turning into product and business decisions.",
      carouselPrompt:
        "Design a 5 to 7 slide LinkedIn carousel as a premium editorial infographic. Use one idea per slide, large mobile-readable type, restrained warm neutral palette, simple arrows or market-signal lines, no logos, no fake screenshots, and no clutter.",
      suggestedVisualStyle:
        "Premium editorial, abstract, warm neutral palette, thin linework, restrained depth, portfolio-ready, LinkedIn-safe.",
      visualStyle:
        "Premium editorial infographic, abstract market map, muted economic diagram, cinematic product strategy visual, minimal business illustration, elegant data visualization.",
      visualPrompts: [
        {
          prompt:
            "A minimal diagram-style visual showing a market signal moving into customer behavior, product response, and business outcome. Use thin lines, calm contrast, no brand marks, and no real UI.",
          altText:
            "Abstract diagram showing a market signal flowing into customer behavior and business outcomes.",
          suggestedUse: "Inline explainer visual",
        },
        {
          prompt:
            "A refined abstract grid with thin decision paths, small data points, warm editorial lighting, and no logos or screenshots.",
          altText:
            "Abstract grid of decision paths and data points representing product strategy signals.",
          suggestedUse: "Supporting visual or LinkedIn preview variant",
        },
      ],
      carouselOutline: [
        "Slide 1: The headline is not the lesson",
        "Slide 2: What changed",
        "Slide 3: The hidden business or product signal",
        "Slide 4: Why it matters for Indian MBA/product/marketing readers",
        "Slide 5: What to watch next",
      ],
      imageDisclosureMetadata: {
        recommendedUse: "AI-generated abstract visual or self-created diagram only",
        copyrightStatus: "No third-party logos, screenshots, or copyrighted imagery",
        disclosureNote: "Visual prompt intended for a copyright-safe editorial image.",
      },
      imageGeneratedByAI: true,
      engagementQuestion,
      articleMarkdown,
      linkedinMarkdown,
    },
    candidate,
    options,
  );
}

function normalizeDraft(rawDraft, candidate, options) {
  const title = cleanText(rawDraft.title || candidate.title || "Weekly Business Insight");
  const slug = slugify(rawDraft.slug || title);
  const category = normalizeCategory(rawDraft.category || candidate.category || inferCategory(title));

  return {
    title,
    slug,
    category,
    tags: Array.isArray(rawDraft.tags) && rawDraft.tags.length ? rawDraft.tags.slice(0, 6) : buildTags(candidate, category),
    summary: cleanText(rawDraft.summary || candidate.summary || "Weekly insight draft for review."),
    keyInsight: cleanText(rawDraft.keyInsight || "The business lesson should be sharpened during review."),
    portfolioHeroImagePrompt: cleanText(rawDraft.portfolioHeroImagePrompt || rawDraft.heroImagePrompt || ""),
    heroImagePrompt: cleanText(rawDraft.heroImagePrompt || rawDraft.portfolioHeroImagePrompt || ""),
    heroAltText: cleanText(rawDraft.heroAltText || rawDraft.altText || `Editorial visual for ${title}`),
    linkedinImagePrompt: cleanText(rawDraft.linkedinImagePrompt || ""),
    linkedinImageAltText: cleanText(rawDraft.linkedinImageAltText || `LinkedIn editorial visual for ${title}`),
    carouselPrompt: cleanText(rawDraft.carouselPrompt || ""),
    suggestedVisualStyle: cleanText(
      rawDraft.suggestedVisualStyle ||
        rawDraft.visualStyle ||
        "Premium editorial, abstract, business/product/AI inspired, modern, restrained, not cartoonish, not neon, not cyberpunk.",
    ),
    visualStyle: cleanText(
      rawDraft.visualStyle ||
        rawDraft.suggestedVisualStyle ||
        "Premium editorial infographic, abstract market map, muted economic diagram, cinematic product strategy visual, minimal business illustration, elegant data visualization.",
    ),
    visualPrompts: normalizeVisualPrompts(rawDraft.visualPrompts).slice(0, 3),
    carouselOutline: normalizeStringList(rawDraft.carouselOutline).slice(0, 7),
    imageDisclosureMetadata: normalizeImageDisclosure(rawDraft.imageDisclosureMetadata),
    imageGeneratedByAI: rawDraft.imageGeneratedByAI === false ? false : true,
    engagementQuestion: cleanText(rawDraft.engagementQuestion || buildEngagementQuestion(candidate)),
    linkedinStatus: options.autoPublish ? "approved" : "draft",
    articleMarkdown: prepareArticleMarkdown(rawDraft.articleMarkdown || "", options.autoPublish),
    linkedinMarkdown: ensureLinkedInDraft(rawDraft.linkedinMarkdown || "", buildArticleUrl(options.portfolioBaseUrl, slug)),
  };
}

function normalizeVisualPrompts(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return {
          prompt: cleanText(item),
          altText: "Abstract editorial visual supporting the article's business insight.",
          suggestedUse: "Supporting visual",
        };
      }

      return {
        prompt: cleanText(item?.prompt || ""),
        altText: cleanText(item?.altText || "Abstract editorial visual supporting the article."),
        suggestedUse: cleanText(item?.suggestedUse || "Supporting visual"),
      };
    })
    .filter((item) => item.prompt);
}

function normalizeStringList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => cleanText(item)).filter(Boolean);
}

function normalizeImageDisclosure(value) {
  return {
    recommendedUse: cleanText(value?.recommendedUse || "AI-generated abstract visual or self-created diagram only"),
    copyrightStatus: cleanText(value?.copyrightStatus || "Copyright-safe visual required. Do not use logos, screenshots, or copyrighted images without permission."),
    disclosureNote: cleanText(value?.disclosureNote || "Visual prompt metadata for human-reviewed image creation."),
  };
}

async function buildOutputFiles(draft, candidate, options) {
  const baseName = `${options.date}-${draft.slug}`;
  const articleUrl = buildArticleUrl(process.env.WEEKLY_INSIGHT_PORTFOLIO_BASE_URL || "", draft.slug);

  const researchPath = await uniquePath(path.join(OUTPUT_DIRS.researchNotes, `${baseName}.md`));
  const journalPath = await uniquePath(path.join(OUTPUT_DIRS.journal, `${baseName}.md`));
  const linkedinPath = await uniquePath(path.join(OUTPUT_DIRS.linkedinDrafts, `${baseName}.linkedin.md`));
  const assetsPath = await uniquePath(path.join(OUTPUT_DIRS.generatedAssets, `${baseName}.prompts.md`));

  return [
    {
      label: "research note",
      path: researchPath,
      content: buildResearchNote(draft, candidate, options.date, researchPath),
    },
    {
      label: "portfolio blog draft",
      path: journalPath,
      content: buildBlogPost(draft, candidate, options.date, options.status, articleUrl, linkedinPath),
    },
    {
      label: "LinkedIn draft",
      path: linkedinPath,
      content: buildLinkedInDraft(draft, options.date, articleUrl),
    },
    {
      label: "hero image prompt",
      path: assetsPath,
      content: buildAssetPrompts(draft, options.date),
    },
  ];
}

function buildResearchNote(draft, candidate, date) {
  return `---
date: "${date}"
status: "review"
selectedTopic: ${yamlString(candidate.title)}
category: ${yamlString(draft.category)}
selectedTopicScore: ${yamlString(candidate.topicScore?.total || "")}
approvalStatus: "not_requested"
---

# Research Note: ${draft.title}

<!-- TODO: Human approval required. Confirm the topic, source quality, and final angle before publishing any related content. -->

## Selected Topic

${candidate.title}

## Why This Topic Was Selected

- Category fit: ${draft.category}
- Rationale: ${candidate.selectedTopicRationale || "Selected after balancing topic score, sources, audience fit, and portfolio relevance."}
- Key insight to sharpen: ${draft.keyInsight}
- Audience fit: useful for MBA students, product and marketing learners, early professionals, and Indian business-curious readers.

## Selected Topic Score

${formatTopicScore(candidate.topicScore)}

## Candidate Topic Scoreboard

${formatCandidateScoreboard(candidate.candidatePool)}

## Performance Signals Used

${formatPerformanceSignals(candidate.performanceInsights)}

## Source Links

${formatMarkdownSources(candidate.sourceLinks)}

## Source Review Notes

- Verify publication dates and whether sources are primary or secondary.
- Add at least one primary source before publishing if the selected source is a news article.
- Keep unsupported claims marked as TODO until verified.

## Draft Angle

${draft.summary}

## LinkedIn Engagement Question

${draft.engagementQuestion}

## Human Review TODOs

- Confirm this is the right weekly topic.
- Replace weak or generic lines with specific evidence from sources.
- Check every factual claim against a stored source link.
- Confirm the LinkedIn question invites useful comments without bait.
- Approve the blog and LinkedIn post separately.
`;
}

function buildBlogPost(draft, candidate, date, status, articleUrl, linkedinPath) {
  return `---
title: ${yamlString(draft.title)}
slug: ${yamlString(draft.slug)}
date: "${date}"
status: "${status}"
category: ${yamlString(draft.category)}
tags:
${toYamlList(draft.tags)}
summary: ${yamlString(draft.summary)}
heroImage: ""
portfolioHeroImagePrompt: ${yamlString(draft.portfolioHeroImagePrompt)}
heroImagePrompt: ${yamlString(draft.heroImagePrompt)}
supportingVisualPrompts:
${toYamlVisualPrompts(draft.visualPrompts)}
linkedinImagePrompt: ${yamlString(draft.linkedinImagePrompt)}
linkedinImageAltText: ${yamlString(draft.linkedinImageAltText)}
carouselPrompt: ${yamlString(draft.carouselPrompt)}
carouselOutline:
${toYamlOptionalList(draft.carouselOutline)}
visualStyle: ${yamlString(draft.visualStyle)}
imageGeneratedByAI: ${draft.imageGeneratedByAI ? "true" : "false"}
imageDisclosure:
  recommendedUse: ${yamlString(draft.imageDisclosureMetadata.recommendedUse)}
  copyrightStatus: ${yamlString(draft.imageDisclosureMetadata.copyrightStatus)}
  disclosureNote: ${yamlString(draft.imageDisclosureMetadata.disclosureNote)}
suggestedVisualStyle: ${yamlString(draft.suggestedVisualStyle)}
imageCredit: ""
imageSource: ""
imageLicense: ""
altText: ${yamlString(draft.heroAltText)}
ogImage: ""
heroImageAlt: ${yamlString(draft.heroAltText)}
sourceLinks:
${toYamlSources(candidate.sourceLinks)}
keyInsight: ${yamlString(draft.keyInsight)}
readingTime: "${estimateReadingTime(draft.articleMarkdown)} min"
canonicalUrl: ${yamlString(articleUrl)}
approvalStatus: ${yamlString(status === "published" ? "approved" : "not_requested")}
linkedinShortPost:
  draftPath: ${yamlString(relativePath(linkedinPath))}
  status: ${yamlString(draft.linkedinStatus)}
  engagementQuestion: ${yamlString(draft.engagementQuestion)}
---

${draft.articleMarkdown}
`;
}

function buildLinkedInDraft(draft, date, articleUrl) {
  return `---
relatedBlogSlug: ${yamlString(draft.slug)}
relatedBlogUrl: ${yamlString(articleUrl)}
status: ${yamlString(draft.linkedinStatus)}
createdDate: "${date}"
approvedDate: ${yamlString(draft.linkedinStatus === "approved" ? date : "")}
postedDate: ""
engagementQuestion: ${yamlString(draft.engagementQuestion)}
linkedinImagePrompt: ${yamlString(draft.linkedinImagePrompt)}
linkedinImageAltText: ${yamlString(draft.linkedinImageAltText)}
carouselPrompt: ${yamlString(draft.carouselPrompt)}
carouselOutline:
${toYamlOptionalList(draft.carouselOutline)}
visualStyle: ${yamlString(draft.visualStyle)}
imageGeneratedByAI: ${draft.imageGeneratedByAI ? "true" : "false"}
imageDisclosure:
  recommendedUse: ${yamlString(draft.imageDisclosureMetadata.recommendedUse)}
  copyrightStatus: ${yamlString(draft.imageDisclosureMetadata.copyrightStatus)}
  disclosureNote: ${yamlString(draft.imageDisclosureMetadata.disclosureNote)}
hashtags:
  - "#AI"
  - "#ProductStrategy"
  - "#Business"
---

<!-- TODO: Mohit approval required before posting. Do not auto-post this draft. -->

# LinkedIn Draft

${draft.linkedinMarkdown}
`;
}

function buildAssetPrompts(draft, date) {
  return `---
relatedBlogSlug: ${yamlString(draft.slug)}
status: "draft"
createdDate: "${date}"
approvalStatus: "not_requested"
licenseRequirement: "AI-generated, self-created, public domain, or clearly licensed only"
---

# Hero Image Prompt

${draft.portfolioHeroImagePrompt || draft.heroImagePrompt || "TODO: Add a copyright-safe hero image prompt before publishing."}

Alt text: ${draft.heroAltText || "TODO: Add alt text before publishing."}

Visual style: ${draft.visualStyle || draft.suggestedVisualStyle}

## LinkedIn Image Prompt

${draft.linkedinImagePrompt || "TODO: Add a LinkedIn image prompt before publishing."}

Alt text: ${draft.linkedinImageAltText || "TODO: Add LinkedIn image alt text before publishing."}

## Carousel Prompt

${draft.carouselPrompt || "TODO: Add a LinkedIn carousel prompt if the topic would work as a visual explainer."}

## Optional Carousel Outline

${draft.carouselOutline.length ? draft.carouselOutline.map((item, index) => `${index + 1}. ${item}`).join("\n") : "TODO: Add a short carousel outline if the topic would work as a visual explainer."}

## Optional Visual Prompts

${draft.visualPrompts.length ? draft.visualPrompts.map((visual) => `- Prompt: ${visual.prompt}\n  Alt text: ${visual.altText}\n  Suggested use: ${visual.suggestedUse}`).join("\n") : "- TODO: Add 1 to 3 supporting visual prompts if useful."}

## Image Disclosure Metadata

- Image generated by AI: ${draft.imageGeneratedByAI ? "true" : "false"}
- Recommended use: ${draft.imageDisclosureMetadata.recommendedUse}
- Copyright status: ${draft.imageDisclosureMetadata.copyrightStatus}
- Disclosure note: ${draft.imageDisclosureMetadata.disclosureNote}

## Visual Safety Notes

- Do not use copyrighted images randomly.
- Do not imitate protected product UI, private dashboards, or real screenshots.
- Store source and license information if any external image is used later.
- Add alt text before publishing.
`;
}

function buildManifest(draft, candidate, files, options) {
  const fileByLabel = new Map(files.map((file) => [file.label, relativePath(file.path)]));

  return {
    date: options.date,
    status: options.status,
    title: draft.title,
    slug: draft.slug,
    summary: draft.summary,
    category: draft.category,
    selectedTopic: candidate.title,
    selectedTopicRationale: candidate.selectedTopicRationale || "",
    topicScore: candidate.topicScore || null,
    candidateTopicScoreboard: candidate.candidatePool || [],
    performanceInsights: candidate.performanceInsights || null,
    engagementQuestion: draft.engagementQuestion,
    portfolioHeroImagePrompt: draft.portfolioHeroImagePrompt,
    linkedinImagePrompt: draft.linkedinImagePrompt,
    carouselPrompt: draft.carouselPrompt,
    visualStyle: draft.visualStyle,
    imageGeneratedByAI: draft.imageGeneratedByAI,
    articlePath: fileByLabel.get("portfolio blog draft") || "",
    linkedinDraftPath: fileByLabel.get("LinkedIn draft") || "",
    researchNotePath: fileByLabel.get("research note") || "",
    visualPromptPath: fileByLabel.get("hero image prompt") || "",
    sourceCount: Array.isArray(candidate.sourceLinks) ? candidate.sourceLinks.length : 0,
  };
}

function ensureApprovalTodo(markdown) {
  const text = String(markdown || "").trim();
  const todo = "<!-- TODO: Human approval required before publishing. Verify all factual claims and source links. -->";

  if (!text) {
    return `${todo}\n\n## Draft\n\nTODO: Generate or write the article body.`;
  }

  return text.includes("TODO: Human approval") ? text : `${todo}\n\n${text}`;
}

function prepareArticleMarkdown(markdown, autoPublish) {
  const text = String(markdown || "").trim();

  if (autoPublish) {
    return text;
  }

  return ensureApprovalTodo(text);
}

function ensureLinkedInDraft(markdown, articleUrl) {
  const text = String(markdown || "").trim();
  if (text) {
    return text.includes(articleUrl) ? text : `${text}\n\nFull article: ${articleUrl}`;
  }

  return `TODO: Write LinkedIn adaptation.\n\nFull article: ${articleUrl}`;
}

async function uniquePath(filePath) {
  if (!existsSync(filePath)) {
    return filePath;
  }

  const parsed = path.parse(filePath);
  for (let index = 2; index < 100; index += 1) {
    const candidate = path.join(parsed.dir, `${parsed.name}-${index}${parsed.ext}`);
    if (!existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Could not find a unique file path for ${filePath}`);
}

async function writeFiles(files) {
  await Promise.all(files.map((file) => fs.writeFile(file.path, file.content, "utf8")));
}

function printDryRun(candidate, files, manifest) {
  console.log("Weekly insight dry run complete.");
  console.log(`Selected topic: ${candidate.title}`);
  if (candidate.topicScore) {
    console.log(`Topic score: ${candidate.topicScore.total}`);
  }
  if (candidate.selectedTopicRationale) {
    console.log(`Selection rationale: ${candidate.selectedTopicRationale}`);
  }
  if (Array.isArray(candidate.candidatePool) && candidate.candidatePool.length) {
    console.log("Top candidate topics:");
    for (const topic of candidate.candidatePool.slice(0, 5)) {
      console.log(`- ${topic.title} (${topic.total})`);
    }
  }
  if (candidate.performanceInsights) {
    console.log(
      `Analytics rows: LinkedIn ${candidate.performanceInsights.linkedInRows || 0}, journal ${candidate.performanceInsights.journalRows || 0}`,
    );
  }
  console.log(`Generated blog title: ${manifest.title}`);
  console.log("Files that would be created:");
  for (const file of files) {
    console.log(`- ${file.label}: ${relativePath(file.path)}`);
  }
}

function printSuccess(candidate, files, manifestPath) {
  console.log("Weekly insight drafts created for human review.");
  console.log(`Selected topic: ${candidate.title}`);
  for (const file of files) {
    console.log(`- ${file.label}: ${relativePath(file.path)}`);
  }
  if (manifestPath) {
    console.log(`- manifest: ${relativePath(manifestPath)}`);
  }
}

function inferCategory(text) {
  const lower = String(text || "").toLowerCase();

  if (lower.includes("india") || lower.includes("consumer") || lower.includes("ecommerce") || lower.includes("retail")) {
    return "Indian Consumer Behavior";
  }

  if (lower.includes("marketing") || lower.includes("brand")) {
    return "Brand & Marketing Lessons";
  }

  if (lower.includes("history") || lower.includes("legacy")) {
    return "Business History with Modern Relevance";
  }

  if (lower.includes("pricing") || lower.includes("business model") || lower.includes("revenue") || lower.includes("market")) {
    return "Market Signals";
  }

  if (lower.includes("workflow") || lower.includes("automation") || lower.includes("agent") || lower.includes("data")) {
    return "Data Science Applied to Decisions";
  }

  if (lower.includes("product") || lower.includes("launch")) {
    return "Product Strategy";
  }

  return WEEKLY_CATEGORIES[1];
}

function normalizeCategory(category) {
  const clean = cleanText(category);
  if (WEEKLY_CATEGORIES.includes(clean)) {
    return clean;
  }

  return inferCategory(clean);
}

function buildTags(candidate, category) {
  const text = `${candidate.title || ""} ${candidate.summary || ""} ${category}`.toLowerCase();
  const tags = new Set();

  if (text.includes("ai") || text.includes("model")) tags.add("AI");
  if (text.includes("product") || text.includes("launch")) tags.add("Product Strategy");
  if (text.includes("business") || text.includes("revenue")) tags.add("Business");
  if (text.includes("marketing") || text.includes("brand")) tags.add("Marketing");
  if (text.includes("consumer") || text.includes("retail") || text.includes("ecommerce")) tags.add("Consumer Behavior");
  if (text.includes("workflow") || text.includes("automation") || text.includes("agent")) tags.add("Automation");

  if (!tags.size) {
    tags.add("Business");
    tags.add("Product Strategy");
  }

  return Array.from(tags).slice(0, 6);
}

function buildArticleUrl(baseUrl, slug) {
  const cleanBase = String(baseUrl || "").replace(/\/$/, "");
  if (!cleanBase) {
    return `/journal/${slug}`;
  }

  return `${cleanBase}/journal/${slug}`;
}

function localDate(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.TZ || DEFAULT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function estimateReadingTime(markdown) {
  const words = String(markdown || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function formatMarkdownSources(sources = []) {
  if (!sources.length) {
    return "- TODO: Add source links before publishing.";
  }

  return sources
    .map((source) => {
      const title = source.title || "Untitled source";
      const url = source.url || "";
      const publisher = source.publisher ? `, ${source.publisher}` : "";
      const date = source.datePublished ? `, published ${source.datePublished}` : "";
      const accessed = source.accessed ? `, accessed ${source.accessed}` : "";
      const claim = source.claimSupported ? ` Claim supported: ${source.claimSupported}` : "";
      const linkedTitle = url ? `[${escapeMarkdown(title)}](${url})` : escapeMarkdown(title);
      return `- ${linkedTitle}${publisher}${date}${accessed}.${claim}`;
    })
    .join("\n");
}

function formatTopicScore(score = {}) {
  if (!score || typeof score !== "object") {
    return "- TODO: Add topic score before publishing.";
  }

  return [
    `- Total score: ${score.total ?? "n/a"}`,
    `- Usefulness: ${score.usefulness ?? "n/a"}/10`,
    `- Novelty: ${score.novelty ?? "n/a"}/10`,
    `- Shareability: ${score.shareability ?? "n/a"}/10`,
    `- Comment potential: ${score.commentPotential ?? "n/a"}/10`,
    `- Clarity: ${score.clarity ?? "n/a"}/10`,
    `- Credibility: ${score.credibility ?? "n/a"}/10`,
    `- Visual potential: ${score.visualPotential ?? "n/a"}/10`,
    `- Personal-fit score: ${score.personalFit ?? "n/a"}/10`,
    `- Historical fit: ${score.historicalFit ?? "n/a"}/10`,
    `- Recency driver: ${score.recency ?? "n/a"}/10`,
    `- India relevance driver: ${score.indiaRelevance ?? "n/a"}/10`,
    `- Business relevance driver: ${score.businessRelevance ?? "n/a"}/10`,
    `- Product/marketing lesson driver: ${score.productMarketingLesson ?? "n/a"}/10`,
    `- Source availability driver: ${score.sourceAvailability ?? "n/a"}/10`,
    `- Analytics boost: ${score.analyticsBoost ?? "n/a"}`,
  ].join("\n");
}

function formatCandidateScoreboard(candidates = []) {
  if (!Array.isArray(candidates) || !candidates.length) {
    return "- TODO: Add candidate topic scorecard before publishing.";
  }

  return candidates
    .map((candidate, index) => {
      const scores = candidate.scores || {};
      const drivers = candidate.drivers || {};
      return [
        `${index + 1}. **${escapeMarkdown(candidate.title || "Untitled topic")}**`,
        `   - Category: ${candidate.category || "Uncategorized"}`,
        `   - Total: ${candidate.total}`,
        `   - Scores: usefulness ${scores.usefulness}/10, novelty ${scores.novelty}/10, shareability ${scores.shareability}/10, comments ${scores.commentPotential}/10, clarity ${scores.clarity}/10, credibility ${scores.credibility}/10, visual ${scores.visualPotential}/10, personal fit ${scores.personalFit}/10, historical fit ${scores.historicalFit}/10`,
        `   - Drivers: recency ${drivers.recency}/10, India ${drivers.indiaRelevance}/10, business ${drivers.businessRelevance}/10, product/marketing ${drivers.productMarketingLesson}/10, sources ${drivers.sourceAvailability}/10, analytics boost ${drivers.analyticsBoost}`,
      ].join("\n");
    })
    .join("\n");
}

function formatPerformanceSignals(signals = {}) {
  if (!signals.linkedInRows && !signals.journalRows) {
    return "- No analytics rows yet. Topic scoring used only source, audience, and portfolio-fit signals.";
  }

  return [
    `- LinkedIn rows reviewed: ${signals.linkedInRows || 0}`,
    `- Journal rows reviewed: ${signals.journalRows || 0}`,
    `- Top pillars: ${formatAnalyticsList(signals.topPillars)}`,
    `- Top hooks: ${formatAnalyticsList(signals.topHooks)}`,
    `- Top formats: ${formatAnalyticsList(signals.topFormats)}`,
    `- Best recent topics: ${formatBestTopicList(signals.bestTopics)}`,
  ].join("\n");
}

function formatAnalyticsList(items = []) {
  if (!items.length) {
    return "none yet";
  }

  return items.map((item) => `${item.key} (${item.score})`).join(", ");
}

function formatBestTopicList(items = []) {
  if (!items.length) {
    return "none yet";
  }

  return items.map((item) => `${item.topic || "untitled"} (${item.score})`).join(", ");
}

function toYamlSources(sources = []) {
  if (!sources.length) {
    return '  - title: "TODO: Add source"\n    url: ""\n    publisher: ""\n    datePublished: ""\n    accessed: ""\n    claimSupported: ""';
  }

  return sources
    .map(
      (source) => `  - title: ${yamlString(source.title || "")}
    url: ${yamlString(source.url || "")}
    publisher: ${yamlString(source.publisher || "")}
    datePublished: ${yamlString(source.datePublished || "")}
    accessed: ${yamlString(source.accessed || "")}
    claimSupported: ${yamlString(source.claimSupported || "")}`,
    )
    .join("\n");
}

function toYamlVisualPrompts(visualPrompts = []) {
  if (!visualPrompts.length) {
    return '  - prompt: ""\n    altText: ""\n    suggestedUse: ""';
  }

  return visualPrompts
    .map(
      (visual) => `  - prompt: ${yamlString(visual.prompt)}
    altText: ${yamlString(visual.altText)}
    suggestedUse: ${yamlString(visual.suggestedUse)}`,
    )
    .join("\n");
}

function toYamlOptionalList(values = []) {
  if (!values.length) {
    return "  []";
  }

  return values.map((value) => `  - ${yamlString(value)}`).join("\n");
}

function toYamlList(values = []) {
  if (!values.length) {
    return "  - Business";
  }

  return values.map((value) => `  - ${yamlString(value)}`).join("\n");
}

function buildEngagementQuestion(candidate) {
  const text = `${candidate.title || ""} ${candidate.summary || ""}`.toLowerCase();

  if (text.includes("pricing") || text.includes("price")) {
    return "Where else do you see pricing acting as a signal, not just a number?";
  }

  if (text.includes("distribution") || text.includes("shipping") || text.includes("route")) {
    return "Is this mostly a product problem, a distribution problem, or a market-structure problem?";
  }

  if (text.includes("india") || text.includes("indian") || text.includes("zudio") || text.includes("zepto") || text.includes("swiggy")) {
    return "What do you think this changes for Indian businesses or Indian consumers?";
  }

  if (text.includes("ai") || text.includes("automation") || text.includes("workflow")) {
    return "What would you watch next: adoption, pricing, trust, or workflow change?";
  }

  return "What would you watch next if you were analyzing this market?";
}

function yamlString(value) {
  return JSON.stringify(String(value || ""));
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function titleCase(value) {
  return String(value || "")
    .split(" ")
    .filter(Boolean)
    .map((word) => (word.length > 3 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeMarkdown(value) {
  return String(value || "").replace(/\[/g, "\\[").replace(/\]/g, "\\]");
}

function relativePath(filePath) {
  return path.relative(ROOT, filePath);
}

function readableError(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
