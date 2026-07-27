"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import {
  motionDuration,
  motionEase,
} from "../lib/motionSystem";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        id="main-content"
        tabIndex={-1}
        className="motion-page"
        // Entrance mirrors the exit so a route change reads as one continuous
        // movement. AnimatePresence's `initial={false}` still suppresses this
        // on first paint, where the preloader already owns the entrance.
        initial={
          shouldReduceMotion
            ? { opacity: 1 }
            : { opacity: 0, y: 12, scale: 0.997, filter: "blur(4px)" }
        }
        animate={
          shouldReduceMotion
            ? { opacity: 1 }
            : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
        }
        exit={
          shouldReduceMotion
            ? { opacity: 1 }
            : { opacity: 0, y: -10, scale: 0.998, filter: "blur(3px)" }
        }
        transition={{
          duration: shouldReduceMotion
            ? motionDuration.micro
            : motionDuration.standard,
          ease: motionEase.enter,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
