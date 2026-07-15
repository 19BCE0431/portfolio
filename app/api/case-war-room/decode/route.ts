import { NextResponse } from "next/server";
import {
  buildLocalDecodeResult,
  cleanCaseSourceText,
  createCaseWarRoomError,
  emptyInputError,
  hasCaseWarRoomModelConfig,
  isSourceTooLarge,
  localCaseFallbackNotice,
  normalizeSourceText,
  runCaseWarRoomModel,
  shouldUseLocalCaseFallback,
  sourceTooLargeError,
  type CaseWarRoomConfig,
  type CaseWarRoomErrorPayload,
} from "../../../lib/caseWarRoom";

export const runtime = "nodejs";

const MIN_DECODE_SOURCE_LENGTH = 180;

const decodePrompt = `Create Stage 1: Case Decode.

Act as a senior MBA case coach, strategy consultant, and professor.
Use only the provided case material.
Do not add external facts.
Clearly label missing information.
Clearly label assumptions.
Make the output MBA-friendly, practical, and clear.

Return a JSON object with this exact shape:
{
  "what_case_is_about": string,
  "company_and_industry_context_from_case_only": string,
  "main_situation": string,
  "stated_problem": string,
  "underlying_real_problem": string,
  "decision_to_be_made": string,
  "case_objective": string,
  "what_success_looks_like": string,
  "key_stakeholders": string[],
  "key_constraints": string[],
  "important_facts": {
    "market_facts": string[],
    "customer_facts": string[],
    "financial_facts": string[],
    "operational_facts": string[],
    "competitive_facts": string[],
    "internal_company_facts": string[]
  },
  "missing_information": string[],
  "assumptions_required": string[],
  "case_complexity_score_out_of_100": number,
  "sub_scores": {
    "data_complexity": number,
    "strategy_complexity": number,
    "financial_complexity": number,
    "ambiguity_level": number,
    "presentation_difficulty": number
  },
  "why_this_case_is_difficult": string,
  "what_user_or_team_should_understand_before_solving": string[]
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
    const cleanedSourceText = cleanCaseSourceText(sourceText, payload.config?.caseTitle).cleanedText;

    if (!cleanedSourceText) {
      const error = emptyInputError("Empty input. Provide case material before decoding.");

      return NextResponse.json(
        { ok: false, error: error.message, errorDetails: error },
        { status: 400 },
      );
    }

    if (cleanedSourceText.length < MIN_DECODE_SOURCE_LENGTH && !payload.config?.quickDecode) {
      const error = createCaseWarRoomError(
        "too_short",
        "This is too brief for a reliable case decode.",
        "Add the case prompt, decision question, or a few key facts. Concise case material works once the decision context is present.",
        false,
      );

      return NextResponse.json(
        { ok: false, error: error.message, errorDetails: error },
        { status: 400 },
      );
    }

    if (!hasCaseWarRoomModelConfig()) {
      return NextResponse.json({
        ok: true,
        result: buildLocalDecodeResult(cleanedSourceText, payload.config || {}),
        model: "local case brief",
        usedFallback: true,
        notices: [
          "Using local case-only decoding because expert generation is not configured yet.",
        ],
      });
    }

    const result = await runCaseWarRoomModel({
      prompt: decodePrompt,
      sourceText: cleanedSourceText,
      config: payload.config || ({} as CaseWarRoomConfig),
    });

    if (!result.ok) {
      const error = result.error as CaseWarRoomErrorPayload;

      if (shouldUseLocalCaseFallback(error)) {
        return NextResponse.json({
          ok: true,
          result: buildLocalDecodeResult(cleanedSourceText, payload.config || {}),
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
      "Case decode failed. Please try again.",
      "Retry this stage. If it repeats, use manual decode mode.",
      true,
    );

    return NextResponse.json(
      { ok: false, error: error.message, errorDetails: error },
      { status: 500 },
    );
  }
}
