import { createCaseWarRoomStageRoute } from "../../../lib/caseWarRoomStageRoute";
import { reflectionPrompt } from "../../../lib/caseWarRoomSolutionPrompts";

export const runtime = "nodejs";

export const POST = createCaseWarRoomStageRoute({
  prompt: reflectionPrompt,
  emptyInputError: "Empty input. Provide case material before creating reflection questions.",
  failureError: "Reflection Questions failed. Please try again.",
  modelTier: "cheap",
});
