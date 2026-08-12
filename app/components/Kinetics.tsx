"use client";

/**
 * Kinetics — the shared motion vocabulary.
 *
 * Every primitive here degrades to a static, fully-legible state under
 * prefers-reduced-motion. Motion is decoration in this system: it never carries
 * information that is not also present in the markup.
 */

import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";

/**
 * Media query as reactive state. Uses useSyncExternalStore so the value is
 * correct on the first client render rather than arriving via an effect, and
 * so it stays correct when the viewport is resized.
 *
 * The server snapshot is `false`: markup renders in its wide-viewport form and
 * narrows on hydration.
 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/* ==========================================================================
   POINTER + VELOCITY FIELD
   One rAF loop for the whole page. Writes CSS custom properties on <html> so
   pure-CSS effects (hero light, spotlights, cursor) can react to the pointer
   without any of them mounting their own listener.
   ========================================================================== */

export function PointerField() {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const root = document.documentElement;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;
    let frame = 0;

    // Velocity is sampled from scroll events and decays inside the same loop,
    // so a single rAF drives both fields.
    let lastScroll = window.scrollY;
    let velocity = 0;

    const onPointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
    };

    const onScroll = () => {
      const next = window.scrollY;
      velocity = Math.max(-1, Math.min(1, (next - lastScroll) / 55));
      lastScroll = next;
    };

    const tick = () => {
      // Lerp toward the pointer so light trails slightly behind the cursor —
      // an instant follow reads as a hard-attached element, not as light.
      x += (targetX - x) * 0.1;
      y += (targetY - y) * 0.1;
      velocity *= 0.9;

      root.style.setProperty("--px", `${x.toFixed(1)}px`);
      root.style.setProperty("--py", `${y.toFixed(1)}px`);
      // Un-lerped pair for anything that must sit exactly under the cursor.
      root.style.setProperty("--pxi", `${targetX.toFixed(1)}px`);
      root.style.setProperty("--pyi", `${targetY.toFixed(1)}px`);
      root.style.setProperty("--pxr", (x / window.innerWidth).toFixed(4));
      root.style.setProperty("--pyr", (y / window.innerHeight).toFixed(4));
      root.style.setProperty("--vel", velocity.toFixed(4));

      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [shouldReduceMotion]);

  return null;
}

/* ==========================================================================
   REVEAL — the default entrance
   Rise + fade + a short blur pass. The blur is what makes it read as
   "resolving into place" rather than "sliding in".
   ========================================================================== */

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  blur?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li" | "span" | "header";
  style?: CSSProperties;
};

export function Reveal({
  children,
  delay = 0,
  y = 34,
  blur = 10,
  className,
  as = "div",
  style,
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const Tag = motion[as];

  if (shouldReduceMotion) {
    const Static = as;
    return (
      <Static className={className} style={style}>
        {children}
      </Static>
    );
  }

  return (
    <Tag
      className={className}
      style={style}
      initial={{ opacity: 0, y, filter: `blur(${blur}px)` }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
      transition={{ duration: 0.95, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  );
}

/* ==========================================================================
   LINE REVEAL — masked, per-line headline entrance
   Each line sits in its own overflow-hidden box and rises out of it, which is
   the effect that reads as "typeset" rather than "animated".
   ========================================================================== */

export function LineReveal({
  lines,
  className,
  delay = 0,
  stagger = 0.09,
  as: Tag = "h2",
}: {
  lines: ReactNode[];
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p";
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Tag className={className}>
      {lines.map((line, index) => (
        <span className="line-mask" key={index}>
          {shouldReduceMotion ? (
            <span className="line-inner">{line}</span>
          ) : (
            <motion.span
              className="line-inner"
              initial={{ y: "108%", opacity: 0 }}
              whileInView={{ y: "0%", opacity: 1 }}
              viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
              transition={{
                duration: 1.05,
                delay: delay + index * stagger,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {line}
            </motion.span>
          )}
        </span>
      ))}
    </Tag>
  );
}

/* ==========================================================================
   SCROLL COPY — word-by-word brightening tied to scroll position
   The statement is dim on approach and resolves to full contrast as it
   crosses the viewport. Scroll drives it directly, so scrubbing back dims it
   again — that reversibility is what makes it feel physical.
   ========================================================================== */

export function ScrollCopy({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.88", "end 0.55"],
  });

  const words = text.split(" ");

  if (shouldReduceMotion) {
    return (
      <p ref={ref} className={className}>
        {text}
      </p>
    );
  }

  return (
    <p ref={ref} className={className}>
      {words.map((word, index) => (
        <ScrollWord
          key={`${word}-${index}`}
          progress={scrollYProgress}
          range={[index / words.length, (index + 1.6) / words.length]}
        >
          {word}
        </ScrollWord>
      ))}
    </p>
  );
}

function ScrollWord({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span className="scroll-word" style={{ opacity }}>
      {children}{" "}
    </motion.span>
  );
}

/* ==========================================================================
   PARALLAX — depth through differential scroll speed
   ========================================================================== */

export function Parallax({
  children,
  distance = 70,
  className,
  style,
}: {
  children: ReactNode;
  distance?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const raw = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  // Spring the output so a fast flick does not snap the layer into place.
  const y = useSpring(raw, { stiffness: 120, damping: 28, mass: 0.5 });

  return (
    <div ref={ref} className={className} style={style}>
      <motion.div style={shouldReduceMotion ? undefined : { y }}>
        {children}
      </motion.div>
    </div>
  );
}

/* ==========================================================================
   MAGNETIC — element leans toward the cursor within a radius
   ========================================================================== */

export function Magnetic({
  children,
  strength = 0.32,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 240, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 240, damping: 18 });

  const handleMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const node = ref.current;
      if (!node || shouldReduceMotion) return;
      const rect = node.getBoundingClientRect();
      x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
      y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
    },
    [shouldReduceMotion, strength, x, y],
  );

  const reset = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      // `display` lives in CSS, not in the style prop: an inline display value
      // outranks every stylesheet rule, which silently defeated the
      // `display: none` that hides the nav CTA on small screens.
      className={`magnetic${className ? ` ${className}` : ""}`}
      style={{ x, y }}
      onPointerMove={handleMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.div>
  );
}

/* ==========================================================================
   TILT — 3D card rotation toward the cursor, plus a spotlight write
   ========================================================================== */

export function Tilt({
  children,
  className,
  max = 7,
  spotlight = true,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  spotlight?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 22 });
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 22 });

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node || shouldReduceMotion) return;
    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    if (spotlight) {
      node.style.setProperty("--mx", `${px * 100}%`);
      node.style.setProperty("--my", `${py * 100}%`);
    }
    ry.set((px - 0.5) * max * 2);
    rx.set((0.5 - py) * max * 2);
  };

  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={
        shouldReduceMotion
          ? undefined
          : { rotateX: rx, rotateY: ry, transformPerspective: 1100 }
      }
    >
      {children}
    </motion.div>
  );
}

/** Spotlight-only variant for grids where a tilt would be too much. */
export function Spotlight({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "a";
}) {
  const handleMove = (event: React.PointerEvent<HTMLElement>) => {
    const node = event.currentTarget;
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
    node.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
  };

  return (
    <Tag className={className} onPointerMove={handleMove}>
      {children}
    </Tag>
  );
}

/* ==========================================================================
   COUNT UP — numerals animate once, on entry
   ========================================================================== */

export function CountUp({
  to,
  suffix = "",
  prefix = "",
  decimals = 0,
  duration = 1800,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-18% 0px" });
  const shouldReduceMotion = useReducedMotion();
  const [value, setValue] = useState(shouldReduceMotion ? to : 0);

  useEffect(() => {
    if (!inView || shouldReduceMotion) return;
    let frame = 0;
    const start = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // Same ease as the reveal curve so counters and entrances feel related.
      const eased = 1 - Math.pow(1 - t, 4);
      setValue(to * eased);
      if (t < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, to, duration, shouldReduceMotion]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ==========================================================================
   MARQUEE — continuous ticker that reacts to scroll velocity
   Scrolling down speeds it up, scrolling up drags it back. This is the single
   clearest signal that the page is responding to the user rather than playing
   a fixed animation.
   ========================================================================== */

export function Marquee({
  items,
  speed = 42,
  reverse = false,
}: {
  items: string[];
  speed?: number;
  reverse?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    let last = performance.now();
    const direction = reverse ? 1 : -1;

    const tick = (now: number) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;

      const velocity = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--vel") || "0",
      );
      // Velocity adds to base speed and can briefly reverse the direction on a
      // hard upward flick.
      const rate = speed * (1 + velocity * 3.2);
      offset.current += direction * rate * dt;

      // The track renders the list twice; wrapping at half-width makes the
      // loop seamless regardless of content length.
      const half = track.scrollWidth / 2;
      if (half > 0) {
        if (offset.current <= -half) offset.current += half;
        if (offset.current >= 0) offset.current -= half;
      }

      track.style.transform = `translate3d(${offset.current}px,0,0) skewX(${velocity * -2.4}deg)`;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [shouldReduceMotion, speed, reverse]);

  const doubled = [...items, ...items];

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track" ref={trackRef}>
        {doubled.map((item, index) => (
          <span className="marquee-item" key={index}>
            {item}
            <i className="marquee-dot" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   SCROLL SCENE — scroll-linked progress for a pinned section
   Returns a 0→1 MotionValue covering the pinned range.
   ========================================================================== */

export function useSceneProgress(ref: React.RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  // Tight enough that the track settles almost as soon as the wheel stops,
  // loose enough to smooth Lenis's deceleration tail.
  return useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 34,
    restDelta: 0.0005,
  });
}
