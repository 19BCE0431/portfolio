import { compareTokenHash, hashToken, signToken, verifyToken } from "../security/signedTokens";
import { getAutomationConfigStatus, SITE_URL } from "./config";
import {
  sendApprovalEmail,
  sendJournalPublishedEmail,
  sendRejectionConfirmationEmail,
} from "./email";
import { generateAndPublishAutomationRun, getFinalLinkedInDraft } from "./generation";
import {
  getAutomationRun,
  listAutomationRuns,
  readContentFile,
  saveAutomationRun,
  writeContentFile,
} from "./store";
import {
  getCycleSchedule,
  getIstParts,
  inferCycleTypeForScheduledTime,
  type ContentCycleType,
} from "./schedule";
import type { LinkedInAutomationRun } from "./types";

type RunContentCycleOptions = {
  cycleType: ContentCycleType;
  dryRun?: boolean;
  trigger?: "cron" | "manual";
};

const PENDING_STATUSES = new Set(["pending_review", "pending_approval", "regenerated"]);

export async function runContentCycle(options: RunContentCycleOptions) {
  const config = getAutomationConfigStatus();
  const schedule = getCycleSchedule(options.cycleType);

  logAutomationEvent("schedule_check", {
    scheduleType: options.cycleType,
    trigger: options.trigger || "cron",
    utcTriggerTime: new Date().toISOString(),
    istInterpretedTime: getIstParts().display,
    cronExpression: schedule.cronExpression,
    dryRun: Boolean(options.dryRun),
  });

  const generation = config.canPublishJournalAutomatically
    ? await generateAndPublishAutomationRun({
        cycleType: options.cycleType,
        dryRun: options.dryRun,
      })
    : {
        status: "skipped" as const,
        reason: "Draft generation needs OPENAI_API_KEY plus GitHub content storage.",
      };

  const generatedRun = "run" in generation ? generation.run : undefined;

  logAutomationEvent("generated", {
    scheduleType: options.cycleType,
    status: generation.status,
    runId: generatedRun?.id,
    skippedReason: "reason" in generation ? generation.reason : undefined,
  });

  const approvalEmail =
    options.dryRun || generation.status !== "draft_saved" || !generatedRun
      ? {
          status: options.dryRun ? ("skipped" as const) : ("skipped" as const),
          reason: options.dryRun ? "Dry-run mode does not send email." : "No new saved draft to email.",
        }
      : await sendApprovalForRun(generatedRun);

  logAutomationEvent("email_sent", {
    scheduleType: options.cycleType,
    status: approvalEmail.status,
    runId: "runId" in approvalEmail ? approvalEmail.runId : undefined,
    skippedReason: "reason" in approvalEmail ? approvalEmail.reason : undefined,
  });

  return {
    ok: true,
    schedule: scheduleSummary(options.cycleType),
    config: {
      canSendEmail: config.canSendEmail,
      canUseApprovalTokens: config.canUseApprovalTokens,
      canPersistApprovalState: config.canPersistApprovalState,
      canPublishJournalAutomatically: config.canPublishJournalAutomatically,
      canPostToLinkedIn: false,
      missing: config.missing,
    },
    generation,
    approvalEmail,
  };
}

export async function runScheduledContentCycle() {
  const cycleType = inferCycleTypeForScheduledTime();

  if (!cycleType) {
    logAutomationEvent("schedule_skipped", {
      utcTriggerTime: new Date().toISOString(),
      istInterpretedTime: getIstParts().display,
      reason: "Current IST time is not Tuesday 10:30 AM or Thursday 3:30 PM.",
    });

    return {
      ok: true,
      ran: false,
      reason: "Skipped because this is not an approved Tuesday/Thursday content window.",
      utcTriggerTime: new Date().toISOString(),
      istInterpretedTime: getIstParts().display,
    };
  }

  return runContentCycle({ cycleType, trigger: "cron" });
}

export async function sendLatestPendingApprovalEmail(cycleType?: ContentCycleType) {
  const config = getAutomationConfigStatus();

  if (!config.canPersistApprovalState) {
    return {
      status: "skipped" as const,
      reason:
        "Persistent approval storage is missing; approval emails need GITHUB_CONTENT_TOKEN and GITHUB_CONTENT_REPO.",
    };
  }

  const runs = await listAutomationRuns();
  const run = runs
    .filter(
      (candidate) =>
        PENDING_STATUSES.has(candidate.status) &&
        !candidate.approvalEmailSentAt &&
        (!cycleType || candidate.cycleType === cycleType),
    )
    .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))[0];

  if (!run) {
    return {
      status: "skipped" as const,
      reason: "No pending review run found.",
    };
  }

  return sendApprovalForRun(run);
}

export async function sendApprovalForRun(run: LinkedInAutomationRun) {
  const secret = process.env.LINKEDIN_APPROVAL_SECRET;
  const exp = Math.floor(Math.min(Date.parse(run.expiresAt), Date.now() + 72 * 60 * 60 * 1000) / 1000);
  const approveToken = secret
    ? signToken({ runId: run.id, action: "approve", exp }, secret)
    : "";
  const rejectToken = secret
    ? signToken({ runId: run.id, action: "reject", exp }, secret)
    : "";
  const approveUrl = approveToken
    ? `${SITE_URL}/api/content/approve-journal?token=${encodeURIComponent(approveToken)}`
    : undefined;
  const rejectUrl = rejectToken
    ? `${SITE_URL}/api/content/reject-linkedin-post?token=${encodeURIComponent(rejectToken)}`
    : undefined;

  const updatedRun: LinkedInAutomationRun = {
    ...run,
    approvalEmailSentAt: new Date().toISOString(),
    approvalTokenHash: approveToken ? hashToken(approveToken) : undefined,
    rejectTokenHash: rejectToken ? hashToken(rejectToken) : undefined,
  };
  const saveResult = await saveAutomationRun(updatedRun, `Send journal approval email: ${run.id}`);
  const email = await sendApprovalEmail({
    run: updatedRun,
    approveUrl,
    rejectUrl,
  });

  return {
    status: email.status,
    id: email.id,
    saveResult,
    reason: email.reason,
    runId: run.id,
  };
}

export async function handleApprovalToken(token: string | null, expectedAction: "approve" | "reject") {
  const verification = verifyToken(token, process.env.LINKEDIN_APPROVAL_SECRET);

  if (!verification.ok) {
    return {
      ok: false,
      title: "Approval link is not valid",
      message: `This link could not be used because it is ${verification.reason.replace("_", " ")}.`,
    };
  }

  if (verification.payload.action !== expectedAction) {
    return {
      ok: false,
      title: "Approval link action mismatch",
      message: "This link is signed for a different action.",
    };
  }

  const run = await getAutomationRun(verification.payload.runId);

  if (!run) {
    return {
      ok: false,
      title: "Approval run not found",
      message: "The draft could not be found in the approval store.",
    };
  }

  if (Date.parse(run.expiresAt) < Date.now()) {
    return {
      ok: false,
      title: "Approval link expired",
      message: "This approval window has expired. Nothing was published.",
    };
  }

  const storedHash = expectedAction === "approve" ? run.approvalTokenHash : run.rejectTokenHash;

  if (!token || !compareTokenHash(token, storedHash)) {
    return {
      ok: false,
      title: "Approval storage is not active",
      message:
        "The signed link is valid, but the single-use token hash is not stored. Nothing was published.",
    };
  }

  if (!PENDING_STATUSES.has(run.status)) {
    return {
      ok: false,
      title: "This draft was already handled",
      message: `Current status: ${run.status}. No duplicate action was taken.`,
    };
  }

  if (expectedAction === "reject") {
    const rejectedRun: LinkedInAutomationRun = {
      ...run,
      status: "rejected",
      rejectedAt: new Date().toISOString(),
      approvalTokenHash: undefined,
      rejectTokenHash: undefined,
    };
    const saveResult = await saveAutomationRun(rejectedRun, `Reject journal draft: ${run.id}`);
    const email = saveResult.ok ? await sendRejectionConfirmationEmail(rejectedRun) : undefined;

    logAutomationEvent("rejected", {
      scheduleType: rejectedRun.cycleType,
      runId: rejectedRun.id,
      emailStatus: email?.status,
      journalPublishedStatus: false,
    });

    return {
      ok: saveResult.ok,
      title: saveResult.ok ? "Journal draft rejected" : "Could not store rejection",
      message: saveResult.ok
        ? "Nothing was published. The portfolio journal remains private and LinkedIn will not be posted."
        : saveResult.reason || "Approval state storage failed.",
    };
  }

  const approvedRun: LinkedInAutomationRun = {
    ...run,
    status: "journal_approved",
    approvedAt: new Date().toISOString(),
    journalApprovedAt: new Date().toISOString(),
    approvalTokenHash: undefined,
    rejectTokenHash: undefined,
  };
  const approvalSaveResult = await saveAutomationRun(approvedRun, `Approve journal draft: ${run.id}`);

  logAutomationEvent("journal_approved", {
    scheduleType: approvedRun.cycleType,
    runId: approvedRun.id,
    status: approvalSaveResult.ok ? "saved" : "failed",
  });

  if (!approvalSaveResult.ok) {
    return {
      ok: false,
      title: "Could not store approval",
      message: approvalSaveResult.reason || "Approval state storage failed.",
    };
  }

  return publishJournalOnly(approvedRun);
}

export async function publishJournalOnly(run: LinkedInAutomationRun) {
  const finalLinkedInDraft = getFinalLinkedInDraft(run);
  const journalResult = await publishJournalMarkdown(run);

  if (!journalResult.ok) {
    const failedRun: LinkedInAutomationRun = {
      ...run,
      status: "failed",
      failureReason: journalResult.reason,
    };
    await saveAutomationRun(failedRun, `Fail journal publish: ${run.id}`);

    logAutomationEvent("failed", {
      scheduleType: run.cycleType,
      runId: run.id,
      reason: journalResult.reason,
    });

    return {
      ok: false,
      title: "Journal publish failed",
      message: journalResult.reason || "The journal could not be published.",
    };
  }

  const linkedinDraftResult = await markLinkedInDraftManualReady(run, finalLinkedInDraft);
  const publishedRun: LinkedInAutomationRun = {
    ...run,
    status: "linkedin_manual_ready",
    journalPublishedAt: new Date().toISOString(),
    linkedinManualReadyAt: new Date().toISOString(),
    finalLinkedInDraft,
  };
  await saveAutomationRun(publishedRun, `Publish journal and prepare manual LinkedIn copy: ${run.id}`);
  const email = await sendJournalPublishedEmail(publishedRun, finalLinkedInDraft);

  logAutomationEvent("journal_published", {
    scheduleType: publishedRun.cycleType,
    runId: publishedRun.id,
    journalPublishedStatus: true,
    linkedinDraftStatus: linkedinDraftResult.ok ? "manual_ready" : "not_updated",
    emailStatus: email.status,
  });

  return {
    ok: true,
    title: "Journal published",
    message:
      "The portfolio journal is live. LinkedIn was not posted automatically; copy the final post manually from the confirmation email.",
    run: publishedRun,
    finalLinkedInDraft,
  };
}

function scheduleSummary(cycleType: ContentCycleType) {
  const schedule = getCycleSchedule(cycleType);

  return {
    cycleType,
    label: schedule.label,
    contentType: schedule.contentType,
    cronExpression: schedule.cronExpression,
    utcTime: `${String(schedule.utcHour).padStart(2, "0")}:${String(schedule.utcMinute).padStart(2, "0")} UTC`,
    istTime: `${schedule.dayName} ${String(schedule.istHour).padStart(2, "0")}:${String(schedule.istMinute).padStart(2, "0")} IST`,
  };
}

async function publishJournalMarkdown(run: LinkedInAutomationRun) {
  const journal = await readContentFile(run.journalPath);

  if (!journal) {
    return {
      ok: false,
      reason: `Journal draft not found: ${run.journalPath}`,
    };
  }

  const nextContent = updateFrontmatterScalar(
    updateFrontmatterScalar(
      updateFrontmatterScalar(journal.content, "status", "published"),
      "approvalStatus",
      "approved",
    ),
    "canonicalUrl",
    `${SITE_URL}/journal/${run.journalSlug}`,
  );

  return writeContentFile(
    run.journalPath,
    updateNestedLinkedInStatus(nextContent, "linkedin_manual_ready"),
    `Publish approved journal: ${run.journalSlug}`,
  );
}

async function markLinkedInDraftManualReady(run: LinkedInAutomationRun, finalLinkedInDraft: string) {
  const draft = await readContentFile(run.linkedinDraftPath);

  if (!draft) {
    return {
      ok: false,
      reason: `LinkedIn draft not found: ${run.linkedinDraftPath}`,
    };
  }

  const frontmatterUpdated = updateFrontmatterScalar(
    updateFrontmatterScalar(
      updateFrontmatterScalar(draft.content, "status", "linkedin_manual_ready"),
      "relatedBlogUrl",
      run.journalUrl,
    ),
    "approvedDate",
    localDate(new Date()),
  );
  const bodyUpdated = frontmatterUpdated.replace(/---\n([\s\S]*?)\n---\n?([\s\S]*)$/, (_, fm) => {
    return `---\n${fm}\n---\n\n${finalLinkedInDraft.trim()}\n`;
  });

  return writeContentFile(
    run.linkedinDraftPath,
    bodyUpdated,
    `Prepare manual LinkedIn copy: ${run.journalSlug}`,
  );
}

function updateFrontmatterScalar(markdown: string, key: string, value: string) {
  const escaped = value.replace(/"/g, '\\"');
  const formattedValue = /^[a-z0-9_-]+$/i.test(value) ? value : `"${escaped}"`;
  const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---\n?/);

  if (!frontmatterMatch) {
    return markdown;
  }

  const frontmatter = frontmatterMatch[1];
  const linePattern = new RegExp(`^${key}:\\s*.*$`, "m");
  const nextFrontmatter = linePattern.test(frontmatter)
    ? frontmatter.replace(linePattern, `${key}: ${formattedValue}`)
    : `${frontmatter}\n${key}: ${formattedValue}`;

  return markdown.replace(frontmatterMatch[0], `---\n${nextFrontmatter}\n---\n`);
}

function updateNestedLinkedInStatus(markdown: string, value: string) {
  return markdown.replace(
    /(linkedinShortPost:\n(?:\s+.*\n)*?\s+status:\s*).*/m,
    `$1${value}`,
  );
}

function logAutomationEvent(event: string, details: Record<string, unknown>) {
  console.info(
    JSON.stringify({
      scope: "linkedin_journal_automation",
      event,
      timestamp: new Date().toISOString(),
      ...details,
    }),
  );
}

function localDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
