#!/usr/bin/env node

const fs = require("node:fs/promises");
const { existsSync } = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const DRAFT_DIR = path.join(ROOT, "content", "linkedin-drafts");
const JOURNAL_DIR = path.join(ROOT, "content", "journal");
const MAX_LINKEDIN_LENGTH = 2800;
const LINKEDIN_API_VERSION = process.env.LINKEDIN_VERSION || "202602";

main().catch((error) => {
  console.error("LinkedIn posting failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

async function main() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const args = parseArgs(process.argv.slice(2));
  const draftInput = args.draft || args.slug || args._[0];
  const dryRun = Boolean(args["dry-run"]);
  const resultPath = args.result ? path.resolve(ROOT, String(args.result)) : "";

  if (!draftInput) {
    throw new Error("Missing draft slug or file path. Example: node scripts/post-to-linkedin.js --draft my-draft-slug");
  }

  const draftPath = await resolveDraftPath(String(draftInput));
  const raw = await fs.readFile(draftPath, "utf8");
  const parsed = parseMarkdownWithFrontmatter(raw);
  const status = String(parsed.frontmatter.status || "").trim();

  if (status === "posted") {
    console.log("LinkedIn posting skipped: draft is already marked posted.");
    return;
  }

  if (status !== "approved") {
    throw new Error(`LinkedIn draft must be approved before posting. Current status: ${status || "missing"}`);
  }

  const relatedBlogUrl = resolveBlogUrl(parsed.frontmatter.relatedBlogUrl, parsed.frontmatter.relatedBlogSlug);
  if (!relatedBlogUrl) {
    throw new Error("LinkedIn draft is missing relatedBlogUrl or relatedBlogSlug.");
  }

  if (!parsed.frontmatter.relatedBlogSlug) {
    throw new Error("LinkedIn draft is missing relatedBlogSlug.");
  }

  const relatedBlog = await getJournalPostFrontmatter(String(parsed.frontmatter.relatedBlogSlug));
  if (!relatedBlog) {
    throw new Error(`Portfolio blog draft not found for slug: ${parsed.frontmatter.relatedBlogSlug}`);
  }

  if (relatedBlog.status !== "published") {
    throw new Error(`Portfolio blog must be published before LinkedIn posting. Current status: ${relatedBlog.status || "missing"}`);
  }

  const commentary = buildLinkedInCommentary(parsed.body, relatedBlogUrl);
  validateCommentary(commentary);

  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const authorUrn = process.env.LINKEDIN_AUTHOR_URN;

  if (!accessToken) {
    throw new Error("Missing LINKEDIN_ACCESS_TOKEN. Add it as a GitHub Actions secret or local .env.local value.");
  }

  if (!authorUrn) {
    throw new Error("Missing LINKEDIN_AUTHOR_URN. Add your LinkedIn member author URN as a GitHub Actions secret or local .env.local value.");
  }

  if (dryRun) {
    console.log("LinkedIn dry run complete. No post was created.");
    console.log(`Draft: ${relativePath(draftPath)}`);
    console.log(`Blog URL: ${relatedBlogUrl}`);
    console.log(`Characters: ${commentary.length}`);
    return;
  }

  const postId = await createLinkedInPost({ accessToken, authorUrn, commentary });
  const postedUrl = buildLinkedInPostUrl(postId);
  const result = {
    draftPath: relativePath(draftPath),
    blogUrl: relatedBlogUrl,
    linkedInPostId: postId,
    linkedInUrl: postedUrl,
  };
  const updated = updateFrontmatter(raw, {
    status: "posted",
    postedDate: new Date().toISOString(),
    linkedinPostId: postId,
    linkedinPostUrl: postedUrl,
  });

  await fs.writeFile(draftPath, updated, "utf8");
  if (resultPath) {
    await fs.writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  }
  console.log("LinkedIn post published successfully.");
  console.log(`Draft updated: ${relativePath(draftPath)}`);
  console.log(`Post ID: ${postId}`);
  if (postedUrl) {
    console.log(`Post URL: ${postedUrl}`);
  }
}

function parseArgs(argv) {
  const result = { _: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const raw = argv[index];
    if (!raw.startsWith("--")) {
      result._.push(raw);
      continue;
    }

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

async function resolveDraftPath(input) {
  const directPath = path.isAbsolute(input) ? input : path.join(ROOT, input);
  if (existsSync(directPath)) {
    return directPath;
  }

  const files = (await fs.readdir(DRAFT_DIR)).filter((file) => file.endsWith(".md"));
  for (const file of files) {
    const filePath = path.join(DRAFT_DIR, file);
    if (file.includes(input)) {
      return filePath;
    }

    const raw = await fs.readFile(filePath, "utf8");
    const parsed = parseMarkdownWithFrontmatter(raw);
    if (parsed.frontmatter.relatedBlogSlug === input) {
      return filePath;
    }
  }

  throw new Error(`LinkedIn draft not found for: ${input}`);
}

function parseMarkdownWithFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: markdown };
  }

  return {
    frontmatter: parseSimpleYaml(match[1]),
    body: match[2],
  };
}

function parseSimpleYaml(raw) {
  const result = {};
  const lines = raw.split(/\r?\n/);
  let currentKey = "";

  for (const line of lines) {
    if (/^\s+-\s+/.test(line) && currentKey) {
      result[currentKey] = Array.isArray(result[currentKey]) ? result[currentKey] : [];
      result[currentKey].push(stripYamlValue(line.replace(/^\s+-\s+/, "")));
      continue;
    }

    const match = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!match) {
      continue;
    }

    currentKey = match[1];
    const value = match[2];
    result[currentKey] = value ? stripYamlValue(value) : "";
  }

  return result;
}

function stripYamlValue(value) {
  return String(value || "").trim().replace(/^["']|["']$/g, "");
}

function updateFrontmatter(markdown, updates) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error("Cannot update draft metadata because frontmatter is missing.");
  }

  const lines = match[1].split(/\r?\n/);
  const seen = new Set();
  const updatedLines = lines.map((line) => {
    const key = line.match(/^([A-Za-z0-9_]+):/)?.[1];
    if (!key || !(key in updates)) {
      return line;
    }

    seen.add(key);
    return `${key}: ${JSON.stringify(updates[key])}`;
  });

  for (const [key, value] of Object.entries(updates)) {
    if (!seen.has(key)) {
      updatedLines.push(`${key}: ${JSON.stringify(value)}`);
    }
  }

  return `---\n${updatedLines.join("\n")}\n---\n${match[2]}`;
}

function resolveBlogUrl(frontmatterUrl, slug) {
  const rawUrl = String(frontmatterUrl || "").trim();
  const baseUrl = String(process.env.WEEKLY_INSIGHT_PORTFOLIO_BASE_URL || "").replace(/\/$/, "");

  if (rawUrl.startsWith("https://")) {
    return rawUrl;
  }

  if (rawUrl.startsWith("/") && baseUrl) {
    return `${baseUrl}${rawUrl}`;
  }

  if (slug && baseUrl) {
    return `${baseUrl}/journal/${slug}`;
  }

  return rawUrl;
}

async function getJournalPostFrontmatter(slug) {
  const files = (await fs.readdir(JOURNAL_DIR)).filter((file) => file.endsWith(".md"));

  for (const file of files) {
    const raw = await fs.readFile(path.join(JOURNAL_DIR, file), "utf8");
    const parsed = parseMarkdownWithFrontmatter(raw);
    if (parsed.frontmatter.slug === slug || file.includes(slug)) {
      return parsed.frontmatter;
    }
  }

  return null;
}

function buildLinkedInCommentary(body, relatedBlogUrl) {
  const cleaned = body
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^# LinkedIn Draft\s*/i, "")
    .trim();

  if (cleaned.includes(relatedBlogUrl)) {
    return cleaned;
  }

  return `${cleaned}\n\nRead the full analysis: ${relatedBlogUrl}`;
}

function validateCommentary(commentary) {
  if (!commentary.trim()) {
    throw new Error("LinkedIn draft content is empty.");
  }

  if (commentary.length > MAX_LINKEDIN_LENGTH) {
    throw new Error(`LinkedIn draft is too long (${commentary.length} characters). Keep it under ${MAX_LINKEDIN_LENGTH} characters.`);
  }

  if (!/^.{12,}/.test(commentary)) {
    throw new Error("LinkedIn draft needs a stronger opening hook before posting.");
  }
}

async function createLinkedInPost({ accessToken, authorUrn, commentary }) {
  const response = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Linkedin-Version": LINKEDIN_API_VERSION,
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: authorUrn,
      commentary,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LinkedIn API returned ${response.status}. ${redact(errorText)}`);
  }

  return response.headers.get("x-restli-id") || response.headers.get("X-Restli-Id") || "";
}

function buildLinkedInPostUrl(postId) {
  const match = String(postId || "").match(/(?:share|ugcPost):(\d+)/);
  return match ? `https://www.linkedin.com/feed/update/${postId}/` : "";
}

function redact(value) {
  return String(value || "")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [redacted]")
    .replace(/access_token["']?\s*[:=]\s*["']?[A-Za-z0-9._-]+/gi, "access_token=[redacted]");
}

function relativePath(filePath) {
  return path.relative(ROOT, filePath);
}
