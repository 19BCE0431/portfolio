import { SITE_URL } from "./config";
import { publishGeneratedFiles, saveAutomationRun } from "./store";
import {
  getCycleSchedule,
  nextSuggestedPostAt,
  type ContentCycleType,
} from "./schedule";
import type { ContentQualityScores, LinkedInAutomationRun, TopicCandidate } from "./types";
import { getPublishedJournalPosts } from "../../data/journal";

type GeneratedContent = {
  run: LinkedInAutomationRun;
  journalMarkdown: string;
  linkedinDraftMarkdown: string;
};

const JOURNAL_LINK_PLACEHOLDER = "[Portfolio journal link will be added after approval]";

const CONTENT_SYSTEM_PROMPT = `You create portfolio journal articles and LinkedIn drafts for Mohit Sai Krishna Peddakotla.
Write as a thoughtful MBA + data/product person, not as an AI influencer.
The audience includes expert operators, product people, marketers, strategists, analytics people, and MBA peers. They do not need basic explanations.
Every idea must feel specific, non-obvious, and earned through a business lens.
Avoid hype, stock advice, politics, fake claims, exaggerated certainty, generic motivation, generic AI blog language, and familiar AI talking points.
Return valid JSON only.`;

type GenerateOptions = {
  cycleType: ContentCycleType;
  dryRun?: boolean;
};

export async function generateAndPublishAutomationRun(options: GenerateOptions) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      status: "skipped" as const,
      reason: "OPENAI_API_KEY is missing.",
    };
  }

  const generated = await generateContent(options.cycleType);

  if (options.dryRun) {
    return {
      status: "dry_run" as const,
      run: generated.run,
      journalPreview: generated.journalMarkdown,
      linkedinPreview: generated.linkedinDraftMarkdown,
    };
  }

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
    status: "draft_saved" as const,
    run: generated.run,
  };
}

async function generateContent(cycleType: ContentCycleType): Promise<GeneratedContent> {
  const candidates = fallbackCandidates(cycleType);
  const prompt = buildPrompt(cycleType, candidates, recentPublishedTopics());
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
    contentQualityScores?: Partial<ContentQualityScores>;
  };

  const linkedinDraft = withPendingJournalPlaceholder(parsed.linkedinDraft);
  assertHighSignalDraft(linkedinDraft);
  const qualityScores = normalizeQualityScores(parsed.contentQualityScores);
  assertEliteQualityScores(qualityScores);

  const slug = safeSlug(parsed.slug || parsed.title);
  const date = localDate(new Date());
  const journalPath = `content/journal/${date}-${slug}.md`;
  const linkedinDraftPath = `content/linkedin-drafts/${date}-${slug}.md`;
  const journalUrl = `${SITE_URL}/journal/${slug}?utm_source=linkedin&utm_medium=post&utm_campaign=${slug}`;
  const predictedPostAt = nextSuggestedPostAt(cycleType);
  const run: LinkedInAutomationRun = {
    id: `${date}-${slug}`,
    cycleType,
    topic: parsed.title,
    selectedWhy: parsed.selectedWhy,
    riskLevel: "low",
    journalTitle: parsed.title,
    journalSlug: slug,
    journalUrl,
    journalPreview: parsed.summary,
    journalPath,
    linkedinDraftPath,
    linkedinDraft,
    predictedPostAt,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    status: "pending_review",
    candidateTopics: parsed.candidateTopics?.length ? parsed.candidateTopics : candidates,
    sourceLinks: parsed.sourceLinks || [],
    qualityScores,
    scores: {
      linkedinFinal: averageScores(qualityScores),
      journalQuality: averageScores(qualityScores),
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
    body: linkedinDraft,
  });

  return { run, journalMarkdown, linkedinDraftMarkdown };
}

function buildPrompt(
  cycleType: ContentCycleType,
  candidates: TopicCandidate[],
  previousTopics: Array<{ title: string; slug: string; category: string }>,
) {
  const schedule = getCycleSchedule(cycleType);
  const cycleBrief =
    cycleType === "tuesday_market"
      ? `This is the Tuesday AI/Business post. It must be AI + business + MBA-level market analysis. It should include a market mechanism, business implication, and strategic analysis.`
      : `This is the Thursday Career/Reflection post. It must center career learning, IIM life, internship reflection, portfolio/project reflection, or personal growth. It should feel grounded in Mohit's MBA learning and professional development, not like generic motivation.`;

  return `Create one portfolio journal draft and one LinkedIn post draft.

Audience: MBA students, tech professionals, product/marketing/strategy aspirants, AI/business analytics people, recruiters.
Positioning: IIM Sirmaur MBA candidate, Top 10% academic signal, Computer Science + Data Science background, experience in automation, anomaly detection, price intelligence, dashboards, image search, AI workflows, data pipelines, and business operations.

Schedule lane:
- ${schedule.label}
- Content type: ${schedule.contentType}
- Email subject prefix: ${schedule.emailSubjectPrefix}
- ${cycleBrief}

Quality bar:
- The first two lines must raise an eyebrow. No textbook hook.
- The main insight must be clear within the first 2-3 lines.
- Assume readers already know "agentic AI", "AI tools", and "automation"; do not explain basics.
- Make a sharper business claim that connects product, marketing, strategy, analytics, or operations.
- Use concrete operating examples such as pricing, customer operations, category decisions, discovery/search, dashboards, or campaign learning.
- The post must sound like Mohit: analytical, warm, observant, slightly skeptical of easy business language, grounded in IIM MBA learning plus data/product/automation experience.
- Never sound like a generic LinkedIn creator, motivational page, consulting template, or AI influencer.
- Add a Stanford/Wharton-level MBA analytics layer in every topic: define the hidden metric, name the operating risk, explain what leading indicator a manager should track, and show why the issue matters before it appears in normal KPIs.
- Include one compact "analytics summary" in the journal body with 3-5 sharp lines: signal, proxy metric, leading indicator, management question, and action implication.
- For LinkedIn, convert that analytics layer into natural prose, not a labeled classroom paragraph.
- Do at least 3 internal revisions before returning the final post: first for hook, second for MBA analytics depth, third for humanness/voice.
- Create 5 internal LinkedIn versions, score them, then return only the best merged final.
- Score the final LinkedIn draft using these 20 metrics from 0-10: eyebrowRaise, novelty, intellectualTension, reflection, commentPotential, memorability, mbaDepth, humanness, escalation, shareability, insightDensity, contrarianStrength, frameworkQuality, evidenceCredibility, boardroomRelevance, discussionLongevity, quoteability, patternRecognition, perspectiveShift, neverThoughtThatWay.
- Every metric must be at least 9.0, and the average should be at least 9.5. If not, revise again before returning.
- Avoid these weak patterns and words: "AI is no longer just...", "AI is becoming...", "In today's fast-paced world", "in today's world", "not just a tool", "game-changer", "revolutionize", "unlock", "delve", "journey", "thrilled", "think about that", "every organization has", "the best organizations understand this".
- Use 2-4 hashtags only, and make them specific. Avoid broad hashtag dumps such as #MBA #Leadership #BusinessStrategy #Management #Consulting all together.
- Use vivid concrete scenes sparingly: a founder checking escalation dashboards, a manager wondering why approvals slow down, a team discovering a hidden queue. It should feel immersive without becoming fiction.
- Include numbers as analytical proxies where appropriate, such as "one person owning 60-70% of escalations" or "approval time doubling when they are unavailable"; mark them as diagnostic examples, not fake company facts.

Candidate topic directions:
${JSON.stringify(candidates, null, 2)}

Already-published portfolio topics to avoid repeating:
${JSON.stringify(previousTopics, null, 2)}

Topic diversity rule:
- Do not create another generic AI infrastructure, agentic AI, or workflow ownership post unless the mechanism is meaningfully new.
- Prefer fresh angles across pricing, consumer behavior, marketing strategy, retail/e-commerce, product discovery, analytics, market structure, or MBA learning applied to business.
- A reader should feel they learned a new operating lens, not a renamed version of the last post.
- Today, if the Tuesday lane is active, strongly prefer the "top performer as operational debt" candidate unless it repeats a recently published topic.

Return JSON with: slug, title, summary, category, tags, selectedWhy, linkedinDraft, journalBody, sourceLinks, candidateTopics, contentQualityScores.
Journal body must be immersive markdown with:
- a short hook/introduction
- why this matters now
- main insight
- business/MBA-level analysis
- a compact MBA analytics summary with hidden metric, proxy metric, leading indicator, and managerial action
- Mohit's personal reflection as an IIM MBA student
- practical takeaway
- closing thought
- sources/references if used
Use ## headings, readable sections, and a polished portfolio tone. It must not feel like a generic AI blog.
LinkedIn draft must be fully copy-ready, 180-350 words, mobile-readable, strong hook, concise but not shallow, human tone, one thoughtful closing question, and 2-4 relevant hashtags maximum.
Before approval, the LinkedIn draft must include this exact placeholder where the journal link belongs: ${JOURNAL_LINK_PLACEHOLDER}`;
}

function fallbackCandidates(cycleType: ContentCycleType): TopicCandidate[] {
  if (cycleType === "thursday_reflection") {
    return [
      {
        topic: "The MBA lesson hidden inside portfolio work",
        angle:
          "A reflection on how building visible projects teaches judgment: what to simplify, what to prove, and what to leave out.",
        timeliness: 8,
        audienceRelevance: 9,
        nonObviousness: 9,
        engagementPotential: 9,
        journalDepthPotential: 10,
        personalBrandFit: 10,
        riskLevel: "low",
        totalScore: 9.3,
      },
      {
        topic: "Career clarity comes from constraints",
        angle:
          "An IIM MBA reflection on how time, internship searches, live projects, and public portfolio work sharpen what kind of work actually fits.",
        timeliness: 8,
        audienceRelevance: 9,
        nonObviousness: 9,
        engagementPotential: 8,
        journalDepthPotential: 9,
        personalBrandFit: 10,
        riskLevel: "low",
        totalScore: 9.1,
      },
    ];
  }

  return [
    {
      topic: "Your strongest employee may be your biggest organizational risk",
      angle:
        "A Mohit-style MBA analytics lens on top performers as hidden operational debt: when one person absorbs ambiguity, escalations, approvals, and tacit knowledge, the company is not only seeing excellence; it is seeing a fragile capability with low redundancy. Frame it through key-person dependency, process debt, decision latency, handoff failure rate, escalation concentration, and capability survivability.",
      timeliness: 9,
      audienceRelevance: 10,
      nonObviousness: 10,
      engagementPotential: 10,
      journalDepthPotential: 10,
      personalBrandFit: 10,
      riskLevel: "low",
      totalScore: 9.8,
    },
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
    "in today’s fast-paced world",
    "in today's world",
    "in today’s world",
    "game-changer",
    "revolutionize",
    "unlock",
    "delve",
    "journey",
    "thrilled",
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

  const hashtagCount = (draft.match(/(^|\s)#[A-Za-z0-9_]+/g) || []).length;
  if (hashtagCount > 4) {
    throw new Error("Generated LinkedIn draft has too many hashtags.");
  }

  if (!draft.includes(JOURNAL_LINK_PLACEHOLDER)) {
    throw new Error("Generated LinkedIn draft is missing the approval placeholder link.");
  }
}

const QUALITY_SCORE_KEYS: Array<keyof ContentQualityScores> = [
  "eyebrowRaise",
  "novelty",
  "intellectualTension",
  "reflection",
  "commentPotential",
  "memorability",
  "mbaDepth",
  "humanness",
  "escalation",
  "shareability",
  "insightDensity",
  "contrarianStrength",
  "frameworkQuality",
  "evidenceCredibility",
  "boardroomRelevance",
  "discussionLongevity",
  "quoteability",
  "patternRecognition",
  "perspectiveShift",
  "neverThoughtThatWay",
];

function normalizeQualityScores(scores?: Partial<ContentQualityScores>): ContentQualityScores {
  const normalized = {} as ContentQualityScores;

  for (const key of QUALITY_SCORE_KEYS) {
    const value = Number(scores?.[key]);
    normalized[key] = Number.isFinite(value) ? Math.max(0, Math.min(10, value)) : 9.2;
  }

  return normalized;
}

function assertEliteQualityScores(scores: ContentQualityScores) {
  const lowScores = QUALITY_SCORE_KEYS.filter((key) => scores[key] < 9);

  if (lowScores.length) {
    throw new Error(`Generated content quality scores below 9: ${lowScores.join(", ")}.`);
  }

  if (averageScores(scores) < 9.5) {
    throw new Error("Generated content average quality score is below 9.5.");
  }
}

function averageScores(scores: ContentQualityScores) {
  const total = QUALITY_SCORE_KEYS.reduce((sum, key) => sum + scores[key], 0);

  return Number((total / QUALITY_SCORE_KEYS.length).toFixed(1));
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
status: pending_review
category: "${escapeYaml(category)}"
tags:
${tags.map((tag) => `  - ${tag}`).join("\n")}
summary: "${escapeYaml(summary)}"
readingTime: "6 min read"
canonicalUrl: "${SITE_URL}/journal/${slug}"
approvalStatus: pending_review
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
}: {
  title: string;
  slug: string;
  date: string;
  body: string;
}) {
  return `---
title: "${escapeYaml(title)}"
slug: ${slug}
date: ${date}
status: draft
relatedBlogSlug: ${slug}
relatedBlogUrl: ""
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
  return nextSuggestedPostAt("tuesday_market", from);
}

export function getFinalLinkedInDraft(run: Pick<LinkedInAutomationRun, "linkedinDraft" | "journalUrl">) {
  if (run.linkedinDraft.includes(JOURNAL_LINK_PLACEHOLDER)) {
    return run.linkedinDraft.replace(JOURNAL_LINK_PLACEHOLDER, run.journalUrl);
  }

  if (run.linkedinDraft.includes(run.journalUrl)) {
    return run.linkedinDraft;
  }

  return `${run.linkedinDraft.trim()}\n\nFull journal:\n${run.journalUrl}`;
}

function withPendingJournalPlaceholder(value: string) {
  const draft = (value || "").trim();

  if (draft.includes(JOURNAL_LINK_PLACEHOLDER)) {
    return draft;
  }

  const withoutUrls = draft.replace(/https:\/\/mohitsaikrishna\.in\/journal\/\S+/g, JOURNAL_LINK_PLACEHOLDER);

  if (withoutUrls.includes(JOURNAL_LINK_PLACEHOLDER)) {
    return withoutUrls;
  }

  return `${draft}\n\nFull journal:\n${JOURNAL_LINK_PLACEHOLDER}`;
}
