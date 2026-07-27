import { handleApprovalToken } from "../../../lib/contentAutomation/cycle";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const result = await handleApprovalToken(token, "approve");

  return new Response(renderApprovalResult(result), {
    status: result.ok ? 200 : 400,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function renderApprovalResult(result: Awaited<ReturnType<typeof handleApprovalToken>>) {
  if ("finalLinkedInDraft" in result && result.finalLinkedInDraft && "run" in result) {
    return renderManualLinkedInPage({
      title: result.title,
      message: result.message,
      journalUrl: result.run.journalUrl,
      linkedinDraft: result.finalLinkedInDraft,
    });
  }

  return renderResult(result.title, result.message);
}

function renderManualLinkedInPage({
  title,
  message,
  journalUrl,
  linkedinDraft,
}: {
  title: string;
  message: string;
  journalUrl: string;
  linkedinDraft: string;
}) {
  const linkedInComposerUrl = "https://www.linkedin.com/feed/?shareActive=true";
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(journalUrl)}`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${escapeHtml(title)}</title>
  <style>
    :root{color-scheme:light}
    body{margin:0;font-family:Inter,Arial,sans-serif;background:#f6f4ee;color:#1f2421}
    main{max-width:920px;margin:0 auto;padding:28px 18px 40px}
    .panel{background:#fffefa;border:1px solid #dedbd2;border-radius:16px;padding:24px;box-shadow:0 24px 80px rgba(31,36,33,.08)}
    .label{letter-spacing:.18em;text-transform:uppercase;color:#68746a;font-size:12px;font-weight:700}
    h1{font-size:clamp(1.8rem,6vw,3rem);line-height:1.05;margin:10px 0 14px}
    p{font-size:16px;line-height:1.6;color:#5f655f}
    textarea{box-sizing:border-box;width:100%;min-height:520px;resize:vertical;border:1px solid #d9d4c9;border-radius:12px;background:#f8f6ef;padding:16px;font:15px/1.58 Inter,Arial,sans-serif;color:#202321}
    .actions{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0}
    button,a.button{border:1px solid #1f2421;border-radius:10px;padding:12px 15px;font-weight:700;text-decoration:none;cursor:pointer}
    button.primary,a.primary{background:#1f2421;color:white}
    a.button{display:inline-flex;align-items:center;color:#1f2421;background:#fffefa}
    .note{border:1px solid #eadfca;background:#fbf4df;border-radius:12px;padding:13px;margin:16px 0;color:#5d5139}
    .small{font-size:12px;color:#73786f}
  </style>
</head>
<body>
  <main>
    <section class="panel">
      <div class="label">Portfolio automation</div>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(message)}</p>
      <div class="note">LinkedIn was not posted automatically. Copy the final post below, then open LinkedIn and paste manually.</div>
      <p><strong>Live journal:</strong> <a href="${escapeAttribute(journalUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(journalUrl)}</a></p>
      <label class="label" for="linkedin-post">Final LinkedIn post</label>
      <textarea id="linkedin-post" spellcheck="true">${escapeHtml(linkedinDraft)}</textarea>
      <div class="actions">
        <button class="primary" type="button" id="copy-button">Copy LinkedIn Post</button>
        <a class="button primary" href="${linkedInComposerUrl}" target="_blank" rel="noopener noreferrer">Open LinkedIn</a>
        <a class="button" href="${shareUrl}" target="_blank" rel="noopener noreferrer">Open LinkedIn share link</a>
      </div>
      <p class="small">The text stays selectable in case browser clipboard access is blocked.</p>
      <p class="small" id="copy-status" role="status" aria-live="polite"></p>
    </section>
  </main>
  <script>
    const button = document.getElementById("copy-button");
    const textarea = document.getElementById("linkedin-post");
    const status = document.getElementById("copy-status");
    button?.addEventListener("click", async () => {
      textarea?.select();
      try {
        await navigator.clipboard.writeText(textarea.value);
        status.textContent = "Copied. Open LinkedIn and paste it into the composer.";
      } catch {
        document.execCommand("copy");
        status.textContent = "Copied. Open LinkedIn and paste it into the composer.";
      }
    });
  </script>
</body>
</html>`;
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

function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}
