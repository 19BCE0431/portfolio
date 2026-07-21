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
  /** Velocity must track input almost immediately and settle hard. A soft
   *  spring lags the scroll and then overshoots on the deceleration tail,
   *  which reads as the effect firing *after* you stop — visibly broken. */
  velocity: { type: "spring", stiffness: 420, damping: 46, mass: 0.18 },
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

/**
 * Scroll-velocity response. Fast scrolling applies a small skew/scale to media
 * so the page reads as having physical momentum rather than teleporting.
 * Clamped hard — past ~6deg this stops feeling like weight and starts feeling
 * like a broken transform.
 */
export const motionVelocity = {
  /** px/frame that maps to the maximum response */
  saturation: 58,
  maxSkewDeg: 2.6,
  maxScale: 0.028,
  /** how quickly the value falls back to rest */
  decay: 0.86,
} as const;

/**
 * Layered parallax depths. Negative moves against the scroll (recedes),
 * positive moves with it (advances). Kept small: parallax should suggest
 * depth, not draw attention to itself.
 */
export const motionParallax = {
  far: -14,
  mid: -7,
  near: 6,
} as const;

/** Pointer-driven parallax — max px offset at the extremes of the viewport. */
export const motionPointer = {
  subtle: 6,
  standard: 12,
  pronounced: 20,
} as const;
