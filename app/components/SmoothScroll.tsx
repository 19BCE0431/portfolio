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
    // Touch platforms already provide high-quality compositor-driven inertial
    // scrolling. Avoid a permanent JavaScript frame loop where Lenis would not
    // improve the interaction.
    if (
      shouldReduceMotion ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }

    const lenis = new Lenis({
      smoothWheel: true,
      wheelMultiplier: 0.94,
      touchMultiplier: 1.25,
      lerp: 0.082,
    });

    setLenis(lenis);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const handleVisibility = () => {
      if (document.hidden) lenis.stop();
      else lenis.start();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", handleVisibility);
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
      requestAnimationFrame(() => lenis.resize());
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [pathname]);

  return null;
}
