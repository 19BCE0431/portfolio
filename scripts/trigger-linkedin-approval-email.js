#!/usr/bin/env node

const DEFAULT_BASE_URL = "https://mohitsaikrishna.in";

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const baseUrl = String(args.baseUrl || process.env.CONTENT_AUTOMATION_BASE_URL || DEFAULT_BASE_URL).trim();
  const cronSecret = String(args.cronSecret || process.env.CRON_SECRET || "").trim();
  const runId = args.runId ? String(args.runId).trim() : "";

  if (!cronSecret) {
    throw new Error(
      "Missing CRON_SECRET. Provide --cronSecret=... or set CRON_SECRET in your environment. (Do not paste secrets into chat.)",
    );
  }

  const url = `${stripTrailingSlash(baseUrl)}/api/content/linkedin-cycle`;
  const body = runId ? { action: "send-approval", runId } : { action: "send-latest-approval" };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cronSecret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Approval email trigger failed (${response.status}). Response: ${truncate(text, 500)}`);
  }

  console.log("Approval email trigger succeeded.");
  console.log(truncate(text, 1200));
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

function stripTrailingSlash(value) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function truncate(value, limit) {
  if (!value || value.length <= limit) return value;
  return `${value.slice(0, limit)}…`;
}

