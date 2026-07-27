import { createCaseWarRoomStageRoute } from "../../../lib/caseWarRoomStageRoute";
import { strategyPrompt } from "../../../lib/caseWarRoomSolutionPrompts";

export const runtime = "nodejs";

export const POST = createCaseWarRoomStageRoute({
  prompt: strategyPrompt,
  emptyInputError: "Empty input. Provide case material before building strategy.",
  failureError: "Strategy Builder failed. Please try again.",
});
