"use client";

import { track } from "@vercel/analytics";
import type { AITool } from "../data/tools";

export type ToolAnalyticsEvent =
  | "tools_lab_view"
  | "tool_card_click"
  | "tool_interest_click"
  | "tool_route_open";

type AnalyticsValue = string | number | boolean;

type ToolAnalyticsPayload = {
  tool?: Pick<AITool, "name" | "slug" | "status" | "category" | "route">;
  source?: string;
  action?: string;
  isRepeat?: boolean;
  localInterestCount?: number;
};

type AnalyticsWindow = Window & {
  gtag?: (command: "event", eventName: string, params?: Record<string, AnalyticsValue>) => void;
};

const interestKey = (slug: string) => `mohit-tool-interest:${slug}`;

type StoredInterest = {
  count?: number;
  firstAt?: string;
  lastAt?: string;
};

function readStoredInterest(slug: string): StoredInterest | null {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(interestKey(slug));

  if (!stored) return null;

  try {
    return JSON.parse(stored) as StoredInterest;
  } catch {
    const legacyCount = Number(stored);

    return Number.isFinite(legacyCount) ? { count: Math.min(legacyCount, 1) } : null;
  }
}

function cleanPayload(payload: ToolAnalyticsPayload) {
  const properties: Record<string, AnalyticsValue> = {};

  if (payload.tool) {
    properties.tool_name = payload.tool.name;
    properties.tool_slug = payload.tool.slug;
    properties.tool_status = payload.tool.status;
    properties.tool_category = payload.tool.category;
    properties.tool_route = payload.tool.route;
  }

  if (payload.source) properties.source = payload.source;
  if (payload.action) properties.action = payload.action;
  if (typeof payload.isRepeat === "boolean") properties.is_repeat = payload.isRepeat;
  if (typeof payload.localInterestCount === "number") {
    properties.local_interest_count = payload.localInterestCount;
  }

  return properties;
}

export function trackToolEvent(
  eventName: ToolAnalyticsEvent,
  payload: ToolAnalyticsPayload = {},
) {
  if (typeof window === "undefined") return;

  const properties = cleanPayload(payload);

  try {
    track(eventName, properties);
  } catch {
    // Analytics should never block navigation or interaction.
  }

  try {
    (window as AnalyticsWindow).gtag?.("event", eventName, properties);
  } catch {
    // Google Analytics may not be ready in preview or local development.
  }

  window.dispatchEvent(
    new CustomEvent("portfolio-tool-analytics", {
      detail: { eventName, properties },
    }),
  );
}

export function readToolInterest(slug: string) {
  if (typeof window === "undefined") return 0;

  const stored = readStoredInterest(slug);
  const count = Number(stored?.count);

  return Number.isFinite(count) ? count : 0;
}

export function recordToolInterest(tool: AITool, source: string) {
  if (typeof window === "undefined") return 0;

  const previous = readStoredInterest(tool.slug);
  const previousCount = Number(previous?.count) || 0;
  const isRepeat = previousCount > 0;
  const nextCount = isRepeat ? previousCount : 1;
  const now = new Date().toISOString();

  window.localStorage.setItem(
    interestKey(tool.slug),
    JSON.stringify({
      count: nextCount,
      firstAt: previous?.firstAt ?? now,
      lastAt: now,
    } satisfies StoredInterest),
  );
  trackToolEvent("tool_interest_click", {
    tool,
    source,
    action: isRepeat ? "repeat_interest_click" : "interest_registered",
    isRepeat,
    localInterestCount: nextCount,
  });
  window.dispatchEvent(
    new CustomEvent("portfolio-tool-interest", {
      detail: { slug: tool.slug, count: nextCount },
    }),
  );

  return nextCount;
}
