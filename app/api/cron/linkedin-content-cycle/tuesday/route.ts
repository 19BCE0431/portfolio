import { runContentCycle } from "../../../../lib/contentAutomation/cycle";
import { isAuthorizedCronRequest } from "../../../../lib/security/cronAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    return Response.json(await runContentCycle({ cycleType: "tuesday_market", trigger: "cron" }));
  } catch {
    return Response.json(
      { ok: false, error: "Tuesday LinkedIn/journal content cycle failed." },
      { status: 500 },
    );
  }
}
