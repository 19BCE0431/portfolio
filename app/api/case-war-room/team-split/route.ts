import { NextResponse } from "next/server";
import {
  buildLocalTeamSplitResult,
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

const teamSplitPrompt = `Create Stage 3: Team Work Split.

Only use the provided case material, configuration, team size, deadline, member names, and strengths.

Output:
- Suggested division of work based on team size
- Member-wise task table
- Multiple members can be assigned to a heavy topic if needed
- Team discussion agenda
- Suggested timeline based on deadline
- What the team should align on before moving to solution
- Common coordination mistakes to avoid

Possible work areas:
Case context and industry, exhibit and number analysis, customer/market analysis, competitor analysis, financial feasibility, operations/process analysis, strategic options, risks and mitigation, PPT storyline, final presentation and Q&A defense.

Return a JSON object with this exact shape:
{
  "suggested_division_of_work": string,
  "member_task_table": [
    {
      "member": string,
      "work_area": string,
      "what_to_analyze": string,
      "expected_output": string,
      "discussion_questions": string[],
      "suggested_time_allocation": string
    }
  ],
  "team_discussion_agenda": string[],
  "suggested_timeline_based_on_deadline": string[],
  "align_before_solution": string[],
  "common_coordination_mistakes_to_avoid": string[]
}`;

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      sourceText?: string;
      config?: CaseWarRoomConfig;
    };
    const config = payload.config || ({} as CaseWarRoomConfig);

    if (config.workMode !== "Team") {
      return NextResponse.json({
        ok: true,
        hidden: true,
        result: {
          summary: "Team split is hidden because this is an individual case.",
        },
      });
    }

    if (isSourceTooLarge(payload.sourceText || "")) {
      const error = sourceTooLargeError();

      return NextResponse.json(
        { ok: false, error: error.message, errorDetails: error },
        { status: 413 },
      );
    }

    const sourceText = normalizeSourceText(payload.sourceText || "");

    if (!sourceText) {
      const error = emptyInputError("Empty input. Provide case material before creating the team split.");

      return NextResponse.json(
        { ok: false, error: error.message, errorDetails: error },
        { status: 400 },
      );
    }

    if (config.teamSize < 2 || config.teamSize > 8) {
      const error = createCaseWarRoomError(
        "invalid_team_size",
        "Team size must be between 2 and 8.",
        "Adjust the team size, then regenerate the team split.",
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
        result: buildLocalTeamSplitResult(sourceText, config),
        model: "local case brief",
        usedFallback: true,
        notices: [
          "Using local case-only planning because expert generation is not configured yet.",
        ],
      });
    }

    const result = await runCaseWarRoomModel({
      prompt: teamSplitPrompt,
      sourceText,
      config,
      modelTier: "cheap",
    });

    if (!result.ok) {
      const error = result.error as CaseWarRoomErrorPayload;

      if (shouldUseLocalCaseFallback(error)) {
        return NextResponse.json({
          ok: true,
          result: buildLocalTeamSplitResult(sourceText, config),
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
      "Team work split failed. Please try again.",
      "Retry this stage, or assign workstreams manually from the decoded case.",
      true,
    );

    return NextResponse.json(
      { ok: false, error: error.message, errorDetails: error },
      { status: 500 },
    );
  }
}
