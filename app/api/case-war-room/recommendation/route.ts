import { createCaseWarRoomStageRoute } from "../../../lib/caseWarRoomStageRoute";
import { recommendationPrompt } from "../../../lib/caseWarRoomSolutionPrompts";

export const runtime = "nodejs";

export const POST = createCaseWarRoomStageRoute({
  prompt: recommendationPrompt,
  emptyInputError: "Empty input. Provide case material before writing the recommendation.",
  failureError: "Final Recommendation failed. Please try again.",
});
