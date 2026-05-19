"use client";

import { motion, type Variants, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const premiumEase = [0.16, 1, 0.3, 1] as const;

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 26,
    scale: 0.985,
    rotateX: 2.2,
    filter: "blur(3px)",
  },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.62,
      delay,
      ease: premiumEase,
    },
  }),
};

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      custom={delay}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.18, margin: "0px 0px -8% 0px" }}
      variants={fadeUp}
      style={{
        transformPerspective: 1000,
        transformOrigin: "50% 70%",
        willChange: "transform, opacity, filter",
      }}
    >
      {children}
    </motion.div>
  );
}
