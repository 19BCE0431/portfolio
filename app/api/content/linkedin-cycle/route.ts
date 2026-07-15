import {
  runContentCycle,
  sendApprovalForRun,
  sendLatestPendingApprovalEmail,
} from "../../../lib/contentAutomation/cycle";
import { normalizeCycleType } from "../../../lib/contentAutomation/schedule";
import { getAutomationRun, saveAutomationRun } from "../../../lib/contentAutomation/store";
import { isAuthorizedCronRequest } from "../../../lib/security/cronAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      action?: string;
      cycleType?: string;
      runId?: string;
    };
    const cycleType = normalizeCycleType(body.cycleType) || "tuesday_market";

    if (body.action === "send-approval" && body.runId) {
      const run = await getAutomationRun(body.runId);

      if (!run) {
        return Response.json({ ok: false, error: "Run not found." }, { status: 404 });
      }

      return Response.json(await sendApprovalForRun(run));
    }

    if (body.action === "send-latest-approval") {
      return Response.json(await sendLatestPendingApprovalEmail(cycleType));
    }

    if (body.action === "regenerate" && body.runId) {
      const run = await getAutomationRun(body.runId);

      if (!run) {
        return Response.json({ ok: false, error: "Run not found." }, { status: 404 });
      }

      await saveAutomationRun(
        {
          ...run,
          status: "regenerated",
          approvalTokenHash: undefined,
          rejectTokenHash: undefined,
        },
        `Mark journal run regenerated: ${run.id}`,
      );

      return Response.json(
        await runContentCycle({
          cycleType: normalizeCycleType(run.cycleType) || cycleType,
          trigger: "manual",
        }),
      );
    }

    if (body.action === "dry-run") {
      return Response.json(
        await runContentCycle({
          cycleType,
          dryRun: true,
          trigger: "manual",
        }),
      );
    }

    return Response.json(
      await runContentCycle({
        cycleType,
        trigger: "manual",
      }),
    );
  } catch {
    return Response.json(
      { ok: false, error: "LinkedIn content cycle failed." },
      { status: 500 },
    );
  }
}
