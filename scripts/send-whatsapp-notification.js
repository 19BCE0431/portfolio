#!/usr/bin/env node

const { existsSync } = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const GRAPH_API_VERSION = process.env.WHATSAPP_GRAPH_API_VERSION || "v23.0";

main().catch((error) => {
  console.error("WhatsApp notification failed.");
  console.error(error instanceof Error ? redact(error.message) : redact(String(error)));
  process.exitCode = 1;
});

async function main() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const args = parseArgs(process.argv.slice(2));
  const message = buildMessage(args);

  if (!message) {
    throw new Error("Missing WhatsApp message. Use --message or --type draft-ready|linkedin-posted|workflow-failed.");
  }

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const toNumber = process.env.WHATSAPP_TO_NUMBER;

  if (!accessToken || !phoneNumberId || !toNumber) {
    console.log("WhatsApp notification skipped: missing configuration");
    return;
  }

  await sendWhatsAppMessage({
    accessToken,
    phoneNumberId,
    toNumber,
    message,
  });

  console.log("WhatsApp notification sent successfully.");
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

function buildMessage(args) {
  if (args.message) {
    return String(args.message).trim();
  }

  if (args._.length && !args.type) {
    return args._.join(" ").trim();
  }

  const type = String(args.type || "").trim();

  if (type === "draft-ready") {
    const prLink = String(args["pr-link"] || process.env.PR_LINK || "").trim();
    return prLink ? `Weekly insight draft is ready for review: ${prLink}` : "";
  }

  if (type === "linkedin-posted") {
    const blogUrl = String(args["blog-url"] || process.env.BLOG_URL || "").trim();
    const linkedInUrl = String(args["linkedin-url"] || process.env.LINKEDIN_URL || "").trim();
    return blogUrl && linkedInUrl
      ? `Weekly insight published. Blog: ${blogUrl}. LinkedIn: ${linkedInUrl}`
      : "";
  }

  if (type === "workflow-failed") {
    const runUrl =
      String(args["run-url"] || process.env.RUN_URL || "").trim() ||
      buildGitHubRunUrl();
    return runUrl ? `Weekly insight workflow needs attention. Check GitHub Actions: ${runUrl}` : "";
  }

  return "";
}

function buildGitHubRunUrl() {
  const server = process.env.GITHUB_SERVER_URL;
  const repository = process.env.GITHUB_REPOSITORY;
  const runId = process.env.GITHUB_RUN_ID;

  if (!server || !repository || !runId) {
    return "";
  }

  return `${server}/${repository}/actions/runs/${runId}`;
}

async function sendWhatsAppMessage({
  accessToken,
  phoneNumberId,
  toNumber,
  message,
}) {
  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
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
          preview_url: true,
          body: message,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WhatsApp Cloud API returned ${response.status}. ${redact(errorText)}`);
  }
}

function redact(value) {
  return String(value || "")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [redacted]")
    .replace(/access_token["']?\s*[:=]\s*["']?[A-Za-z0-9._-]+/gi, "access_token=[redacted]")
    .replace(/WHATSAPP_ACCESS_TOKEN=[^\s]+/g, "WHATSAPP_ACCESS_TOKEN=[redacted]");
}
