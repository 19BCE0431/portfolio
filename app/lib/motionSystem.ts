import type { Transition } from "framer-motion";

export const motionEase = {
  enter: [0.16, 1, 0.3, 1],
  exit: [0.4, 0, 1, 1],
  glide: [0.22, 1, 0.36, 1],
  micro: [0.2, 0.8, 0.2, 1],
} as const;

export const motionDuration = {
  micro: 0.18,
  fast: 0.32,
  standard: 0.72,
  slow: 1.02,
  scene: 1.24,
} as const;

export const motionSpring = {
  soft: { type: "spring", stiffness: 110, damping: 24, mass: 0.72 },
  magnetic: { type: "spring", stiffness: 230, damping: 21, mass: 0.42 },
  cursor: { type: "spring", stiffness: 250, damping: 28, mass: 0.34 },
  tilt: { type: "spring", stiffness: 150, damping: 24, mass: 0.62 },
  progress: { type: "spring", stiffness: 120, damping: 28, mass: 0.3 },
} satisfies Record<string, Transition>;

export const motionViewport = {
  once: true,
  amount: 0.16,
  margin: "0px 0px -8% 0px",
} as const;

export const motionStagger = {
  tight: 0.045,
  standard: 0.08,
  relaxed: 0.12,
} as const;

export const loaderTiming = {
  heroStart: 0.58,
  hold: 820,
  exitDuration: 0.68,
} as const;
