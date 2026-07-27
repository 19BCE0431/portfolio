import { createCaseWarRoomStageRoute } from "../../../lib/caseWarRoomStageRoute";
import { evaluationPrompt } from "../../../lib/caseWarRoomSolutionPrompts";

export const runtime = "nodejs";

export const POST = createCaseWarRoomStageRoute({
  prompt: evaluationPrompt,
  emptyInputError: "Empty input. Provide case material before creating the evaluation matrix.",
  failureError: "Evaluation Matrix failed. Please try again.",
});
