"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { loaderTiming } from "../lib/motionSystem";

// Mounts once per hard page load (root layout persists across client nav), so
// the intro plays on first paint and never replays on in-app route changes.
export function Preloader() {
  const shouldReduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (
      shouldReduceMotion ||
      window.matchMedia("(max-width: 760px), (pointer: coarse)").matches
    ) {
      return;
    }

    document.body.style.overflow = "hidden";
    const timeout = window.setTimeout(
      () => setVisible(false),
      loaderTiming.hold + loaderTiming.exitDuration * 1000 + 100,
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

  if (!visible) return null;

  return (
    <div className="lux-preloader" aria-hidden="true">
      <div className="lux-preloader-grid" />
      <div className="lux-preloader-scene">
        <span className="lux-preloader-scene-line" />
        <span className="lux-preloader-scene-panel lux-preloader-scene-panel-a" />
        <span className="lux-preloader-scene-panel lux-preloader-scene-panel-b" />
        <span className="lux-preloader-scene-panel lux-preloader-scene-panel-c" />
      </div>
      <div className="lux-preloader-index">
        <span>MSK</span>
        <span>Digital portfolio · 2026</span>
      </div>

      <div className="lux-preloader-content">
        <span className="lux-preloader-kicker">
          Product strategy · Applied AI · Systems thinking
        </span>

        <div className="lux-preloader-mask">
          <p className="display-serif lux-preloader-name">Mohit Sai Krishna</p>
        </div>

        <div className="lux-preloader-progress">
          <i />
        </div>
      </div>
    </div>
  );
}
