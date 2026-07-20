import type Lenis from "lenis";

let activeLenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  activeLenis = instance;
}

export function getLenis() {
  return activeLenis;
}

type ScrollTargetOptions = {
  offset?: number;
  immediate?: boolean;
  duration?: number;
};

/**
 * Scroll to a target (element, selector, or absolute y) through Lenis when it
 * is active, so programmatic jumps stay in sync with the smooth-scroll rAF loop
 * instead of fighting it. Falls back to native scrolling when Lenis is absent
 * (reduced motion, SSR-hydration gap, or before mount).
 */
export function scrollToTarget(
  target: HTMLElement | string | number,
  options: ScrollTargetOptions = {},
) {
  const { offset = 0, immediate = false, duration } = options;

  if (activeLenis) {
    activeLenis.scrollTo(target, {
      offset,
      immediate,
      duration,
    });
    return;
  }

  if (typeof window === "undefined") return;

  let top = 0;
  if (typeof target === "number") {
    top = target + offset;
  } else {
    const element =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!element) return;
    top = element.getBoundingClientRect().top + window.scrollY + offset;
  }

  window.scrollTo({
    top: Math.max(0, top),
    behavior: immediate ? "auto" : "smooth",
  });
}
