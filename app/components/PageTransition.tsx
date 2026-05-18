"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={
        shouldReduceMotion
          ? false
          : { opacity: 0, y: 16, scale: 0.992, filter: "blur(8px)" }
      }
      animate={
        shouldReduceMotion
          ? { opacity: 1 }
          : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
      }
      transition={{ duration: 0.54, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
