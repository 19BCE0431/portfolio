"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Download, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { profile } from "../../data/portfolio";
import { LineReveal, Magnetic, Tilt } from "../Kinetics";

const chips = [
  { label: "IIM Sirmaur", value: "MBA · 2025—27" },
  { label: "VIT Vellore", value: "B.Tech CSE · 9.15" },
  { label: "BigHaat", value: "Applied AI" },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Hero recedes as the next section arrives: it sinks, dims, and blurs rather
  // than simply scrolling away, so the transition reads as depth.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const blur = useTransform(scrollYProgress, [0, 1], ["blur(0px)", "blur(9px)"]);

  const depth = shouldReduceMotion ? undefined : { y, opacity, scale, filter: blur };

  return (
    <section id="intro" className="hero" ref={ref}>
      {/* Perspective grid floor — gives the dark field a horizon and a sense
          of physical space behind the type. */}
      <div className="hero-grid-floor" aria-hidden="true" />
      {/* Light that tracks the pointer, driven entirely by PointerField vars. */}
      <div className="hero-light" aria-hidden="true" />

      <motion.div className="shell hero-inner" style={depth}>
        <div className="hero-copy">
          <motion.div
            className="hero-status"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <Sparkles aria-hidden="true" />
            <span>MBA 2025—27 · Product systems · Applied AI</span>
          </motion.div>

          <LineReveal
            as="h1"
            className="hero-title"
            delay={0.25}
            lines={[
              <span key="a">Product thinking,</span>,
              <span key="b">
                engineering <span className="editorial lume">rigour.</span>
              </span>,
            ]}
          />

          <motion.p
            className="lead hero-lede"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            I build the connection between technical depth, market context, and
            product judgment — so a complicated system turns into a decision
            someone can actually make.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.68, ease: [0.16, 1, 0.3, 1] }}
          >
            <Magnetic strength={0.3}>
              <Link href="#work" className="btn btn-primary">
                Explore selected work <ArrowDown aria-hidden="true" />
              </Link>
            </Magnetic>
            <Magnetic strength={0.22}>
              <a
                href={profile.resume}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
              >
                Resume <Download aria-hidden="true" />
              </a>
            </Magnetic>
          </motion.div>
        </div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.94, filter: "blur(14px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.3, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <Tilt className="hero-portrait" max={6}>
            <div className="hero-portrait-frame">
              <Image
                src={profile.portrait}
                alt={profile.portraitAlt}
                fill
                priority
                sizes="(max-width: 900px) 84vw, 40vw"
              />
              <div className="hero-portrait-scrim" aria-hidden="true" />
              <div className="hero-portrait-scan" aria-hidden="true" />
              <div className="hero-portrait-caption">
                <strong>Mohit Sai Krishna</strong>
                <small>Product · Strategy · Applied AI</small>
              </div>
            </div>
          </Tilt>

          <ul className="hero-chips">
            {chips.map((chip, index) => (
              <motion.li
                key={chip.label}
                initial={{ opacity: 0, x: 22 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.9 + index * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <span>{chip.label}</span>
                <strong>{chip.value}</strong>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>

      <div className="hero-foot">
        <span className="scroll-cue">
          <i />
          Scroll to examine
        </span>
        <span className="hero-foot-meta">India · Available for 2027 roles</span>
      </div>
    </section>
  );
}
