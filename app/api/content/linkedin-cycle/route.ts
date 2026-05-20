import {
  runContentCycle,
  sendApprovalForRun,
  sendLatestPendingApprovalEmail,
} from "../../../lib/contentAutomation/cycle";
import { getAutomationRun } from "../../../lib/contentAutomation/store";
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
      runId?: string;
    };

    if (body.action === "send-approval" && body.runId) {
      const run = await getAutomationRun(body.runId);

      if (!run) {
        return Response.json({ ok: false, error: "Run not found." }, { status: 404 });
      }

      return Response.json(await sendApprovalForRun(run));
    }

    if (body.action === "send-latest-approval") {
      return Response.json(await sendLatestPendingApprovalEmail());
    }

    return Response.json(await runContentCycle());
  } catch {
    return Response.json(
      { ok: false, error: "LinkedIn content cycle failed." },
      { status: 500 },
    );
  }
}
