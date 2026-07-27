"use client";

import { Check, Sparkles } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { AITool } from "../data/tools";
import { readToolInterest, recordToolInterest } from "../lib/toolAnalytics";

const premiumEase = [0.16, 1, 0.3, 1] as const;

export function ToolInterestButton({
  tool,
  source,
}: {
  tool: AITool;
  source: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [showToast, setShowToast] = useState(false);
  const [lastClickWasRepeat, setLastClickWasRepeat] = useState(false);
  const count = useSyncExternalStore(
    (notify) => {
      if (typeof window === "undefined") return () => {};

      const handleInterest = (event: Event) => {
        const detail = (event as CustomEvent<{ slug?: string }>).detail;

        if (!detail?.slug || detail.slug === tool.slug) notify();
      };
      const handleStorage = () => notify();

      window.addEventListener("portfolio-tool-interest", handleInterest);
      window.addEventListener("storage", handleStorage);

      return () => {
        window.removeEventListener("portfolio-tool-interest", handleInterest);
        window.removeEventListener("storage", handleStorage);
      };
    },
    () => readToolInterest(tool.slug),
    () => 0,
  );

  useEffect(() => {
    if (!showToast) return;

    const timeout = window.setTimeout(() => setShowToast(false), 3200);

    return () => window.clearTimeout(timeout);
  }, [showToast]);

  const handleClick = () => {
    const wasRepeat = readToolInterest(tool.slug) > 0;
    setLastClickWasRepeat(wasRepeat);
    recordToolInterest(tool, source);
    setShowToast(true);
  };

  const hasInterest = count > 0;

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={handleClick}
        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
        transition={{ duration: 0.26, ease: premiumEase }}
        className="premium-link inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[8px] border border-white/10 bg-[var(--surface)] px-4 py-3 text-[13px] font-semibold text-[#101214] shadow-[0_24px_72px_rgba(0,0,0,0.35)] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/20 sm:w-auto"
        aria-pressed={hasInterest}
      >
        {hasInterest ? (
          <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" />
        ) : (
          <Sparkles className="h-4 w-4 text-amber-700" aria-hidden="true" />
        )}
        {hasInterest ? "Interest noted" : "I want this tool"}
      </motion.button>
      {hasInterest && (
        <p className="mt-2 text-[12px] leading-[1.45] text-[var(--muted)]">
          Counted once from this browser. Repeat clicks are tracked as repeats,
          not fresh interest.
        </p>
      )}

      <AnimatePresence>
        {showToast && (
          <motion.div
            role="status"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.28, ease: premiumEase }}
            className="fixed bottom-5 left-1/2 z-[70] flex w-[min(calc(100%_-_28px),460px)] -translate-x-1/2 items-center gap-3 rounded-[8px] border border-white/12 bg-[rgba(9,11,13,0.96)] px-4 py-3 text-[0.9rem] text-[var(--muted-strong)] shadow-[0_28px_90px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[8px] bg-[var(--cyan)] text-[#0a1a1c]">
              <Check className="h-4 w-4" aria-hidden="true" />
            </span>
            {lastClickWasRepeat
              ? "Already noted from this browser. I still log repeat curiosity separately."
              : "Interest noted. This helps me decide what to build next."}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
