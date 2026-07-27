"use client";

import {
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { useEffect } from "react";
import { motionSpring, motionVelocity } from "./motionSystem";

function clamp(value: number, min = -1, max = 1) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Normalised scroll velocity (-1 → 1) as a spring-smoothed MotionValue.
 *
 * Driven by passive scroll events rather than a persistent rAF loop: velocity
 * is only meaningful while scrolling, so burning a frame callback at rest
 * would cost battery for nothing. An idle timer eases the value back to 0 so
 * dependent transforms settle instead of freezing mid-skew.
 *
 * Returns a static 0 under prefers-reduced-motion.
 */
export function useScrollVelocity(): MotionValue<number> {
  const shouldReduceMotion = useReducedMotion();
  const raw = useMotionValue(0);
  const smooth = useSpring(raw, motionSpring.velocity);

  useEffect(() => {
    if (shouldReduceMotion) return;

    let lastY = window.scrollY;
    let lastTime = performance.now();
    let idleTimer = 0;

    const handleScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      const elapsed = Math.max(1, now - lastTime);

      // normalise to px-per-frame at 60fps so the value is refresh-rate stable
      const perFrame = ((y - lastY) / elapsed) * 16.67;

      lastY = y;
      lastTime = now;
      raw.set(clamp(perFrame / motionVelocity.saturation));

      window.clearTimeout(idleTimer);
      // Short idle window: Lenis emits a long deceleration tail, and anything
      // slower leaves the transform hanging after the user has stopped.
      idleTimer = window.setTimeout(() => raw.set(0), 60);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.clearTimeout(idleTimer);
    };
  }, [raw, shouldReduceMotion]);

  return shouldReduceMotion ? raw : smooth;
}
