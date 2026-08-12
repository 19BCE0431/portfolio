"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { Reveal } from "../Kinetics";

const frames = [
  { src: "/images/gallery/life-mist-01.jpg", alt: "Mist over the hills" },
  { src: "/images/mba-life/iim-classroom-01.jpg", alt: "A case discussion in the classroom" },
  { src: "/images/gallery/life-sunset-01.jpg", alt: "Sunset from a viewpoint" },
  { src: "/images/mba-life/iim-campus-01.jpg", alt: "IIM Sirmaur campus" },
  { src: "/images/gallery/life-friends-snow-01.jpg", alt: "Friends in the snow" },
  { src: "/images/gallery/life-window-01.jpg", alt: "A window looking out onto the hills" },
];

/**
 * A drifting image band. The two rows travel in opposite directions as the
 * section passes, which reads as parallax depth without any pinning.
 */
export function LifeStrip() {
  const ref = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const left = useTransform(scrollYProgress, [0, 1], ["4%", "-16%"]);
  const right = useTransform(scrollYProgress, [0, 1], ["-16%", "4%"]);

  return (
    <section id="life" className="life-strip" ref={ref}>
      <div className="shell life-head">
        <Reveal>
          <p className="eyebrow">06 — Outside the resume</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="h-display">
            Hills, case rooms, and the{" "}
            <span className="editorial lume">slower rhythm</span> of learning
            something properly.
          </h2>
        </Reveal>
        <Reveal delay={0.16}>
          <Link href="/life" className="link">
            See the full gallery <ArrowUpRight aria-hidden="true" />
          </Link>
        </Reveal>
      </div>

      <div className="life-rows">
        <motion.div className="life-row" style={shouldReduceMotion ? undefined : { x: left }}>
          {frames.slice(0, 3).concat(frames.slice(0, 3)).map((frame, index) => (
            <figure key={`a-${index}`}>
              <Image
                src={frame.src}
                alt={index < 3 ? frame.alt : ""}
                aria-hidden={index >= 3}
                width={620}
                height={420}
                sizes="(max-width: 760px) 60vw, 28vw"
                loading="lazy"
              />
            </figure>
          ))}
        </motion.div>

        <motion.div className="life-row" style={shouldReduceMotion ? undefined : { x: right }}>
          {frames.slice(3).concat(frames.slice(3)).map((frame, index) => (
            <figure key={`b-${index}`}>
              <Image
                src={frame.src}
                alt={index < 3 ? frame.alt : ""}
                aria-hidden={index >= 3}
                width={620}
                height={420}
                sizes="(max-width: 760px) 60vw, 28vw"
                loading="lazy"
              />
            </figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
