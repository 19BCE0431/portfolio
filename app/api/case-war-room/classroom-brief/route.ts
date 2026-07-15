import { NextResponse } from "next/server";
import {
  buildLocalClassroomBriefResult,
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

const MIN_CLASSROOM_SOURCE_LENGTH = 180;

const classroomBriefPrompt = `Create the first output for Case War Room: Classroom Case Brief.

Purpose:
Prepare an MBA student for IIM / Stanford / Harvard case-method classroom discussion.
This is not a full solution, recommendation, or strategy answer.

Style rules:
- Be crisp, elegant, memorable, and useful for speaking in class.
- Avoid long paragraphs.
- Avoid generic framework language.
- Use only provided case material and user instructions.
- Do not use web search or outside company knowledge.
- Do not hallucinate.
- If information is missing, write exactly: "Not available in the provided case."
- If a number is uncertain due to extraction, set needsVerification to true.
- caseSnapshot must be maximum 120-150 words.
- Include only stakeholders, facts, and numbers supported by the case.
- Include only the most discussion-relevant numbers.
- Do not include recommendations or strategy unless explicitly present as the class question.

Return a JSON object with this exact shape:
{
  "caseSnapshot": string,
  "mainDecision": string,
  "caseObjective": string,
  "stakeholders": [
    {
      "stakeholder": string,
      "whatTheyWant": string,
      "pressureOrProblem": string,
      "whyTheyMatter": string
    }
  ],
  "timeline": [
    {
      "period": string,
      "event": string,
      "whyItMatters": string
    }
  ],
  "keyFactsNumbers": [
    {
      "factOrNumber": string,
      "context": string,
      "whyItMatters": string,
      "discussionUse": string,
      "needsVerification": boolean
    }
  ],
  "keyTensions": string[],
  "professorPushAngles": string[],
  "preparationChecklist": string[],
  "smartQuestions": string[]
}

If no clear timeline exists, return an empty timeline array.
preparationChecklist should be five short checklist items.
smartQuestions should contain exactly three case-specific classroom questions.`;

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
      const error = emptyInputError("Empty input. Provide case material before creating the classroom brief.");

      return NextResponse.json(
        { ok: false, error: error.message, errorDetails: error },
        { status: 400 },
      );
    }

    if (cleanedSourceText.length < MIN_CLASSROOM_SOURCE_LENGTH && !payload.config?.quickDecode) {
      const error = createCaseWarRoomError(
        "too_short",
        "This is too brief to build a reliable classroom case brief.",
        "Add the case prompt, decision question, or a few key facts. The brief can work with concise material once the decision context is present.",
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
        result: buildLocalClassroomBriefResult(cleanedSourceText, payload.config || {}),
        model: "local classroom brief",
        usedFallback: true,
        notices: [
          "Using local case-only classroom briefing because expert generation is not configured yet.",
        ],
      });
    }

    const result = await runCaseWarRoomModel({
      prompt: classroomBriefPrompt,
      sourceText: cleanedSourceText,
      config: payload.config || ({} as CaseWarRoomConfig),
      modelTier: payload.config?.classroomMode === false || payload.config?.competitionMode ? "expert" : "cheap",
    });

    if (!result.ok) {
      const error = result.error as CaseWarRoomErrorPayload;

      if (shouldUseLocalCaseFallback(error)) {
        return NextResponse.json({
          ok: true,
          result: buildLocalClassroomBriefResult(cleanedSourceText, payload.config || {}),
          model: "local classroom brief",
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
      "Classroom brief failed. Please try again.",
      "Retry this stage. If it repeats, paste cleaner case text or use the source preview manually.",
      true,
    );

    return NextResponse.json(
      { ok: false, error: error.message, errorDetails: error },
      { status: 500 },
    );
  }
}
