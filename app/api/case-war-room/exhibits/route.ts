import { NextResponse } from "next/server";
import {
  buildLocalExhibitsResult,
  emptyInputError,
  hasCaseWarRoomModelConfig,
  isSourceTooLarge,
  localCaseFallbackNotice,
  normalizeSourceText,
  runCaseWarRoomModel,
  shouldUseLocalCaseFallback,
  sourceTooLargeError,
  createCaseWarRoomError,
  type CaseWarRoomConfig,
  type CaseWarRoomErrorPayload,
} from "../../../lib/caseWarRoom";

export const runtime = "nodejs";

const exhibitPrompt = `Create Stage 2: Exhibit and Numbers Decoder.

Purpose:
Decode exhibits, tables, charts, and numbers.

Rules:
- Do not invent numbers.
- Do not use external data.
- Preserve case numbers carefully.
- If a number is unclear, flag it.
- If calculation cannot be performed, say what data is needed.
- If no exhibits are found, say so clearly.

For each detected exhibit, return:
- exhibit name/number
- what it shows
- key numbers
- trend or pattern
- what it means in simple language
- why it matters for the decision
- possible insight
- caution or limitation
- possible calculations

Attempt calculations where relevant:
growth percentage, margin, CAGR, contribution margin, break-even, market share, CAC, LTV, unit economics, retention, conversion, revenue impact, cost impact, profit impact.

If no structured exhibits are found, set "summary" to:
"No structured exhibits were detected in the provided case."
Then suggest useful data the user should look for.

Return a JSON object with this exact shape:
{
  "summary": string,
  "exhibits": [
    {
      "exhibit_name_or_number": string,
      "what_it_shows": string,
      "key_numbers": string[],
      "trend_or_pattern": string,
      "simple_meaning": string,
      "why_it_matters_for_the_decision": string,
      "possible_insight": string,
      "caution_or_limitation": string,
      "possible_calculations": string[]
    }
  ],
  "calculations_attempted": [
    {
      "calculation": string,
      "result": string,
      "inputs_used": string[],
      "caution": string
    }
  ],
  "unclear_numbers": string[],
  "data_needed_for_better_analysis": string[]
}`;

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      sourceText?: string;
      config?: CaseWarRoomConfig;
    };

    if (isSourceTooLarge(payload.sourceText || "")) {
      const error = sourceTooLargeError();

      return NextResponse.json(
        { ok: false, error: error.message, errorDetails: error },
        { status: 413 },
      );
    }

    const sourceText = normalizeSourceText(payload.sourceText || "");

    if (!sourceText) {
      const error = emptyInputError("Empty input. Provide case material before decoding exhibits.");

      return NextResponse.json(
        { ok: false, error: error.message, errorDetails: error },
        { status: 400 },
      );
    }

    if (!hasCaseWarRoomModelConfig()) {
      return NextResponse.json({
        ok: true,
        result: buildLocalExhibitsResult(sourceText, payload.config || {}),
        model: "local case brief",
        usedFallback: true,
        notices: [
          "Using local case-only evidence extraction because expert generation is not configured yet.",
        ],
      });
    }

    const result = await runCaseWarRoomModel({
      prompt: exhibitPrompt,
      sourceText,
      config: payload.config || ({} as CaseWarRoomConfig),
    });

    if (!result.ok) {
      const error = result.error as CaseWarRoomErrorPayload;

      if (shouldUseLocalCaseFallback(error)) {
        return NextResponse.json({
          ok: true,
          result: buildLocalExhibitsResult(sourceText, payload.config || {}),
          model: "local case brief",
          usedFallback: true,
          notices: [...(result.notices || []), localCaseFallbackNotice(error)],
        });
      }

      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          errorDetails: error,
          notices: result.notices || [],
        },
        { status: result.status },
      );
    }

    return NextResponse.json({
      ok: true,
      result: result.data,
      model: result.model,
      usedFallback: result.usedFallback || false,
      notices: "notices" in result ? result.notices || [] : [],
    });
  } catch {
    const error = createCaseWarRoomError(
      "unknown",
      "Exhibit decoding failed. Please try again.",
      "Retry this stage. If it repeats, check the exhibit text manually.",
      true,
    );

    return NextResponse.json(
      { ok: false, error: error.message, errorDetails: error },
      { status: 500 },
    );
  }
}
