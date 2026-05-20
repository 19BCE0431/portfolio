"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Fragment } from "react";

function wordsFor(lines: string[]) {
  return lines.join(" ").trim().split(/\s+/).filter(Boolean);
}

function breakPositionsFor(lines: string[]) {
  const positions = new Set<number>();
  let count = 0;

  lines.forEach((line, index) => {
    count += wordsFor([line]).length;
    if (index < lines.length - 1) positions.add(count);
  });

  return positions;
}

export function HeadingReveal({
  as = "h2",
  lines,
  mobileLines,
  className,
  delay = 0,
}: {
  as?: "h1" | "h2";
  lines: string[];
  mobileLines?: string[];
  className: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const MotionHeading = as === "h1" ? motion.h1 : motion.h2;
  const desktopText = wordsFor(lines).join(" ");
  const mobileText = wordsFor(mobileLines ?? lines).join(" ");
  const responsiveLines =
    mobileLines && mobileText === desktopText ? mobileLines : lines;
  const words = wordsFor(lines);
  const desktopBreaks = breakPositionsFor(lines);
  const mobileBreaks = breakPositionsFor(responsiveLines);

  const renderSeparator = (position: number) => {
    const desktopBreak = desktopBreaks.has(position);
    const mobileBreak = mobileBreaks.has(position);

    if (position >= words.length) return null;
    if (desktopBreak && mobileBreak) {
      return (
        <Fragment key={`break-${position}`}>
          {" "}
          <br />
        </Fragment>
      );
    }
    if (desktopBreak) {
      return (
        <span key={`break-${position}`}>
          <span className="sm:hidden"> </span>
          <span className="hidden sm:inline"> </span>
          <br className="hidden sm:block" />
        </span>
      );
    }
    if (mobileBreak) {
      return (
        <span key={`break-${position}`}>
          <span className="sm:hidden"> </span>
          <br className="sm:hidden" />
          <span className="hidden sm:inline"> </span>
        </span>
      );
    }

    return " ";
  };

  const renderStaticHeading = () => {
    const Tag = as;

    return (
      <Tag className={className}>
        {words.map((word, index) => (
          <Fragment key={`${word}-${index}`}>
            <span>{word}</span>
            {renderSeparator(index + 1)}
          </Fragment>
        ))}
      </Tag>
    );
  };

  const renderMotionHeading = () => (
    <MotionHeading
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.78 }}
    >
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span className="inline-block overflow-hidden align-bottom pb-[0.04em]">
            <motion.span
              className="inline-block"
              style={{ willChange: "transform, opacity, filter" }}
              variants={{
                hidden: { y: "112%", opacity: 0, filter: "blur(2px)" },
                show: {
                  y: "0%",
                  opacity: 1,
                  filter: "blur(0px)",
                  transition: {
                    duration: 0.58,
                    delay: delay + Math.min(index * 0.035, 0.24),
                    ease: [0.16, 1, 0.3, 1],
                  },
                },
              }}
            >
              {word}
            </motion.span>
          </span>
          {renderSeparator(index + 1)}
        </Fragment>
      ))}
    </MotionHeading>
  );

  return shouldReduceMotion ? renderStaticHeading() : renderMotionHeading();
}
