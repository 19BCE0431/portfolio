"use client";

import { useReducedMotion } from "framer-motion";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getLenis, setLenis } from "../lib/lenisInstance";

/**
 * Global smooth-scroll driver. Lenis runs in its default (non-transform) mode,
 * so it drives real window.scrollTo inside its own rAF loop — native scroll
 * position stays authoritative and every existing scroll listener,
 * IntersectionObserver, and Framer `useScroll` keeps working unchanged.
 *
 * Disabled entirely under prefers-reduced-motion.
 */
export function SmoothScroll() {
  const shouldReduceMotion = useReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    if (shouldReduceMotion) return;

    const lenis = new Lenis({
      duration: 1.05,
      // Refined ease-out — long tail, no overshoot. Reads as "weighted glass".
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      lerp: 0.09,
    });

    setLenis(lenis);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      setLenis(null);
      lenis.destroy();
    };
  }, [shouldReduceMotion]);

  // Reset to top instantly on route change so the pathname-keyed page
  // transition never animates in from a stale scroll offset, and re-measure
  // now that the new page's height is in the DOM.
  useEffect(() => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
      lenis.resize();
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [pathname]);

  return null;
}
