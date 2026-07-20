"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  useRef,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  motionDuration,
  motionEase,
  motionSpring,
  motionViewport,
} from "../lib/motionSystem";

type RevealDirection = "up" | "left" | "right" | "none";

const directionOffset: Record<
  RevealDirection,
  { x: number; y: number; rotateX: number }
> = {
  up: { x: 0, y: 42, rotateX: 2.4 },
  left: { x: -54, y: 0, rotateX: 0 },
  right: { x: 54, y: 0, rotateX: 0 },
  none: { x: 0, y: 0, rotateX: 0 },
};

export function MotionReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  depth = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
  depth?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();
  const offset = directionOffset[direction];

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        x: offset.x,
        y: offset.y,
        rotateX: offset.rotateX,
        scale: depth ? 0.988 : 1,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        rotateX: 0,
        scale: 1,
      }}
      viewport={motionViewport}
      transition={{
        duration: motionDuration.slow,
        delay,
        ease: motionEase.enter,
      }}
      style={{
        transformPerspective: depth ? 1200 : undefined,
        transformOrigin: "50% 72%",
      }}
    >
      {children}
    </motion.div>
  );
}

export function MotionHeading({
  children,
  className,
  delay = 0,
}: {
  children: string;
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) return <h2 className={className}>{children}</h2>;

  return (
    <motion.h2
      className={className}
      initial={{ opacity: 0, y: 34, clipPath: "inset(0 0 100% 0)" }}
      whileInView={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
      viewport={{ once: true, amount: 0.48 }}
      transition={{
        duration: motionDuration.scene,
        delay,
        ease: motionEase.enter,
      }}
    >
      {children}
    </motion.h2>
  );
}

export function MotionMedia({
  children,
  className,
  delay = 0,
  parallax = 5,
  fill = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  parallax?: number;
  fill?: boolean;
}) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: mediaRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`-${parallax}%`, `${parallax}%`],
  );
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.055, 1, 1.055]);

  return (
    <motion.div
      ref={mediaRef}
      className={className}
      initial={
        shouldReduceMotion
          ? false
          : { opacity: 0, clipPath: "inset(0 0 100% 0)", scale: 0.985 }
      }
      whileInView={{ opacity: 1, clipPath: "inset(0 0 0% 0)", scale: 1 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{
        duration: motionDuration.scene,
        delay,
        ease: motionEase.enter,
      }}
      style={fill ? { position: "absolute", inset: 0 } : undefined}
    >
      <motion.div
        className="motion-media-inner"
        style={shouldReduceMotion ? undefined : { y, scale }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function TiltSurface({
  children,
  className,
  maxTilt = 3.2,
  lift = 7,
  cursorLabel,
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  lift?: number;
  cursorLabel?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const translateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, motionSpring.tilt);
  const springRotateY = useSpring(rotateY, motionSpring.tilt);
  const springTranslateY = useSpring(translateY, motionSpring.tilt);

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !window.matchMedia("(pointer: fine)").matches) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    rotateY.set(x * maxTilt * 2);
    rotateX.set(y * maxTilt * -2);
    translateY.set(-lift);
  };

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
    translateY.set(0);
  };

  return (
    <motion.div
      className={className}
      data-cursor={cursorLabel}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={
        shouldReduceMotion
          ? undefined
          : {
              rotateX: springRotateX,
              rotateY: springRotateY,
              y: springTranslateY,
              transformPerspective: 1200,
              transformStyle: "preserve-3d",
            }
      }
    >
      {children}
    </motion.div>
  );
}

export function SectionLight({
  className = "",
}: {
  className?: string;
}) {
  const lightRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: lightRef,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["-16%", "16%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.45, 1], [0.1, 0.62, 0.08]);

  return (
    <motion.div
      ref={lightRef}
      className={`motion-section-light ${className}`}
      style={shouldReduceMotion ? undefined : { x, opacity }}
      aria-hidden="true"
    />
  );
}
