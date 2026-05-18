import {
  buildDailyAnalyticsDigest,
  sendAnalyticsEmail,
  sendAnalyticsWhatsApp,
} from "@/app/lib/analytics/dailyDigest";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

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
}
