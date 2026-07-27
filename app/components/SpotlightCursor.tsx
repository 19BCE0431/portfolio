"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motionSpring } from "../lib/motionSystem";

const hoverQuery = "(hover: hover) and (pointer: fine)";

function subscribeToHoverCapability(callback: () => void) {
  const mql = window.matchMedia(hoverQuery);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getHoverCapability() {
  return window.matchMedia(hoverQuery).matches;
}

function getServerHoverCapability() {
  return false;
}

export function SpotlightCursor() {
  const shouldReduceMotion = useReducedMotion();
  const enabled = useSyncExternalStore(
    subscribeToHoverCapability,
    getHoverCapability,
    getServerHoverCapability,
  );
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const springX = useSpring(x, motionSpring.cursor);
  const springY = useSpring(y, motionSpring.cursor);
  const [interactive, setInteractive] = useState(false);
  const interactiveRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const handleMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);

      const target = event.target;
      const nextInteractive =
        target instanceof Element &&
        Boolean(target.closest("a, button, [data-cursor]"));

      if (nextInteractive !== interactiveRef.current) {
        interactiveRef.current = nextInteractive;
        setInteractive(nextInteractive);
      }
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleMove);
  }, [enabled, x, y]);

  if (!enabled || shouldReduceMotion) return null;

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="motion-cursor-ring"
        animate={{ scale: interactive ? 1.55 : 1, opacity: interactive ? 0.72 : 0.36 }}
        transition={motionSpring.cursor}
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      <motion.div
        aria-hidden="true"
        className="motion-cursor-dot"
        animate={{ scale: interactive ? 0.6 : 1 }}
        transition={motionSpring.cursor}
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
    </>
  );
}
