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
          : { opacity: 0, y: 8 }
      }
      animate={
        shouldReduceMotion
          ? { opacity: 1 }
          : { opacity: 1, y: 0 }
      }
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
