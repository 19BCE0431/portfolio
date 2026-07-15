import { createCaseWarRoomStageRoute } from "../../../lib/caseWarRoomStageRoute";
import { pptPrompt } from "../../../lib/caseWarRoomSolutionPrompts";

export const runtime = "nodejs";

export const POST = createCaseWarRoomStageRoute({
  prompt: pptPrompt,
  emptyInputError: "Empty input. Provide case material before creating the PPT storyline.",
  failureError: "PPT Storyline failed. Please try again.",
  modelTier: "cheap",
});
