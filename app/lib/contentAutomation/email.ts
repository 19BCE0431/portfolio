import { Resend } from "resend";
import {
  getContentAutomationEmailFrom,
  getContentAutomationEmailTo,
} from "./config";
import { getCycleSchedule, type ContentCycleType } from "./schedule";
import type { LinkedInAutomationRun } from "./types";

type ApprovalEmailInput = {
  run: LinkedInAutomationRun;
  approveUrl?: string;
  rejectUrl?: string;
};

const LINKEDIN_COMPOSER_URL = "https://www.linkedin.com/feed/?shareActive=true";

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
  const schedule = getScheduleForRun(run);

  const { data, error } = await resendClient.emails.send({
    from,
    to,
    subject: `${schedule.emailSubjectPrefix}: ${run.journalTitle}`,
    html: renderApprovalHtml({ run, approveUrl, rejectUrl }),
    text: renderApprovalText({ run, approveUrl, rejectUrl }),
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

export async function sendJournalPublishedEmail(run: LinkedInAutomationRun, finalLinkedInDraft: string) {
  return sendAutomationStatusEmail(
    `Journal published: ${run.journalTitle}`,
    [
      "Your portfolio journal is live.",
      "",
      `Live journal URL: ${run.journalUrl}`,
      "",
      "LinkedIn will not be posted automatically. Copy and post manually:",
      "",
      finalLinkedInDraft,
    ].join("\n"),
    renderConfirmationHtml(run, finalLinkedInDraft),
  );
}

export async function sendRejectionConfirmationEmail(run: LinkedInAutomationRun) {
  return sendAutomationStatusEmail(
    `Journal rejected: ${run.journalTitle}`,
    [
      "The draft was rejected.",
      "",
      "Nothing was published to the portfolio.",
      "Nothing was posted to LinkedIn.",
      "",
      `Run: ${run.id}`,
    ].join("\n"),
  );
}

export async function sendAutomationStatusEmail(subject: string, body: string, html?: string) {
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
    html:
      html ||
      `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#1b1d1c;max-width:680px;margin:auto;padding:24px"><pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(body)}</pre></div>`,
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

function renderApprovalHtml({ run, approveUrl, rejectUrl }: ApprovalEmailInput) {
  const schedule = getScheduleForRun(run);
  const buttonStyle =
    "display:inline-block;border-radius:8px;padding:12px 16px;text-decoration:none;font-weight:700;margin:6px 8px 6px 0";
  const sources = renderSourcesHtml(run);

  return `
  <div style="font-family:Inter,Arial,sans-serif;line-height:1.55;color:#202321;background:#f7f5ef;padding:24px">
    <div style="max-width:780px;margin:0 auto;background:#fffefa;border:1px solid #dedbd2;border-radius:14px;padding:26px">
      <p style="letter-spacing:.18em;text-transform:uppercase;color:#6e786f;font-size:12px;margin:0 0 12px">${escapeHtml(schedule.label)} Journal Approval</p>
      <h1 style="font-size:28px;line-height:1.15;margin:0 0 12px">${escapeHtml(run.journalTitle)}</h1>
      <div style="border:1px solid #eadfca;background:#fbf4df;border-radius:10px;padding:14px;margin:18px 0;color:#5d5139">
        LinkedIn will not be posted automatically. Manually copy the LinkedIn post after approval and paste it into LinkedIn.
      </div>
      <p><strong>Content type:</strong> ${escapeHtml(schedule.contentType)}</p>
      <p><strong>Suggested LinkedIn posting time:</strong> ${escapeHtml(formatDate(run.predictedPostAt))}</p>

      <h2 style="font-size:18px;margin-top:24px">Portfolio journal preview</h2>
      <p style="margin:0 0 12px;color:#5d625d">${escapeHtml(run.journalPreview || run.selectedWhy)}</p>
      <p style="margin:0 0 12px;color:#5d625d"><strong>Why this topic:</strong> ${escapeHtml(run.selectedWhy)}</p>
      <p><strong>Topic:</strong> ${escapeHtml(run.topic)}</p>
      <p><strong>Quality scores:</strong> ${run.scores.linkedinFinal.toFixed(1)}/10 LinkedIn fit · ${run.scores.journalQuality.toFixed(1)}/10 journal depth</p>
      <p><strong>Risk:</strong> ${escapeHtml(run.riskLevel)}</p>
      ${renderQualityScoresHtml(run)}

      <h2 style="font-size:18px;margin-top:24px">LinkedIn copy-ready draft</h2>
      <p style="margin:0 0 10px;color:#5f655f">Select the text below and copy it. Many email clients block JavaScript, so the text remains fully selectable.</p>
      <pre style="white-space:pre-wrap;background:#f5f3ed;border:1px solid #e4e0d7;border-radius:10px;padding:16px;font-family:Inter,Arial,sans-serif">${escapeHtml(run.linkedinDraft)}</pre>

      ${sources}

      <div style="margin:24px 0">
        ${
          approveUrl
            ? `<a href="${escapeAttribute(approveUrl)}" style="${buttonStyle};background:#1e2a24;color:white">Approve Journal</a>`
            : ""
        }
        ${
          rejectUrl
            ? `<a href="${escapeAttribute(rejectUrl)}" style="${buttonStyle};background:#ede7dc;color:#252825">Reject</a>`
            : ""
        }
        <a href="${LINKEDIN_COMPOSER_URL}" style="${buttonStyle};background:#0a66c2;color:white">Open LinkedIn</a>
      </div>
      <p style="font-size:12px;color:#73786f">Approve Journal publishes only the portfolio journal. Reject publishes nothing. LinkedIn stays manual copy-paste only.</p>
    </div>
  </div>`;
}

function renderApprovalText({ run, approveUrl, rejectUrl }: ApprovalEmailInput) {
  const schedule = getScheduleForRun(run);

  return [
    `${schedule.emailSubjectPrefix}: ${run.journalTitle}`,
    "",
    `Content type: ${schedule.contentType}`,
    `Suggested LinkedIn posting time: ${formatDate(run.predictedPostAt)}`,
    "",
    "Portfolio journal preview:",
    run.journalPreview || run.selectedWhy,
    "",
    `Why this topic: ${run.selectedWhy}`,
    "",
    `Quality scores: ${run.scores.linkedinFinal.toFixed(1)}/10 LinkedIn fit, ${run.scores.journalQuality.toFixed(1)}/10 journal depth`,
    run.qualityScores ? `20-metric average: ${run.scores.linkedinFinal.toFixed(1)}/10` : "",
    `Risk: ${run.riskLevel}`,
    "",
    "LinkedIn copy-ready draft:",
    run.linkedinDraft,
    "",
    run.sourceLinks.length ? "Sources:" : "",
    ...run.sourceLinks.map((source) => `- ${source.title}${source.publisher ? ` (${source.publisher})` : ""}: ${source.url}`),
    "",
    approveUrl ? `Approve Journal: ${approveUrl}` : "",
    rejectUrl ? `Reject: ${rejectUrl}` : "",
    `Open LinkedIn: ${LINKEDIN_COMPOSER_URL}`,
    "",
    "LinkedIn will not be posted automatically. You can manually copy and post it.",
  ]
    .filter(Boolean)
    .join("\n");
}

function renderConfirmationHtml(run: LinkedInAutomationRun, finalLinkedInDraft: string) {
  return `
  <div style="font-family:Inter,Arial,sans-serif;line-height:1.55;color:#202321;background:#f7f5ef;padding:24px">
    <div style="max-width:780px;margin:0 auto;background:#fffefa;border:1px solid #dedbd2;border-radius:14px;padding:26px">
      <p style="letter-spacing:.18em;text-transform:uppercase;color:#6e786f;font-size:12px;margin:0 0 12px">Journal Published</p>
      <h1 style="font-size:28px;line-height:1.15;margin:0 0 12px">${escapeHtml(run.journalTitle)}</h1>
      <p>The portfolio journal is live. LinkedIn was not posted automatically.</p>
      <p><strong>Live journal:</strong> <a href="${escapeAttribute(run.journalUrl)}">${escapeHtml(run.journalUrl)}</a></p>
      <h2 style="font-size:18px;margin-top:24px">Final LinkedIn copy</h2>
      <pre style="white-space:pre-wrap;background:#f5f3ed;border:1px solid #e4e0d7;border-radius:10px;padding:16px;font-family:Inter,Arial,sans-serif">${escapeHtml(finalLinkedInDraft)}</pre>
      <p style="margin-top:18px"><a href="${LINKEDIN_COMPOSER_URL}" style="display:inline-block;border-radius:8px;padding:12px 16px;text-decoration:none;font-weight:700;background:#0a66c2;color:white">Open LinkedIn</a></p>
      <p style="font-size:12px;color:#73786f">Copy the text above, open LinkedIn, and paste manually.</p>
    </div>
  </div>`;
}

function renderSourcesHtml(run: LinkedInAutomationRun) {
  if (!run.sourceLinks.length) {
    return `<h2 style="font-size:18px;margin-top:24px">Sources</h2><p>No external sources used.</p>`;
  }

  return `
    <h2 style="font-size:18px;margin-top:24px">Sources</h2>
    <ul>
      ${run.sourceLinks
        .map(
          (source) =>
            `<li><a href="${escapeAttribute(source.url)}">${escapeHtml(source.title)}</a>${source.publisher ? `, ${escapeHtml(source.publisher)}` : ""}${source.claimSupported ? `<br/><span style="color:#6a706a">${escapeHtml(source.claimSupported)}</span>` : ""}</li>`,
        )
        .join("")}
    </ul>`;
}

function renderQualityScoresHtml(run: LinkedInAutomationRun) {
  if (!run.qualityScores) {
    return "";
  }

  const labels: Array<[keyof NonNullable<LinkedInAutomationRun["qualityScores"]>, string]> = [
    ["eyebrowRaise", "Eyebrow raise"],
    ["novelty", "Novelty"],
    ["intellectualTension", "Intellectual tension"],
    ["reflection", "Reflection"],
    ["commentPotential", "Comment potential"],
    ["memorability", "Memorability"],
    ["mbaDepth", "MBA depth"],
    ["humanness", "Humanness"],
    ["escalation", "Escalation"],
    ["shareability", "Shareability"],
    ["insightDensity", "Insight density"],
    ["contrarianStrength", "Contrarian strength"],
    ["frameworkQuality", "Framework quality"],
    ["evidenceCredibility", "Evidence credibility"],
    ["boardroomRelevance", "Boardroom relevance"],
    ["discussionLongevity", "Discussion longevity"],
    ["quoteability", "Quoteability"],
    ["patternRecognition", "Pattern recognition"],
    ["perspectiveShift", "Perspective shift"],
    ["neverThoughtThatWay", "Never thought that way"],
  ];

  return `
    <h2 style="font-size:18px;margin-top:24px">Quality check</h2>
    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">
      ${labels
        .map(
          ([key, label]) =>
            `<div style="border:1px solid #ebe4d9;border-radius:8px;padding:8px;background:#fffaf0"><strong>${escapeHtml(label)}</strong><br/>${run.qualityScores?.[key].toFixed(1)}/10</div>`,
        )
        .join("")}
    </div>`;
}

function getScheduleForRun(run: LinkedInAutomationRun) {
  return getCycleSchedule((run.cycleType || "tuesday_market") as ContentCycleType);
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
