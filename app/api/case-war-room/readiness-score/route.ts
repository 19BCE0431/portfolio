import { createCaseWarRoomStageRoute } from "../../../lib/caseWarRoomStageRoute";
import { readinessScorePrompt } from "../../../lib/caseWarRoomSolutionPrompts";

export const runtime = "nodejs";

export const POST = createCaseWarRoomStageRoute({
  prompt: readinessScorePrompt,
  emptyInputError: "Empty input. Provide case material before scoring readiness.",
  failureError: "Case Readiness Score failed. Please try again.",
});
