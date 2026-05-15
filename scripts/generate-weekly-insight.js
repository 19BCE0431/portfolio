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
    title: "AI tools are moving from novelty to everyday workflow decisions",
    category: "AI & Business",
    summary:
      "A conservative fallback topic for weeks when no live source feed is available. Use it to analyze how teams decide where AI belongs in real work.",
    sourceLinks: [
      {
        title: "Google News search: AI tools workflow business",
        url: "https://news.google.com/search?q=AI%20tools%20workflow%20business",
        publisher: "Google News",
        datePublished: "",
        accessed: "",
        claimSupported: "Source discovery only. Replace with specific sources before publishing.",
      },
    ],
  },
  {
    title: "What product teams can learn from AI feature packaging",
    category: "Product Strategy",
    summary:
      "A fallback topic for studying how companies turn technical capability into product packaging, pricing, and adoption.",
    sourceLinks: [
      {
        title: "Google News search: AI product launch pricing packaging",
        url: "https://news.google.com/search?q=AI%20product%20launch%20pricing%20packaging",
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
  const useAi = Boolean(args["use-ai"] || process.env.WEEKLY_INSIGHT_USE_OPENAI === "true");
  const dryRun = Boolean(args["dry-run"]);
  const manifestPath = args.manifest ? path.resolve(ROOT, String(args.manifest)) : "";
  const forcedTopic = args.topic ? String(args.topic) : "";

  await ensureOutputDirs();

  const candidate = forcedTopic
    ? createManualCandidate(forcedTopic, date)
    : await discoverBestTopic(date);

  const draft = await createDraft(candidate, {
    date,
    status,
    autoPublish,
    useAi,
    portfolioBaseUrl: process.env.WEEKLY_INSIGHT_PORTFOLIO_BASE_URL || "",
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

async function discoverBestTopic(date) {
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
    .map((candidate) => ({ ...candidate, score: scoreCandidate(candidate, date) }))
    .sort((first, second) => second.score - first.score);

  return scored[0];
}

async function fetchSerpApiCandidates(date) {
  if (!process.env.SERP_API_KEY) {
    return [];
  }

  const query = [
    "AI product launch business strategy",
    "product strategy AI marketing consumer behavior",
    "India digital consumer behavior ecommerce AI",
  ].join(" OR ");

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_news");
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", process.env.SERP_API_KEY);

  try {
    const data = await fetchJson(url.toString());
    const results = Array.isArray(data.news_results) ? data.news_results : [];

    return results.slice(0, 12).map((item) => ({
      title: cleanText(item.title || "Untitled news result"),
      url: item.link || "",
      publisher: item.source || "Google News",
      datePublished: item.date || "",
      accessed: date,
      summary: cleanText(item.snippet || ""),
      category: inferCategory(`${item.title || ""} ${item.snippet || ""}`),
      sourceLinks: [
        {
          title: cleanText(item.title || "Google News result"),
          url: item.link || "",
          publisher: item.source || "Google News",
          datePublished: item.date || "",
          accessed: date,
          claimSupported: "Discovery source for the selected weekly topic.",
        },
      ],
    }));
  } catch (error) {
    console.warn(`SERP API source collection skipped: ${readableError(error)}`);
    return [];
  }
}

async function fetchNewsApiCandidates(date) {
  if (!process.env.NEWS_API_KEY) {
    return [];
  }

  const url = new URL("https://newsapi.org/v2/everything");
  url.searchParams.set("q", '(AI OR "artificial intelligence") AND (product OR business OR marketing OR consumer OR startup)');
  url.searchParams.set("language", "en");
  url.searchParams.set("sortBy", "publishedAt");
  url.searchParams.set("pageSize", "12");
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
      category: inferCategory(`${article.title || ""} ${article.description || ""}`),
      sourceLinks: [
        {
          title: cleanText(article.title || "News API article"),
          url: article.url || "",
          publisher: article.source?.name || "News API",
          datePublished: article.publishedAt || "",
          accessed: date,
          claimSupported: "Discovery source for the selected weekly topic.",
        },
      ],
    }));
  } catch (error) {
    console.warn(`News API source collection skipped: ${readableError(error)}`);
    return [];
  }
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

function scoreCandidate(candidate, currentDate) {
  const text = `${candidate.title || ""} ${candidate.summary || ""}`.toLowerCase();
  const age = daysOld(candidate.datePublished, currentDate);

  let score = 0;
  score += age <= 7 ? 20 : age <= 21 ? 14 : age <= 45 ? 8 : 2;
  score += countMatches(text, ["launch", "release", "pricing", "enterprise", "consumer", "workflow", "strategy"]) * 5;
  score += countMatches(text, ["ai", "model", "automation", "agent", "data", "product", "platform"]) * 4;
  score += countMatches(text, ["india", "retail", "ecommerce", "marketing", "brand", "startup", "business"]) * 4;
  score += countMatches(text, ["why", "how", "shift", "lesson", "changes", "future", "failure"]) * 3;

  if (candidate.fallback) {
    score -= 15;
  }

  if (candidate.url && !candidate.url.includes("news.google.com/search")) {
    score += 5;
  }

  return score;
}

function countMatches(text, terms) {
  return terms.reduce((count, term) => count + (text.includes(term) ? 1 : 0), 0);
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
        ? "Create a publication-ready weekly portfolio blog and LinkedIn draft for Mohit. Use only the provided sources. Mark unsupported claims as TODO so validation can block publishing. Avoid generic AI-newsletter language, clickbait, fake expertise, and overconfident predictions."
        : "Create a grounded weekly portfolio blog draft and LinkedIn draft for Mohit. Use only the provided sources. Mark unsupported claims as TODO. Avoid generic AI-newsletter language, clickbait, fake expertise, and overconfident predictions.",
    candidate,
    style: {
      voice: "intelligent, story-driven, premium, sharp, personal but not overly personal, practical, readable",
      audience: "MBA students, product managers, marketers, analysts, founders, and business-curious readers",
      requiredSections: [
        "Strong opening hook",
        "What happened",
        "Why it matters",
        "Hidden business, product, or consumer behavior lesson",
        "My interpretation",
        "Key takeaways",
        ...(options.autoPublish ? [] : ["Review TODOs"]),
      ],
    },
    outputSchema: {
      title: "string",
      slug: "string",
      category: "string",
      tags: ["string"],
      summary: "string",
      keyInsight: "string",
      heroImagePrompt: "string",
      heroAltText: "string",
      suggestedVisualStyle: "string",
      visualPrompts: [
        {
          prompt: "string",
          altText: "string",
          suggestedUse: "string",
        },
      ],
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
  const title = titleCase(`What ${baseTitle} reveals about business judgment`);
  const slug = slugify(title);
  const articleUrl = buildArticleUrl(options.portfolioBaseUrl, slug);
  const sourceTitle = candidate.sourceLinks?.[0]?.title || candidate.title;
  const sourcePublisher = candidate.sourceLinks?.[0]?.publisher || candidate.publisher || "source";

  const articleMarkdown = `# ${title}

<!-- TODO: Human approval required before publishing. Verify every source-backed claim and only then change status to published. -->

## Strong Opening Hook

The useful question is not whether this development is exciting. It is what it reveals about how a technical shift becomes a business decision.

## What Happened

This draft was generated from the selected weekly topic: **${escapeMarkdown(candidate.title)}**.

Primary source signal to review: **${escapeMarkdown(sourceTitle)}** from ${escapeMarkdown(sourcePublisher)}.

TODO before publishing: replace this conservative summary with verified details from the stored source links.

## Why It Matters

For an MBA, product, marketing, or strategy reader, the important layer is not the announcement alone. It is the decision around adoption: who the product is for, what behavior it changes, what workflow it enters, and what tradeoff a customer or business team must make.

## The Hidden Business Lesson

The best technology stories are rarely only about capability. They are about packaging, timing, trust, distribution, and whether the user understands the job the product is supposed to do.

That is the angle this draft should sharpen during review: not "AI is moving fast," but "what changed in the business decision because of this development?"

## My Interpretation

I read this as a reminder that applied AI becomes meaningful only when it supports a real decision. A model, feature, or automation flow is useful when it helps a team choose faster, serve a customer better, reduce friction, or see a market signal earlier.

The question I would carry forward is simple: does this development make the product easier to trust, easier to adopt, or easier to connect to business outcomes?

## Key Takeaways

- Look beyond the launch and identify the workflow or customer behavior it changes.
- Separate technical novelty from business usefulness.
- Check whether the product decision improves trust, speed, cost, convenience, or clarity.
- Keep the final article grounded in verified sources, not broad market claims.

## Review TODOs

- Verify the primary source and add at least one supporting source.
- Replace any generic phrasing with source-specific details.
- Add the clearest business, product, marketing, or consumer behavior lesson.
- Confirm the article link and hero image prompt before publishing.

## Sources

${formatMarkdownSources(candidate.sourceLinks)}
`;

  const linkedinMarkdown = `The most interesting part of this week's topic is not the announcement itself.

It is the business question underneath it: what changes when a technical capability becomes a real product or workflow decision?

My working read:

- The product lesson is in adoption, not novelty.
- The business value depends on trust, timing, and packaging.
- The marketing question is whether customers understand the job this solves.
- The strategy question is whether this creates a durable behavior shift.

Full draft for review: ${articleUrl}

What would you look for first: technical capability, customer behavior, or business model impact?

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
        "The strongest story is not the technical announcement. It is the decision, behavior, or business tradeoff the announcement changes.",
      heroImagePrompt:
        "Create a premium editorial abstract image for a business/product insight article. Show a calm strategy workspace with subtle AI signal lines, a decision map, and restrained data patterns. Use warm neutral light, refined contrast, no logos, no product screenshots, no faces, no copyrighted UI, no neon, no crypto styling, and no fake corporate stock-photo look.",
      heroAltText:
        "Abstract editorial visual of AI signals, product decisions, and business strategy notes.",
      suggestedVisualStyle:
        "Premium editorial, abstract, warm neutral palette, thin linework, restrained depth, portfolio-ready, LinkedIn-safe.",
      visualPrompts: [
        {
          prompt:
            "A minimal diagram-style visual showing technical capability moving into product packaging, customer adoption, and business outcome. Use thin lines, calm contrast, no brand marks, and no real UI.",
          altText:
            "Abstract diagram showing technical capability flowing into product adoption and business outcomes.",
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
  const category = rawDraft.category || candidate.category || inferCategory(title);

  return {
    title,
    slug,
    category,
    tags: Array.isArray(rawDraft.tags) && rawDraft.tags.length ? rawDraft.tags.slice(0, 6) : buildTags(candidate, category),
    summary: cleanText(rawDraft.summary || candidate.summary || "Weekly insight draft for review."),
    keyInsight: cleanText(rawDraft.keyInsight || "The business lesson should be sharpened during review."),
    heroImagePrompt: cleanText(rawDraft.heroImagePrompt || ""),
    heroAltText: cleanText(rawDraft.heroAltText || `Editorial visual for ${title}`),
    suggestedVisualStyle: cleanText(
      rawDraft.suggestedVisualStyle ||
        "Premium editorial, abstract, business/product/AI inspired, modern, restrained, not cartoonish, not neon, not cyberpunk.",
    ),
    visualPrompts: normalizeVisualPrompts(rawDraft.visualPrompts).slice(0, 3),
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
approvalStatus: "not_requested"
---

# Research Note: ${draft.title}

<!-- TODO: Human approval required. Confirm the topic, source quality, and final angle before publishing any related content. -->

## Selected Topic

${candidate.title}

## Why This Topic Was Selected

- Category fit: ${draft.category}
- Business relevance: product, market, workflow, customer, or strategy implications are present.
- Audience fit: useful for MBA, product, marketing, analytics, startup, and business-curious readers.
- Narrative potential: ${draft.keyInsight}

## Source Links

${formatMarkdownSources(candidate.sourceLinks)}

## Source Review Notes

- Verify publication dates and whether sources are primary or secondary.
- Add at least one primary source before publishing if the selected source is a news article.
- Keep unsupported claims marked as TODO until verified.

## Draft Angle

${draft.summary}

## Human Review TODOs

- Confirm this is the right weekly topic.
- Replace weak or generic lines with specific evidence from sources.
- Check every factual claim against a stored source link.
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
heroImagePrompt: ${yamlString(draft.heroImagePrompt)}
supportingVisualPrompts:
${toYamlVisualPrompts(draft.visualPrompts)}
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

${draft.heroImagePrompt || "TODO: Add a copyright-safe hero image prompt before publishing."}

Alt text: ${draft.heroAltText || "TODO: Add alt text before publishing."}

Suggested visual style: ${draft.suggestedVisualStyle}

## Optional Visual Prompts

${draft.visualPrompts.length ? draft.visualPrompts.map((visual) => `- Prompt: ${visual.prompt}\n  Alt text: ${visual.altText}\n  Suggested use: ${visual.suggestedUse}`).join("\n") : "- TODO: Add 1 to 3 supporting visual prompts if useful."}

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
      return `- [${escapeMarkdown(title)}](${url})${publisher}${date}${accessed}.${claim}`;
    })
    .join("\n");
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

function toYamlList(values = []) {
  if (!values.length) {
    return "  - Business";
  }

  return values.map((value) => `  - ${yamlString(value)}`).join("\n");
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
