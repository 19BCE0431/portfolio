import { NextResponse } from "next/server";
import {
  LEARNING_MODE_STRATEGY_BLOCK,
  buildLocalSolutionScaffold,
  createCaseWarRoomError,
  emptyInputError as createEmptyInputError,
  hasCaseWarRoomModelConfig,
  isSourceTooLarge,
  localCaseFallbackNotice,
  normalizeSourceText,
  runCaseWarRoomModel,
  shouldUseLocalCaseFallback,
  sourceTooLargeError,
  type CaseWarRoomConfig,
  type CaseWarRoomErrorPayload,
  type CaseWarRoomModelTier,
  type CaseWarRoomStageContext,
} from "./caseWarRoom";

type CaseWarRoomStagePayload = {
  sourceText?: string;
  config?: CaseWarRoomConfig;
  context?: CaseWarRoomStageContext;
};

export function createCaseWarRoomStageRoute({
  prompt,
  emptyInputError,
  failureError,
  modelTier = "expert",
}: {
  prompt: string;
  emptyInputError: string;
  failureError: string;
  modelTier?: CaseWarRoomModelTier;
}) {
  return async function POST(request: Request) {
    try {
      const payload = (await request.json()) as CaseWarRoomStagePayload;
      const config = payload.config || ({} as CaseWarRoomConfig);

      if (config.learningMode) {
        const error = createCaseWarRoomError(
          "learning_mode",
          LEARNING_MODE_STRATEGY_BLOCK,
          "Turn Learning Mode off, then click the Strategy Builder continue button again.",
          false,
        );

        return NextResponse.json(
          { ok: false, error: error.message, errorDetails: error },
          { status: 403 },
        );
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
        const error = createEmptyInputError(emptyInputError);

        return NextResponse.json(
          { ok: false, error: error.message, errorDetails: error },
          { status: 400 },
        );
      }

      if (!hasCaseWarRoomModelConfig()) {
        return NextResponse.json({
          ok: true,
          result: buildLocalSolutionScaffold(sourceText, config, payload.context || {}),
          model: "local case brief",
          usedFallback: true,
          notices: [
            "Using local case-only planning because expert generation is not configured yet.",
          ],
        });
      }

      const result = await runCaseWarRoomModel({
        prompt,
        sourceText,
        config,
        stageContext: payload.context || {},
        modelTier,
      });

      if (!result.ok) {
        const error = result.error as CaseWarRoomErrorPayload;

        if (shouldUseLocalCaseFallback(error)) {
          return NextResponse.json({
            ok: true,
            result: buildLocalSolutionScaffold(sourceText, config, payload.context || {}),
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
        failureError,
        "Retry this stage. If it keeps failing, use manual decode mode for this section.",
        true,
      );

      return NextResponse.json(
        { ok: false, error: error.message, errorDetails: error },
        { status: 500 },
      );
    }
  };
}
