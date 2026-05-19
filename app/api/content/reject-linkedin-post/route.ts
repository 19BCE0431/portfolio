import { handleApprovalToken } from "../../../lib/contentAutomation/cycle";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const result = await handleApprovalToken(token, "reject");

  return new Response(renderResult(result.title, result.message), {
    status: result.ok ? 200 : 400,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function renderResult(title: string, message: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${escapeHtml(title)}</title></head><body style="font-family:Inter,Arial,sans-serif;background:#f6f4ee;color:#1f2421;padding:32px"><main style="max-width:680px;margin:0 auto;background:#fffefa;border:1px solid #dedbd2;border-radius:14px;padding:28px"><p style="letter-spacing:.18em;text-transform:uppercase;color:#68746a;font-size:12px">Portfolio automation</p><h1>${escapeHtml(title)}</h1><p style="font-size:18px;line-height:1.55">${escapeHtml(message)}</p><a href="/" style="display:inline-block;margin-top:16px;color:#1f2421">Back to portfolio</a></main></body></html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
