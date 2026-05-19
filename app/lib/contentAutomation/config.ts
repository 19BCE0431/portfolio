import { getLinkedInPostingStatus } from "../linkedin/post";
import type { AutomationConfigStatus } from "./types";

export const SITE_URL =
  process.env.CONTENT_AUTOMATION_BASE_URL ||
  process.env.WEEKLY_INSIGHT_PORTFOLIO_BASE_URL ||
  "https://mohitsaikrishna.in";

export function getContentAutomationEmailTo() {
  return process.env.CONTENT_AUTOMATION_EMAIL_TO || process.env.ANALYTICS_EMAIL_TO || "";
}

export function getContentAutomationEmailFrom() {
  return (
    process.env.CONTENT_AUTOMATION_EMAIL_FROM ||
    process.env.ANALYTICS_EMAIL_FROM ||
    "Portfolio Automation <onboarding@resend.dev>"
  );
}

export function getGitHubRepoConfig() {
  const repo = process.env.GITHUB_CONTENT_REPO || process.env.GITHUB_REPO || "";
  const branch = process.env.GITHUB_CONTENT_BRANCH || process.env.GITHUB_BRANCH || "main";
  const token = process.env.GITHUB_CONTENT_TOKEN || "";

  return {
    configured: Boolean(repo && token),
    repo,
    branch,
    token,
  };
}

export function getAutomationConfigStatus(): AutomationConfigStatus {
  const missing: string[] = [];
  const linkedin = getLinkedInPostingStatus();
  const github = getGitHubRepoConfig();
  const emailTo = getContentAutomationEmailTo();
  const emailFrom = getContentAutomationEmailFrom();

  if (!process.env.RESEND_API_KEY) missing.push("RESEND_API_KEY");
  if (!emailFrom) missing.push("ANALYTICS_EMAIL_FROM or CONTENT_AUTOMATION_EMAIL_FROM");
  if (!emailTo) missing.push("ANALYTICS_EMAIL_TO or CONTENT_AUTOMATION_EMAIL_TO");
  if (!process.env.LINKEDIN_APPROVAL_SECRET) missing.push("LINKEDIN_APPROVAL_SECRET");
  if (!github.configured) missing.push("GITHUB_CONTENT_TOKEN and GITHUB_CONTENT_REPO");
  if (!process.env.OPENAI_API_KEY) missing.push("OPENAI_API_KEY");

  for (const item of linkedin.missing) {
    missing.push(item);
  }

  return {
    canSendEmail: Boolean(process.env.RESEND_API_KEY && emailFrom && emailTo),
    canUseApprovalTokens: Boolean(process.env.LINKEDIN_APPROVAL_SECRET),
    canPersistApprovalState: github.configured,
    canPublishJournalAutomatically: github.configured && Boolean(process.env.OPENAI_API_KEY),
    canPostToLinkedIn: linkedin.enabled,
    missing,
  };
}
