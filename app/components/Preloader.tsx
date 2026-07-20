"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  loaderTiming,
  motionDuration,
  motionEase,
} from "../lib/motionSystem";

// Mounts once per hard page load (root layout persists across client nav), so
// the intro plays on first paint and never replays on in-app route changes.
export function Preloader() {
  const shouldReduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (shouldReduceMotion) return;

    document.body.style.overflow = "hidden";
    const timeout = window.setTimeout(
      () => setVisible(false),
      loaderTiming.hold,
    );

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
          className="lux-preloader"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{
            duration: loaderTiming.exitDuration,
            ease: motionEase.enter,
          }}
          aria-hidden="true"
        >
          <div className="lux-preloader-grid" />
          <div className="lux-preloader-index">
            <span>MSK</span>
            <span>Portfolio · 2026</span>
          </div>

          <div className="lux-preloader-content">
            <motion.span
              className="lux-preloader-kicker"
              initial={{ opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.08,
                duration: motionDuration.standard,
                ease: motionEase.enter,
              }}
            >
              Product · Strategy · Applied AI
            </motion.span>

            <div className="lux-preloader-mask">
              <motion.h1
                className="display-serif"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{
                  delay: 0.14,
                  duration: motionDuration.slow,
                  ease: motionEase.enter,
                }}
              >
                Mohit Sai Krishna
              </motion.h1>
            </div>

            <div className="lux-preloader-progress">
              <motion.i
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  delay: 0.08,
                  duration: loaderTiming.hold / 1000,
                  ease: motionEase.glide,
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
