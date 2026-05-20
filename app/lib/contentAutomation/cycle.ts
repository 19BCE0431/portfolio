import { compareTokenHash, hashToken, signToken, verifyToken } from "../security/signedTokens";
import { publishLinkedInText } from "../linkedin/post";
import { getAutomationConfigStatus, SITE_URL } from "./config";
import { sendApprovalEmail, sendAutomationStatusEmail } from "./email";
import { generateAndPublishAutomationRun } from "./generation";
import { getAutomationRun, listAutomationRuns, saveAutomationRun } from "./store";
import type { LinkedInAutomationRun } from "./types";

export async function runContentCycle() {
  const config = getAutomationConfigStatus();
  const publishDue = await publishDueApprovedRuns();
  const generation = config.canPublishJournalAutomatically
    ? await generateAndPublishAutomationRun()
    : {
        status: "skipped" as const,
        reason: "Automatic journal generation needs OPENAI_API_KEY plus GitHub content storage.",
      };
  const approvalEmail = await sendLatestPendingApprovalEmail();

  return {
    ok: true,
    config: {
      canSendEmail: config.canSendEmail,
      canUseApprovalTokens: config.canUseApprovalTokens,
      canPersistApprovalState: config.canPersistApprovalState,
      canPublishJournalAutomatically: config.canPublishJournalAutomatically,
      canPostToLinkedIn: config.canPostToLinkedIn,
      missing: config.missing,
    },
    publishDue,
    approvalEmail,
    generation,
  };
}

export async function sendLatestPendingApprovalEmail() {
  const config = getAutomationConfigStatus();

  if (!config.canPersistApprovalState) {
    return {
      status: "skipped" as const,
      reason:
        "Persistent approval storage is missing; cron will not send repeatable approval emails until GITHUB_CONTENT_TOKEN and GITHUB_CONTENT_REPO are configured.",
    };
  }

  const runs = await listAutomationRuns();
  const run = runs
    .filter((candidate) => candidate.status === "pending_approval" && !candidate.approvalEmailSentAt)
    .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))[0];

  if (!run) {
    return {
      status: "skipped" as const,
      reason: "No pending approval run found.",
    };
  }

  return sendApprovalForRun(run);
}

export async function sendApprovalForRun(run: LinkedInAutomationRun) {
  const secret = process.env.LINKEDIN_APPROVAL_SECRET;
  const exp = Math.floor(Math.min(Date.parse(run.expiresAt), Date.now() + 24 * 60 * 60 * 1000) / 1000);
  const approveToken = secret
    ? signToken({ runId: run.id, action: "approve", exp }, secret)
    : "";
  const rejectToken = secret
    ? signToken({ runId: run.id, action: "reject", exp }, secret)
    : "";
  const approvalUrl = approveToken
    ? `${SITE_URL}/api/content/approve-linkedin-post?token=${encodeURIComponent(approveToken)}`
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
  const saveResult = await saveAutomationRun(updatedRun, `Send approval email: ${run.id}`);
  const email = await sendApprovalEmail({
    run: updatedRun,
    approveUrl: approvalUrl,
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
  const config = getAutomationConfigStatus();

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
      message: "This approval window has expired. No LinkedIn post was created.",
    };
  }

  const storedHash = expectedAction === "approve" ? run.approvalTokenHash : run.rejectTokenHash;

  if (!token || !compareTokenHash(token, storedHash)) {
    return {
      ok: false,
      title: "Approval storage is not active yet",
      message:
        "The signed link is valid, but the single-use token hash is not stored. Configure GitHub content storage before enabling auto-post approval.",
    };
  }

  if (run.status !== "pending_approval") {
    return {
      ok: false,
      title: "This draft was already handled",
      message: `Current status: ${run.status}. No duplicate action was taken.`,
    };
  }

  if (expectedAction === "approve" && !config.canPostToLinkedIn) {
    const fallbackRun = {
      ...run,
      status: "blocked" as const,
      postingBlockedReason: "LinkedIn API is not connected; secure copy-page fallback was shown.",
      approvalTokenHash: undefined,
      rejectTokenHash: undefined,
    };
    const saveResult = await saveAutomationRun(
      fallbackRun,
      `Show LinkedIn fallback copy page: ${run.id}`,
    );

    return {
      ok: saveResult.ok,
      title: "LinkedIn draft ready to copy",
      message:
        "Official LinkedIn API posting is not connected yet, so nothing was posted automatically. Use the secure preview below to copy and post manually.",
      fallbackRun,
      fallbackReason: `Missing: ${config.missing
        .filter((item) => item.startsWith("LINKEDIN"))
        .join(", ") || "LinkedIn API credentials or posting permission"}.`,
      saveResult,
    };
  }

  if (expectedAction === "reject") {
    const rejectedRun = {
      ...run,
      status: "rejected" as const,
      rejectedAt: new Date().toISOString(),
      approvalTokenHash: undefined,
      rejectTokenHash: undefined,
    };
    const saveResult = await saveAutomationRun(rejectedRun, `Reject LinkedIn post: ${run.id}`);

    return {
      ok: saveResult.ok,
      title: saveResult.ok ? "LinkedIn draft rejected" : "Could not store rejection",
      message: saveResult.ok
        ? "The post will not be published."
        : saveResult.reason || "Approval state storage failed.",
    };
  }

  const approvedRun = {
    ...run,
    status: "approved" as const,
    approvedAt: new Date().toISOString(),
    approvalTokenHash: undefined,
    rejectTokenHash: undefined,
  };
  const saveResult = await saveAutomationRun(approvedRun, `Approve LinkedIn post: ${run.id}`);

  if (!saveResult.ok) {
    return {
      ok: false,
      title: "Could not store approval",
      message: saveResult.reason || "Approval state storage failed.",
    };
  }

  return publishRun(approvedRun);
}

export async function publishDueApprovedRuns() {
  const runs = await listAutomationRuns();
  const dueRuns = runs.filter(
    (run) => run.status === "approved" && Date.parse(run.predictedPostAt) <= Date.now(),
  );
  const results = [];

  for (const run of dueRuns) {
    results.push(await publishRun(run));
  }

  return results;
}

export async function publishRun(run: LinkedInAutomationRun) {
  const linkedIn = await publishLinkedInText(run.linkedinDraft);

  if (linkedIn.status !== "posted") {
    const blockedRun = {
      ...run,
      status: "blocked" as const,
      postingBlockedReason:
        linkedIn.status === "blocked" ? linkedIn.reason : linkedIn.reason,
    };
    await saveAutomationRun(blockedRun, `Block LinkedIn post: ${run.id}`);
    await sendAutomationStatusEmail(
      `LinkedIn auto-post blocked: ${run.topic}`,
      [
        "The journal is live and the LinkedIn copy is ready, but automatic posting is blocked.",
        "",
        linkedIn.status === "blocked"
          ? `Missing: ${linkedIn.missing.join(", ")}`
          : linkedIn.reason,
        "",
        run.linkedinDraft,
      ].join("\n"),
    );

    return {
      ok: false,
      title: "LinkedIn auto-posting is blocked",
      message:
        linkedIn.status === "blocked"
          ? `Missing: ${linkedIn.missing.join(", ")}`
          : linkedIn.reason,
    };
  }

  const postedRun = {
    ...run,
    status: "posted" as const,
    postedAt: new Date().toISOString(),
    linkedInPostId: linkedIn.postId,
    linkedInPostUrl: linkedIn.postUrl,
  };

  await saveAutomationRun(postedRun, `Mark LinkedIn posted: ${run.id}`);
  await sendAutomationStatusEmail(
    `LinkedIn post published: ${run.topic}`,
    `Posted successfully.\n\n${linkedIn.postUrl || linkedIn.postId}\n\nJournal: ${run.journalUrl}`,
  );

  return {
    ok: true,
    title: "LinkedIn post published",
    message: linkedIn.postUrl || "The LinkedIn API returned a post ID.",
  };
}
