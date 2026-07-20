"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { type MouseEvent, type ReactNode } from "react";
import { motionSpring } from "../lib/motionSystem";

export function MagneticButton({
  children,
  className = "",
  strength = 0.35,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, motionSpring.magnetic);
  const springY = useSpring(y, motionSpring.magnetic);

  const handlePointerMove = (event: MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;

    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * strength);
    y.set((event.clientY - rect.top - rect.height / 2) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={`inline-flex ${className}`}
      onMouseMove={handlePointerMove}
      onMouseLeave={reset}
      style={shouldReduceMotion ? undefined : { x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
}
