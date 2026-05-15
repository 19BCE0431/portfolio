#!/usr/bin/env node

const fs = require("node:fs/promises");
const { existsSync } = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const ANALYTICS_DIR = path.join(ROOT, "content", "analytics");
const REPORTS_DIR = path.join(ANALYTICS_DIR, "reports");
const LINKEDIN_CSV = path.join(ANALYTICS_DIR, "linkedin-performance.csv");
const JOURNAL_CSV = path.join(ANALYTICS_DIR, "journal-performance.csv");

main().catch((error) => {
  console.error("Content performance analysis failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const date = String(args.date || localDate(new Date()));
  const dryRun = Boolean(args["dry-run"]);

  await fs.mkdir(REPORTS_DIR, { recursive: true });

  const linkedInRows = await readCsvIfExists(LINKEDIN_CSV);
  const journalRows = await readCsvIfExists(JOURNAL_CSV);
  const analysis = analyzePerformance(linkedInRows, journalRows);
  const report = buildReport(analysis, date);

  if (dryRun) {
    console.log(report);
    return;
  }

  const reportPath = path.join(REPORTS_DIR, `${date}-content-performance.md`);
  await fs.writeFile(reportPath, report, "utf8");
  console.log(`Content performance report created: ${relativePath(reportPath)}`);
}

function analyzePerformance(linkedInRows, journalRows) {
  const linkedIn = linkedInRows
    .map(normalizeLinkedInRow)
    .filter((row) => row.postSlug || row.topic);
  const journal = journalRows
    .map(normalizeJournalRow)
    .filter((row) => row.articleSlug);

  const bestLinkedInPosts = [...linkedIn]
    .sort((first, second) => second.performanceScore - first.performanceScore)
    .slice(0, 5);
  const weakLinkedInPosts = [...linkedIn]
    .filter((row) => row.impressions || row.engagementRate)
    .sort((first, second) => first.performanceScore - second.performanceScore)
    .slice(0, 5);
  const bestJournalArticles = [...journal]
    .sort((first, second) => second.performanceScore - first.performanceScore)
    .slice(0, 5);

  const pillarStats = rankGroups(groupBy(linkedIn, "pillar"), linkedInGroupScore);
  const hookStats = rankGroups(groupBy(linkedIn, "hookType"), linkedInGroupScore);
  const formatStats = rankGroups(groupBy(linkedIn, "format"), linkedInGroupScore);
  const sourceStats = rankGroups(groupBy(journal, "source"), journalGroupScore);

  return {
    linkedIn,
    journal,
    bestLinkedInPosts,
    weakLinkedInPosts,
    bestJournalArticles,
    pillarStats,
    hookStats,
    formatStats,
    sourceStats,
    recommendation: recommendNextDirection({
      pillarStats,
      hookStats,
      formatStats,
      sourceStats,
      bestLinkedInPosts,
      bestJournalArticles,
    }),
  };
}

function normalizeLinkedInRow(row) {
  const impressions = number(row.impressions);
  const reactions = number(row.reactions);
  const comments = number(row.comments);
  const reposts = number(row.reposts);
  const clicks = number(row.clicks);
  const profileVisits = number(row.profileVisits);
  const engagementRate =
    number(row.engagementRate) ||
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
    performanceScore: Math.round(
      engagementRate * 10 + comments * 2 + clicks * 1.5 + reposts * 2 + profileVisits,
    ),
  };
}

function normalizeJournalRow(row) {
  const pageViews = number(row.pageViews);
  const readTime = number(row.readTime);
  const clicksFromLinkedIn = number(row.clicksFromLinkedIn);

  return {
    ...row,
    pageViews,
    readTime,
    clicksFromLinkedIn,
    performanceScore: Math.round(pageViews + clicksFromLinkedIn * 2 + readTime * 0.2),
  };
}

function linkedInGroupScore(rows) {
  const totalImpressions = sum(rows, "impressions");
  const totalComments = sum(rows, "comments");
  const totalClicks = sum(rows, "clicks");
  const averageEngagementRate = average(rows.map((row) => row.engagementRate));

  return Math.round(averageEngagementRate * 10 + totalComments * 2 + totalClicks + totalImpressions * 0.01);
}

function journalGroupScore(rows) {
  return Math.round(sum(rows, "pageViews") + sum(rows, "clicksFromLinkedIn") * 2 + average(rows.map((row) => row.readTime)));
}

function rankGroups(groups, scoreFn) {
  return Object.entries(groups)
    .filter(([key]) => key && key !== "unknown")
    .map(([key, rows]) => ({
      key,
      count: rows.length,
      score: scoreFn(rows),
      rows,
    }))
    .sort((first, second) => second.score - first.score);
}

function recommendNextDirection(analysis) {
  const topPillar = analysis.pillarStats[0]?.key || "";
  const topHook = analysis.hookStats[0]?.key || "";
  const topFormat = analysis.formatStats[0]?.key || "";
  const topSource = analysis.sourceStats[0]?.key || "";
  const bestTopic = analysis.bestLinkedInPosts[0]?.topic || analysis.bestJournalArticles[0]?.articleSlug || "";

  if (!topPillar && !topHook && !topFormat && !bestTopic) {
    return "No performance data yet. Start with manual rows after each LinkedIn post and journal article, then rerun this script after 3-5 posts.";
  }

  const parts = [];
  if (topPillar) parts.push(`lean toward "${topPillar}"`);
  if (topHook) parts.push(`use a "${topHook}" hook`);
  if (topFormat) parts.push(`try the "${topFormat}" format`);
  if (topSource) parts.push(`watch traffic from "${topSource}"`);
  if (bestTopic) parts.push(`study why "${bestTopic}" performed well`);

  return `Next week, ${parts.join(", ")}. Keep the topic useful and discussion-led, not controversy-led.`;
}

function buildReport(analysis, date) {
  return `# Content Performance Report: ${date}

## Summary

- LinkedIn rows reviewed: ${analysis.linkedIn.length}
- Journal rows reviewed: ${analysis.journal.length}
- Recommendation: ${analysis.recommendation}

## Best-Performing LinkedIn Topics

${formatLinkedInRows(analysis.bestLinkedInPosts)}

## Weak LinkedIn Topics To Learn From

${formatLinkedInRows(analysis.weakLinkedInPosts)}

## Best-Performing Journal Articles

${formatJournalRows(analysis.bestJournalArticles)}

## Best Pillars

${formatGroupStats(analysis.pillarStats)}

## Best Hooks

${formatGroupStats(analysis.hookStats)}

## Best Formats

${formatGroupStats(analysis.formatStats)}

## Journal Traffic Sources

${formatGroupStats(analysis.sourceStats)}

## Next Week Direction

${analysis.recommendation}

## Comment Strategy

- Do not auto-reply to LinkedIn comments.
- Collect comments manually for now, or through the official LinkedIn API later if available and permitted.
- Generate suggested replies only as drafts.
- Mohit approves every reply before posting.
- Replies should be thoughtful, concise, professional, and non-defensive.
- Avoid argumentative replies, fake controversy, or engagement-bait.
`;
}

function formatLinkedInRows(rows) {
  if (!rows.length) {
    return "- No LinkedIn performance rows yet.";
  }

  return rows
    .map(
      (row) =>
        `- ${row.postSlug || row.topic}: ${row.pillar || "unknown pillar"}, ${row.hookType || "unknown hook"}, ${row.format || "unknown format"}; impressions ${row.impressions}, comments ${row.comments}, clicks ${row.clicks}, engagement ${round(row.engagementRate)}%. ${row.notes || ""}`.trim(),
    )
    .join("\n");
}

function formatJournalRows(rows) {
  if (!rows.length) {
    return "- No journal performance rows yet.";
  }

  return rows
    .map(
      (row) =>
        `- ${row.articleSlug}: page views ${row.pageViews}, read time ${row.readTime}, LinkedIn clicks ${row.clicksFromLinkedIn}, source ${row.source || "unknown"}. ${row.notes || ""}`.trim(),
    )
    .join("\n");
}

function formatGroupStats(groups) {
  if (!groups.length) {
    return "- No data yet.";
  }

  return groups
    .slice(0, 8)
    .map((group) => `- ${group.key}: score ${group.score}, rows ${group.count}`)
    .join("\n");
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

function groupBy(rows, key) {
  return rows.reduce((groups, row) => {
    const groupKey = String(row[key] || "unknown").trim() || "unknown";
    groups[groupKey] = groups[groupKey] || [];
    groups[groupKey].push(row);
    return groups;
  }, {});
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + number(row[key]), 0);
}

function average(values) {
  const numeric = values.map(number).filter((value) => Number.isFinite(value));
  if (!numeric.length) {
    return 0;
  }

  return numeric.reduce((total, value) => total + value, 0) / numeric.length;
}

function number(value) {
  const parsed = Number(String(value || "").replace(/%$/, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function round(value) {
  return Math.round(number(value) * 100) / 100;
}

function parseArgs(argv) {
  const result = {};

  for (let index = 0; index < argv.length; index += 1) {
    const raw = argv[index];
    if (!raw.startsWith("--")) continue;

    const [key, inlineValue] = raw.slice(2).split("=");
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

function localDate(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.TZ || "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function relativePath(filePath) {
  return path.relative(ROOT, filePath);
}
