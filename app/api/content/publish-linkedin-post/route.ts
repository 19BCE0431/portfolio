import { isAuthorizedCronRequest } from "../../../lib/security/cronAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  void request;

  return Response.json(
    {
      ok: false,
      error:
        "LinkedIn auto-posting is disabled. Copy the approved LinkedIn draft manually and post it from LinkedIn.",
    },
    { status: 410 },
  );
}
