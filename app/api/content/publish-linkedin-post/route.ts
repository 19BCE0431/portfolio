import { getAutomationRun } from "../../../lib/contentAutomation/store";
import { publishRun } from "../../../lib/contentAutomation/cycle";
import { isAuthorizedCronRequest } from "../../../lib/security/cronAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { runId } = (await request.json()) as { runId?: string };

    if (!runId) {
      return Response.json({ ok: false, error: "runId is required." }, { status: 400 });
    }

    const run = await getAutomationRun(runId);

    if (!run) {
      return Response.json({ ok: false, error: "Run not found." }, { status: 404 });
    }

    if (run.status !== "approved") {
      return Response.json(
        { ok: false, error: `Run must be approved before posting. Current status: ${run.status}.` },
        { status: 409 },
      );
    }

    return Response.json(await publishRun(run));
  } catch {
    return Response.json(
      { ok: false, error: "LinkedIn publish failed." },
      { status: 500 },
    );
  }
}
