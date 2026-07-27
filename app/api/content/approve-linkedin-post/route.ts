export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  url.pathname = "/api/content/approve-journal";

  return Response.redirect(url, 307);
}
