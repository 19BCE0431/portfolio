#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

main();

function main() {
  const args = parseArgs(process.argv.slice(2));
  const manifestPath = args.manifest
    ? path.resolve(ROOT, String(args.manifest))
    : path.join(ROOT, "weekly-insight-manifest.json");

  if (!fs.existsSync(manifestPath)) {
    fail(`Manifest not found: ${relativePath(manifestPath)}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const articlePath = resolveRequiredPath(manifest.articlePath, "portfolio article");
  const linkedinPath = resolveRequiredPath(manifest.linkedinDraftPath, "LinkedIn draft");

  const articleRaw = fs.readFileSync(articlePath, "utf8");
  const linkedinRaw = fs.readFileSync(linkedinPath, "utf8");
  const article = parseMarkdownWithFrontmatter(articleRaw);
  const linkedin = parseMarkdownWithFrontmatter(linkedinRaw);
  const baseUrl = String(process.env.WEEKLY_INSIGHT_PORTFOLIO_BASE_URL || "").trim();
  const errors = [];

  if (!article.frontmatter.title) errors.push("Blog title is missing.");
  if (!article.frontmatter.summary) errors.push("Blog summary is missing.");
  if (!article.body.trim()) errors.push("Blog article body is empty.");
  if (article.frontmatter.status !== "published") {
    errors.push(`Blog status must be published in auto-publish mode. Current status: ${article.frontmatter.status || "missing"}.`);
  }
  if (!baseUrl || !baseUrl.startsWith("https://")) {
    errors.push("WEEKLY_INSIGHT_PORTFOLIO_BASE_URL must be configured as an https URL.");
  }
  if (!article.frontmatter.canonicalUrl) {
    errors.push("Canonical URL is missing.");
  }
  if (!Array.isArray(article.frontmatter.sourceLinks) || !article.frontmatter.sourceLinks.length) {
    errors.push("Source list is empty.");
  }
  if (!linkedin.body.trim()) {
    errors.push("LinkedIn draft content is empty.");
  }
  if (linkedin.frontmatter.status !== "approved") {
    errors.push(`LinkedIn draft must be approved for auto-post readiness. Current status: ${linkedin.frontmatter.status || "missing"}.`);
  }

  const combined = `${articleRaw}\n${linkedinRaw}`;
  const blockedPatterns = [
    /\bTODO\b/i,
    /placeholder/i,
    /replace this conservative summary/i,
    /source discovery only/i,
    /add source/i,
    /not_requested/i,
  ];

  for (const pattern of blockedPatterns) {
    if (pattern.test(combined)) {
      errors.push(`Blocked placeholder/review text found: ${pattern}`);
    }
  }

  if (errors.length) {
    console.error("Weekly auto-publish validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("Weekly auto-publish validation passed.");
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

function resolveRequiredPath(value, label) {
  if (!value) fail(`Missing ${label} path in manifest.`);
  const filePath = path.resolve(ROOT, value);
  if (!fs.existsSync(filePath)) fail(`${label} not found: ${value}`);
  return filePath;
}

function parseMarkdownWithFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: markdown };
  return {
    frontmatter: parseSimpleYaml(match[1]),
    body: match[2],
  };
}

function parseSimpleYaml(raw) {
  const result = {};
  const lines = raw.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    const value = match[2];

    if (key === "sourceLinks") {
      const sources = [];
      while (/^\s+/.test(lines[index + 1] || "")) {
        index += 1;
        const itemStart = lines[index].match(/^\s+-\s+([A-Za-z0-9_]+):\s*(.*)$/);
        if (itemStart) {
          sources.push({ [itemStart[1]]: stripYamlValue(itemStart[2]) });
          continue;
        }
        const nested = lines[index].match(/^\s+([A-Za-z0-9_]+):\s*(.*)$/);
        if (nested && sources.length) {
          sources[sources.length - 1][nested[1]] = stripYamlValue(nested[2]);
        }
      }
      result[key] = sources;
      continue;
    }

    result[key] = stripYamlValue(value);
  }

  return result;
}

function stripYamlValue(value) {
  return String(value || "").trim().replace(/^["']|["']$/g, "");
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function relativePath(filePath) {
  return path.relative(ROOT, filePath);
}
