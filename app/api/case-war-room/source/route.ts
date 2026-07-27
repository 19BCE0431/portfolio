import { NextResponse } from "next/server";
import {
  buildSourcePreview,
  CASE_LINK_ERROR,
  cleanCaseSourceText,
  createCaseWarRoomError,
  extractExactUrlText,
  extractPdfText,
  isSourceTooLarge,
  normalizeSourceText,
  PDF_EXTRACTION_ERROR,
  sourceTooLargeError,
  type CaseSourceMode,
} from "../../../lib/caseWarRoom";

export const runtime = "nodejs";

type JsonSourcePayload = {
  mode?: CaseSourceMode;
  text?: string;
  url?: string;
  titleHint?: string;
};

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("pdf");
      const titleHint = String(formData.get("titleHint") || "");

      if (!(file instanceof File)) {
        return errorResponse(
          createCaseWarRoomError(
            "pdf_extraction_failed",
            PDF_EXTRACTION_ERROR,
            "Choose a PDF file, or paste the case text instead.",
            false,
          ),
          400,
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const text = await extractPdfText(buffer);

      return sourceResponse("pdf", text, titleHint, file.name);
    }

    const payload = (await request.json()) as JsonSourcePayload;

    if (payload.mode === "text") {
      if (isSourceTooLarge(payload.text || "")) {
        const error = sourceTooLargeError();

        return errorResponse(error, 413);
      }

      const text = normalizeSourceText(payload.text || "");

      if (!text) {
        return errorResponse(
          createCaseWarRoomError(
            "empty_input",
            "Paste case text before starting the workspace.",
            "Add the case brief, exhibits, or instructions, then prepare the source again.",
            false,
          ),
          400,
        );
      }

      return sourceResponse("text", text, payload.titleHint);
    }

    if (payload.mode === "link") {
      const extracted = await extractExactUrlText(payload.url);

      return sourceResponse("link", extracted.text, payload.titleHint, String(payload.url || ""));
    }

    return errorResponse(
      createCaseWarRoomError(
        "empty_input",
        "Choose PDF, pasted text, or exact link source.",
        "Select a source type and add the case material before preparing the workspace.",
        false,
      ),
      400,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message === "SOURCE_TOO_LARGE") return errorResponse(sourceTooLargeError(), 413);
    if (message === PDF_EXTRACTION_ERROR) {
      return errorResponse(
        createCaseWarRoomError(
          "pdf_extraction_failed",
          PDF_EXTRACTION_ERROR,
          "Paste the readable case text below, or upload a cleaner text-based PDF.",
          false,
        ),
        422,
      );
    }
    if (message === CASE_LINK_ERROR) {
      return errorResponse(
        createCaseWarRoomError(
          "url_extraction_failed",
          CASE_LINK_ERROR,
          "Upload the PDF or paste the case text directly.",
          false,
        ),
        422,
      );
    }

    return errorResponse(
      createCaseWarRoomError(
        "network_failure",
        "Source preparation failed. Please try again.",
        "Retry preparation, or paste the case text manually.",
        true,
      ),
      500,
    );
  }
}

function sourceResponse(
  mode: CaseSourceMode,
  text: string,
  titleHint?: string,
  sourceName?: string,
) {
  const rawText = normalizeSourceText(text);
  const cleanup = cleanCaseSourceText(rawText, titleHint);
  const preview = buildSourcePreview(rawText, titleHint);

  return NextResponse.json({
    ok: true,
    source: {
      mode,
      sourceName: sourceName || "",
      rawText,
      cleanedText: cleanup.cleanedText,
      text: cleanup.cleanedText,
      preview,
    },
  });
}

function errorResponse(error: ReturnType<typeof createCaseWarRoomError>, status: number) {
  return NextResponse.json(
    { ok: false, error: error.message, errorDetails: error },
    { status },
  );
}
