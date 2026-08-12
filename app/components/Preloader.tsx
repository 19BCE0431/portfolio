"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const PHASES = ["Interface", "Systems", "Judgment"];

/**
 * First-paint sequence. Mounts once per hard load (the root layout persists
 * across client navigation), so it never replays on in-app route changes.
 *
 * Skipped entirely under reduced motion — a forced 1.6s wait is a cost, not a
 * flourish, for anyone who has asked for less movement.
 */
export function Preloader() {
  const shouldReduceMotion = useReducedMotion();
  const [finished, setFinished] = useState(false);
  const [count, setCount] = useState(0);

  // Derived rather than stored: reduced-motion users skip the sequence without
  // needing an effect to switch it off after the first paint.
  const visible = !shouldReduceMotion && !finished;

  useEffect(() => {
    if (shouldReduceMotion) return;

    document.body.style.overflow = "hidden";
    const start = performance.now();
    const DURATION = 1500;
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      setCount(Math.round((1 - Math.pow(1 - t, 3)) * 100));
      if (t < 1) frame = requestAnimationFrame(tick);
      // Setting state from a rAF callback is asynchronous, so this does not
      // cascade a render the way a synchronous effect body would.
      else setFinished(true);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = "";
    };
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (!visible) document.body.style.overflow = "";
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="preloader"
          aria-hidden="true"
          // Curtain lifts rather than fading, so the hero appears to be
          // revealed from behind it instead of cross-dissolving.
          exit={{ y: "-100%" }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="preloader-aurora" />

          <div className="preloader-body">
            <motion.div
              className="preloader-mark"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              MSK
            </motion.div>

            <div className="preloader-phases">
              {PHASES.map((phase, index) => (
                <motion.span
                  key={phase}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.18 + index * 0.13,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {phase}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="preloader-foot">
            <span>Mohit Sai Krishna</span>
            <span className="preloader-count">{String(count).padStart(3, "0")}</span>
          </div>

          <div className="preloader-bar">
            <i style={{ transform: `scaleX(${count / 100})` }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
