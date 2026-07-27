"use client";

import { useEffect } from "react";
import type { AITool } from "../data/tools";
import { trackToolEvent } from "../lib/toolAnalytics";

export function ToolRouteTracker({ tool }: { tool: AITool }) {
  useEffect(() => {
    trackToolEvent("tool_route_open", {
      tool,
      source: "tool_detail_route",
      action: "route_opened",
    });
  }, [tool]);

  return null;
}
