import { Resend } from "resend";
import { getAutomationConfigStatus, getContentAutomationEmailFrom, getContentAutomationEmailTo } from "./config";
import type { LinkedInAutomationRun } from "./types";

type ApprovalEmailInput = {
  run: LinkedInAutomationRun;
  approveUrl?: string;
  rejectUrl?: string;
};

let resendClient: Resend | null = null;

export async function sendApprovalEmail({ run, approveUrl, rejectUrl }: ApprovalEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = getContentAutomationEmailTo();
  const from = getContentAutomationEmailFrom();

  if (!apiKey || !to || !from) {
    return {
      status: "skipped" as const,
      reason: "Email configuration is missing.",
    };
  }

  resendClient ??= new Resend(apiKey);
  const config = getAutomationConfigStatus();
  const autoPostNote = config.canPostToLinkedIn
    ? "LinkedIn auto-posting is configured. Approval will schedule/post using the official LinkedIn API."
    : `Auto-posting is blocked until these are configured: ${config.missing
        .filter((item) => item.startsWith("LINKEDIN") || item.includes("GITHUB"))
        .join(", ") || "LinkedIn/GitHub settings"}.`;

  const { data, error } = await resendClient.emails.send({
    from,
    to,
    subject: `Approve LinkedIn post: ${run.topic}`,
    html: renderApprovalHtml({ run, approveUrl, rejectUrl, autoPostNote }),
    text: renderApprovalText({ run, approveUrl, rejectUrl, autoPostNote }),
  });

  if (error) {
    return {
      status: "failed" as const,
      reason: error.message || "Resend email failed.",
    };
  }

  return {
    status: "sent" as const,
    id: data?.id,
  };
}

export async function sendAutomationStatusEmail(subject: string, body: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = getContentAutomationEmailTo();
  const from = getContentAutomationEmailFrom();

  if (!apiKey || !to || !from) {
    return {
      status: "skipped" as const,
      reason: "Email configuration is missing.",
    };
  }

  resendClient ??= new Resend(apiKey);

  const { data, error } = await resendClient.emails.send({
    from,
    to,
    subject,
    html: `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#1b1d1c;max-width:680px;margin:auto;padding:24px"><pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(body)}</pre></div>`,
    text: body,
  });

  if (error) {
    return {
      status: "failed" as const,
      reason: error.message || "Resend email failed.",
    };
  }

  return {
    status: "sent" as const,
    id: data?.id,
  };
}

function renderApprovalHtml({
  run,
  approveUrl,
  rejectUrl,
  autoPostNote,
}: ApprovalEmailInput & { autoPostNote: string }) {
  const buttonStyle =
    "display:inline-block;border-radius:8px;padding:12px 16px;text-decoration:none;font-weight:700;margin-right:10px";

  return `
  <div style="font-family:Inter,Arial,sans-serif;line-height:1.55;color:#202321;background:#f7f5ef;padding:24px">
    <div style="max-width:760px;margin:0 auto;background:#fffefa;border:1px solid #dedbd2;border-radius:14px;padding:26px">
      <p style="letter-spacing:.18em;text-transform:uppercase;color:#6e786f;font-size:12px;margin:0 0 12px">LinkedIn + Journal Approval</p>
      <h1 style="font-size:28px;line-height:1.15;margin:0 0 12px">${escapeHtml(run.journalTitle)}</h1>
      <p style="margin:0 0 18px;color:#5d625d">${escapeHtml(run.selectedWhy)}</p>
      <div style="border:1px solid #e8e2d8;background:#fbf8ed;border-radius:10px;padding:14px;margin:18px 0">
        <strong>Automation status</strong>
        <p style="margin:8px 0 0">${escapeHtml(autoPostNote)}</p>
      </div>
      <p><strong>Topic:</strong> ${escapeHtml(run.topic)}</p>
      <p><strong>Risk:</strong> ${escapeHtml(run.riskLevel)} · <strong>Predicted posting time:</strong> ${escapeHtml(formatDate(run.predictedPostAt))}</p>
      <p><strong>Journal:</strong> <a href="${escapeAttribute(run.journalUrl)}">${escapeHtml(run.journalUrl)}</a></p>
      <h2 style="font-size:18px;margin-top:24px">LinkedIn draft</h2>
      <pre style="white-space:pre-wrap;background:#f5f3ed;border:1px solid #e4e0d7;border-radius:10px;padding:16px;font-family:Inter,Arial,sans-serif">${escapeHtml(run.linkedinDraft)}</pre>
      <div style="margin:24px 0">
        ${
          approveUrl
            ? `<a href="${escapeAttribute(approveUrl)}" style="${buttonStyle};background:#1e2a24;color:white">Approve post</a>`
            : ""
        }
        ${
          rejectUrl
            ? `<a href="${escapeAttribute(rejectUrl)}" style="${buttonStyle};background:#ede7dc;color:#252825">Reject</a>`
            : ""
        }
      </div>
      <p style="font-size:12px;color:#73786f">Approval links are signed, expiring, and server-side. LinkedIn tokens are never sent to the browser. Ignoring this email means nothing will be posted.</p>
    </div>
  </div>`;
}

function renderApprovalText({
  run,
  approveUrl,
  rejectUrl,
  autoPostNote,
}: ApprovalEmailInput & { autoPostNote: string }) {
  return [
    `Approve LinkedIn post: ${run.topic}`,
    "",
    run.selectedWhy,
    "",
    `Journal: ${run.journalUrl}`,
    `Predicted posting time: ${formatDate(run.predictedPostAt)}`,
    `Risk: ${run.riskLevel}`,
    "",
    autoPostNote,
    "",
    "LinkedIn draft:",
    run.linkedinDraft,
    "",
    approveUrl ? `Approve: ${approveUrl}` : "",
    rejectUrl ? `Reject: ${rejectUrl}` : "",
    "",
    "Ignoring this email means nothing will be posted.",
  ]
    .filter(Boolean)
    .join("\n");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}
