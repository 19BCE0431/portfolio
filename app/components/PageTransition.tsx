"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function ScrollProgress() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.4,
  });

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <motion.div
      aria-hidden="true"
      className="fixed left-0 top-0 z-[70] h-[2px] w-full origin-left bg-[rgba(105,121,107,0.72)]"
      style={{ scaleX }}
    />
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      <ScrollProgress />
      <motion.div
        key={pathname}
        initial={
          shouldReduceMotion ? false : { opacity: 0, y: 12, filter: "blur(6px)" }
        }
        animate={
          shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }
        }
        transition={{ duration: 0.46, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </>
  );
}
