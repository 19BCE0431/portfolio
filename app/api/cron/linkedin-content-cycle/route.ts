import { runScheduledContentCycle } from "../../../lib/contentAutomation/cycle";
import { isAuthorizedCronRequest } from "../../../lib/security/cronAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    return Response.json(await runScheduledContentCycle());
  } catch {
    return Response.json(
      { ok: false, error: "LinkedIn content cycle failed." },
      { status: 500 },
    );
  }
}
