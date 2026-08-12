"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

const QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/**
 * Subscribes to the capability query rather than sampling it in an effect, so
 * the value is correct on the first client render (no cascading re-render) and
 * still updates if the user changes their motion preference mid-session.
 * The server snapshot is `false`: markup renders without a cursor and it is
 * added on hydration only where it applies.
 */
function useFinePointer() {
  const subscribe = useCallback((onChange: () => void) => {
    const media = window.matchMedia(QUERY);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}

/**
 * Custom cursor: a hard dot pinned to the pointer plus a soft light that
 * trails it. Position comes entirely from the CSS variables written by
 * PointerField, so this component only tracks *state* (hovering an
 * interactive element, pressing) rather than running its own rAF loop.
 *
 * Only mounts on fine-pointer devices, and never under reduced motion.
 */
export function Cursor() {
  const enabled = useFinePointer();
  const [hot, setHot] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add("has-custom-cursor");

    // Delegated: one listener covers links and buttons added later by route
    // changes, without any per-element wiring.
    const onOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      setHot(Boolean(target?.closest("a, button, [role='button'], input, textarea, select")));
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => setHot(false);

    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  const state = `${hot ? " is-hot" : ""}${pressed ? " is-pressed" : ""}`;

  return (
    <>
      <div className={`cursor-halo${state}`} aria-hidden="true" />
      <div className={`cursor-dot${state}`} aria-hidden="true" />
    </>
  );
}
