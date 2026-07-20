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
        className="motion-page"
        initial={
          shouldReduceMotion
            ? false
            : { opacity: 0, y: 14, scale: 0.996, filter: "blur(4px)" }
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
          duration: motionDuration.standard,
          ease: motionEase.enter,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
