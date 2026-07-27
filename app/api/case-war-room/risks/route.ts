import { createCaseWarRoomStageRoute } from "../../../lib/caseWarRoomStageRoute";
import { riskPrompt } from "../../../lib/caseWarRoomSolutionPrompts";

export const runtime = "nodejs";

export const POST = createCaseWarRoomStageRoute({
  prompt: riskPrompt,
  emptyInputError: "Empty input. Provide case material before creating the risk matrix.",
  failureError: "Risk Matrix failed. Please try again.",
});
