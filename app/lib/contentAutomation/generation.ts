import { SITE_URL } from "./config";
import { publishGeneratedFiles, saveAutomationRun } from "./store";
import type { LinkedInAutomationRun, TopicCandidate } from "./types";
import { getPublishedJournalPosts } from "../../data/journal";

type GeneratedContent = {
  run: LinkedInAutomationRun;
  journalMarkdown: string;
  linkedinDraftMarkdown: string;
};

const CONTENT_SYSTEM_PROMPT = `You create portfolio journal articles and LinkedIn drafts for Mohit Sai Krishna Peddakotla.
Write as a thoughtful MBA + data/product person, not as an AI influencer.
The audience includes expert operators, product people, marketers, strategists, analytics people, and MBA peers. They do not need basic explanations.
Every idea must feel specific, non-obvious, and earned through a business lens.
Avoid hype, stock advice, politics, fake claims, exaggerated certainty, generic motivation, and familiar AI talking points.
Return valid JSON only.`;

export async function generateAndPublishAutomationRun() {
  if (!process.env.OPENAI_API_KEY) {
    return {
      status: "skipped" as const,
      reason: "OPENAI_API_KEY is missing.",
    };
  }

  const generated = await generateContent();
  const publishResult = await publishGeneratedFiles(
    [
      { path: generated.run.journalPath, content: generated.journalMarkdown },
      { path: generated.run.linkedinDraftPath, content: generated.linkedinDraftMarkdown },
      {
        path: `content-system/linkedin-runs/${generated.run.id}.json`,
        content: JSON.stringify(generated.run, null, 2) + "\n",
      },
    ],
    `Add LinkedIn journal cycle: ${generated.run.journalSlug}`,
  );

  if (!publishResult.ok) {
    return {
      status: "skipped" as const,
      reason: publishResult.reason,
    };
  }

  await saveAutomationRun(generated.run, `Track LinkedIn approval: ${generated.run.id}`);

  return {
    status: "published" as const,
    run: generated.run,
  };
}

async function generateContent(): Promise<GeneratedContent> {
  const candidates = fallbackCandidates();
  const prompt = buildPrompt(candidates, recentPublishedTopics());
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: CONTENT_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("OpenAI content generation failed.");
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const parsed = JSON.parse(json.choices?.[0]?.message?.content || "{}") as {
    slug: string;
    title: string;
    summary: string;
    category: string;
    tags: string[];
    selectedWhy: string;
    linkedinDraft: string;
    journalBody: string;
    sourceLinks: Array<{ title: string; url: string; publisher?: string; claimSupported?: string }>;
    candidateTopics?: TopicCandidate[];
  };

  assertHighSignalDraft(parsed.linkedinDraft);

  const slug = safeSlug(parsed.slug || parsed.title);
  const date = localDate(new Date());
  const journalPath = `content/journal/${date}-${slug}.md`;
  const linkedinDraftPath = `content/linkedin-drafts/${date}-${slug}.md`;
  const journalUrl = `${SITE_URL}/journal/${slug}?utm_source=linkedin&utm_medium=post&utm_campaign=${slug}`;
  const predictedPostAt = nextPostingWindowIso();
  const run: LinkedInAutomationRun = {
    id: `${date}-${slug}`,
    topic: parsed.title,
    selectedWhy: parsed.selectedWhy,
    riskLevel: "low",
    journalTitle: parsed.title,
    journalSlug: slug,
    journalUrl,
    journalPath,
    linkedinDraftPath,
    linkedinDraft: parsed.linkedinDraft,
    predictedPostAt,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: "pending_approval",
    candidateTopics: parsed.candidateTopics?.length ? parsed.candidateTopics : candidates,
    sourceLinks: parsed.sourceLinks || [],
    scores: {
      linkedinFinal: 9.1,
      journalQuality: 9.1,
      risk: 9.5,
    },
  };

  const journalMarkdown = renderJournalMarkdown({
    title: parsed.title,
    slug,
    date,
    summary: parsed.summary,
    category: parsed.category || "AI & Business",
    tags: parsed.tags || ["AI", "Business Strategy", "Product", "Automation", "MBA"],
    sourceLinks: run.sourceLinks,
    body: parsed.journalBody,
    linkedinDraftPath,
  });
  const linkedinDraftMarkdown = renderLinkedInDraftMarkdown({
    title: parsed.title,
    slug,
    date,
    body: parsed.linkedinDraft,
    journalUrl,
  });

  return { run, journalMarkdown, linkedinDraftMarkdown };
}

function buildPrompt(candidates: TopicCandidate[], previousTopics: Array<{ title: string; slug: string; category: string }>) {
  return `Create one portfolio journal article and one LinkedIn post.

Audience: MBA students, tech professionals, product/marketing/strategy aspirants, AI/business analytics people, recruiters.
Positioning: IIM Sirmaur MBA candidate, Top 10% academic signal, Computer Science + Data Science background, experience in automation, anomaly detection, price intelligence, dashboards, image search, AI workflows, data pipelines, and business operations.

Quality bar:
- The first two lines must raise an eyebrow. No textbook hook.
- Assume readers already know "agentic AI", "AI tools", and "automation"; do not explain basics.
- Make a sharper business claim that connects product, marketing, strategy, analytics, or operations.
- Use concrete operating examples such as pricing, customer operations, category decisions, discovery/search, dashboards, or campaign learning.
- The post must sound like a thoughtful person, not a brand page or AI influencer.
- Create 5 internal LinkedIn versions, score them, then return only the best merged final.
- If the best idea would score below 9.2/10 for originality, clarity, expert relevance, and personal-brand fit, return a skip reason instead of forcing content.
- Avoid these weak patterns: "AI is no longer just...", "AI is becoming...", "In today's fast-paced world", "not just a tool", "game-changer", "revolutionize", "unlock potential".

Candidate topic directions:
${JSON.stringify(candidates, null, 2)}

Already-published portfolio topics to avoid repeating:
${JSON.stringify(previousTopics, null, 2)}

Topic diversity rule:
- Do not create another generic AI infrastructure, agentic AI, or workflow ownership post unless the mechanism is meaningfully new.
- Prefer fresh angles across pricing, consumer behavior, marketing strategy, retail/e-commerce, product discovery, analytics, market structure, or MBA learning applied to business.
- A reader should feel they learned a new operating lens, not a renamed version of the last post.

Return JSON with: slug, title, summary, category, tags, selectedWhy, linkedinDraft, journalBody, sourceLinks, candidateTopics.
Journal body must be markdown with ## headings, practical examples, business/product/marketing implications, personal lens, and key takeaways.
LinkedIn draft must be a 1.5-2 minute mobile-readable post, strong hook, crisp structure, personal business lens, soft CTA, max 5 hashtags.`;
}

function fallbackCandidates(): TopicCandidate[] {
  return [
    {
      topic: "AI strategy has a supply chain now",
      angle: "A business strategy lens on why AI decisions now depend on compute capacity, context quality, latency, cost-per-decision, permissions, and feedback loops.",
      timeliness: 9,
      audienceRelevance: 10,
      nonObviousness: 10,
      engagementPotential: 9,
      journalDepthPotential: 10,
      personalBrandFit: 10,
      riskLevel: "low",
      totalScore: 9.7,
    },
    {
      topic: "The next AI moat is capacity discipline",
      angle: "Teams that know which decisions deserve expensive intelligence may beat teams that use large models everywhere.",
      timeliness: 9,
      audienceRelevance: 9,
      nonObviousness: 9,
      engagementPotential: 9,
      journalDepthPotential: 9,
      personalBrandFit: 10,
      riskLevel: "low",
      totalScore: 9.2,
    },
  ];
}

function recentPublishedTopics() {
  return getPublishedJournalPosts()
    .slice(0, 12)
    .map((post) => ({
      title: post.title,
      slug: post.slug,
      category: post.category,
    }));
}

function assertHighSignalDraft(value: string) {
  const draft = value || "";
  const lower = draft.toLowerCase();
  const banned = [
    "in today's fast-paced world",
    "game-changer",
    "revolutionize",
    "unlock potential",
    "ai is no longer just",
    "ai is becoming more interesting",
  ];

  if (draft.length < 1200) {
    throw new Error("Generated LinkedIn draft is too thin.");
  }

  if (banned.some((phrase) => lower.includes(phrase))) {
    throw new Error("Generated LinkedIn draft used a banned generic phrase.");
  }

  if (!draft.includes("?")) {
    throw new Error("Generated LinkedIn draft needs a discussion question.");
  }
}

function renderJournalMarkdown({
  title,
  slug,
  date,
  summary,
  category,
  tags,
  sourceLinks,
  body,
  linkedinDraftPath,
}: {
  title: string;
  slug: string;
  date: string;
  summary: string;
  category: string;
  tags: string[];
  sourceLinks: Array<{ title: string; url: string; publisher?: string; claimSupported?: string }>;
  body: string;
  linkedinDraftPath: string;
}) {
  return `---
title: "${escapeYaml(title)}"
slug: ${slug}
date: ${date}
status: published
category: "${escapeYaml(category)}"
tags:
${tags.map((tag) => `  - ${tag}`).join("\n")}
summary: "${escapeYaml(summary)}"
readingTime: "6 min read"
canonicalUrl: ""
sourceLinks:
${sourceLinks.map((source) => `  - title: "${escapeYaml(source.title)}"\n    url: "${source.url}"\n    publisher: "${escapeYaml(source.publisher || "")}"\n    accessed: "${date}"\n    claimSupported: "${escapeYaml(source.claimSupported || "")}"`).join("\n")}
linkedinShortPost:
  draftPath: ${linkedinDraftPath}
  status: draft
  engagementQuestion: "Where do you think AI workflow ownership will show up first?"
---

${body.trim()}
`;
}

function renderLinkedInDraftMarkdown({
  title,
  slug,
  date,
  body,
  journalUrl,
}: {
  title: string;
  slug: string;
  date: string;
  body: string;
  journalUrl: string;
}) {
  return `---
title: "${escapeYaml(title)}"
slug: ${slug}
date: ${date}
status: draft
relatedBlogSlug: ${slug}
relatedBlogUrl: "${journalUrl}"
hookType: insight
format: text
---

${body.trim()}
`;
}

function safeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function escapeYaml(value: string) {
  return value.replace(/"/g, '\\"');
}

function localDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function nextPostingWindowIso(from = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  const parts = Object.fromEntries(formatter.formatToParts(from).map((part) => [part.type, part.value]));
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentDay = dayNames.indexOf(parts.weekday);
  const preferredDays = new Set([2, 3, 4]);
  let offset = 1;

  while (!preferredDays.has((currentDay + offset) % 7)) {
    offset += 1;
  }

  const target = new Date(from.getTime() + offset * 24 * 60 * 60 * 1000);
  const targetParts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(target).map((part) => [part.type, part.value]),
  );

  return new Date(`${targetParts.year}-${targetParts.month}-${targetParts.day}T09:10:00+05:30`).toISOString();
}
