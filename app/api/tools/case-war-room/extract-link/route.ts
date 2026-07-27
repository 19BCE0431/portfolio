import { NextResponse } from "next/server";

const MAX_TEXT_LENGTH = 120_000;

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function validateExactUrl(value: unknown) {
  if (typeof value !== "string") return null;

  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) return null;

    return url;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let payload: { url?: unknown };

  try {
    payload = (await request.json()) as { url?: unknown };
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error:
          "I couldn't access this case link. Please upload the PDF or paste the case text.",
      },
      { status: 400 },
    );
  }

  const url = validateExactUrl(payload.url);

  if (!url) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "I couldn't access this case link. Please upload the PDF or paste the case text.",
      },
      { status: 400 },
    );
  }

  const controller = new AbortController();
  const timeout = windowlessSetTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: "text/html, text/plain, application/pdf;q=0.8, */*;q=0.5",
        "User-Agent": "MohitPortfolio-CaseWarRoom/1.0 exact-url-fetch",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "I couldn't access this case link. Please upload the PDF or paste the case text.",
        },
        { status: 422 },
      );
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/pdf")) {
      return NextResponse.json({
        ok: true,
        contentType,
        textLength: 0,
        note: "The exact link returned a PDF. Uploading the PDF is still the recommended path for Phase 1.",
      });
    }

    const raw = await response.text();
    const text = stripHtml(raw).slice(0, MAX_TEXT_LENGTH);

    if (text.length < 120) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "I couldn't access this case link. Please upload the PDF or paste the case text.",
        },
        { status: 422 },
      );
    }

    return NextResponse.json({
      ok: true,
      contentType,
      textLength: text.length,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error:
          "I couldn't access this case link. Please upload the PDF or paste the case text.",
      },
      { status: 422 },
    );
  } finally {
    clearTimeout(timeout);
  }
}

function windowlessSetTimeout(callback: () => void, delay: number) {
  return setTimeout(callback, delay);
}
