"use client";

import { motion, useReducedMotion } from "framer-motion";

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

  const renderStaticHeading = (headingLines: string[], headingClass: string) => {
    const Tag = as;

    return (
      <Tag className={headingClass}>
        {headingLines.map((line, index) => (
          <span key={`${line}-${index}`} className="block">
            {line}
          </span>
        ))}
      </Tag>
    );
  };

  const renderMotionHeading = (headingLines: string[], headingClass: string) => (
    <MotionHeading
      className={headingClass}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.78 }}
    >
      {headingLines.map((line, index) => (
        <span key={`${line}-${index}`} className="block overflow-hidden pb-[0.04em]">
          <motion.span
            className="block"
            style={{ willChange: "transform, opacity, filter" }}
            variants={{
              hidden: { y: "112%", opacity: 0, filter: "blur(5px)" },
              show: {
                y: "0%",
                opacity: 1,
                filter: "blur(0px)",
                transition: {
                  duration: 0.76,
                  delay: delay + index * 0.07,
                  ease: [0.16, 1, 0.3, 1],
                },
              },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </MotionHeading>
  );

  const renderHeading = shouldReduceMotion
    ? renderStaticHeading
    : renderMotionHeading;

  if (mobileLines) {
    return (
      <>
        {renderHeading(mobileLines, `${className} sm:hidden`)}
        {renderHeading(lines, `${className} hidden sm:block`)}
      </>
    );
  }

  return renderHeading(lines, className);
}
