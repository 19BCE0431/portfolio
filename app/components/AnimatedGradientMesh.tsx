"use client";

import { motion, useReducedMotion } from "framer-motion";

export function AnimatedGradientMesh({ className = "" }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <motion.div
        className="absolute -left-[10%] -top-[20%] h-[60vh] w-[60vh] rounded-full opacity-70 blur-[90px]"
        style={{
          background:
            "radial-gradient(circle, rgba(129,140,248,0.28), transparent 70%)",
        }}
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: ["0%", "8%", "-4%", "0%"],
                y: ["0%", "6%", "10%", "0%"],
              }
        }
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[8%] top-[5%] h-[52vh] w-[52vh] rounded-full opacity-60 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.24), transparent 70%)",
        }}
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: ["0%", "-6%", "4%", "0%"],
                y: ["0%", "8%", "-6%", "0%"],
              }
        }
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-15%] left-[24%] h-[46vh] w-[46vh] rounded-full opacity-50 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, rgba(251,146,60,0.18), transparent 70%)",
        }}
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: ["0%", "6%", "-8%", "0%"],
                y: ["0%", "-6%", "4%", "0%"],
              }
        }
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
