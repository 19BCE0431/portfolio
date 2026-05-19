import { timingSafeEqual } from "node:crypto";
import {
  buildDailyAnalyticsDigest,
  sendAnalyticsEmail,
  sendAnalyticsWhatsApp,
} from "@/app/lib/analytics/dailyDigest";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(authHeader: string | null, cronSecret: string | undefined) {
  if (!cronSecret || !authHeader?.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.slice("Bearer ".length);
  const tokenBuffer = Buffer.from(token);
  const secretBuffer = Buffer.from(cronSecret);

  return (
    tokenBuffer.length === secretBuffer.length &&
    timingSafeEqual(tokenBuffer, secretBuffer)
  );
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!isAuthorized(authHeader, cronSecret)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const digest = await buildDailyAnalyticsDigest();
    const [email, whatsapp] = await Promise.all([
      sendAnalyticsEmail(digest),
      sendAnalyticsWhatsApp(digest),
    ]);

    return Response.json({
      ok: true,
      configured: digest.configured,
      date: digest.dateLabel,
      subject: digest.subject,
      providers: digest.providers.map((provider) => ({
        name: provider.name,
        status: provider.status,
        headline: provider.headline,
      })),
      setupNotes: digest.setupNotes,
      email,
      whatsapp,
    });
  } catch {
    return Response.json(
      { ok: false, error: "Daily analytics digest failed." },
      { status: 500 },
    );
  }
}
