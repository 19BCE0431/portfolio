"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

// Mounts once per hard page load (root layout persists across client nav), so
// the intro plays on first paint and never replays on in-app route changes.
export function Preloader() {
  const shouldReduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (shouldReduceMotion) {
      setVisible(false);
      return;
    }

    document.body.style.overflow = "hidden";
    const timeout = window.setTimeout(() => setVisible(false), 1750);

    return () => {
      window.clearTimeout(timeout);
      document.body.style.overflow = "";
    };
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (!visible) document.body.style.overflow = "";
  }, [visible]);

  if (shouldReduceMotion) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#05070a]"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.95, ease }}
          aria-hidden="true"
        >
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="premium-grid absolute inset-0 opacity-[0.08] [mask-image:radial-gradient(circle_at_50%_45%,black,transparent_70%)]" />
            <div className="absolute left-1/2 top-1/2 h-[42vh] w-[42vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.16),transparent_70%)] blur-3xl" />
          </div>

          <div className="relative flex flex-col items-center gap-6 px-8 text-center">
            <motion.span
              className="text-[11px] font-medium uppercase tracking-[0.34em] text-white/40"
              style={{ fontFamily: "var(--font-mono)" }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6, ease }}
            >
              Portfolio
            </motion.span>

            <div className="overflow-hidden">
              <motion.h1
                className="display-serif text-[clamp(2.4rem,10vw,5rem)] font-light leading-[0.98] tracking-[-0.01em] text-white"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ delay: 0.28, duration: 0.85, ease }}
              >
                Mohit Sai Krishna
              </motion.h1>
            </div>

            <motion.span
              className="h-px w-0 bg-gradient-to-r from-transparent via-[var(--cyan)] to-transparent"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "min(240px, 60vw)", opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.9, ease }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
