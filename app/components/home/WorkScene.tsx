"use client";

import { motion, useReducedMotion, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { archiveProjects } from "../../data/archive";
import { Reveal, useMediaQuery, useSceneProgress } from "../Kinetics";

const FEATURED = [
  "applied-image-search",
  "document-intelligence-system",
  "competitor-price-intelligence",
  "order-drop-detection",
  "content-automation-system",
];

const projects = FEATURED.map((slug) =>
  archiveProjects.find((project) => project.slug === slug),
).filter((project): project is (typeof archiveProjects)[number] => Boolean(project));

/**
 * The centrepiece: vertical scroll drives horizontal travel through the work.
 * The section is tall, its inner is sticky, and the track translates across.
 *
 * Falls back to an ordinary scroll-snapping rail — same content, no pinning —
 * under reduced motion, and on narrow screens, where pinning would demand
 * ~3700px of scrolling to cross five cards and where a swipeable rail is both
 * the familiar gesture and the cheaper one.
 */
export function WorkScene() {
  const ref = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isCompact = useMediaQuery("(max-width: 900px)");
  const progress = useSceneProgress(ref);
  const useStaticRail = shouldReduceMotion || isCompact;

  // Travel the full track width minus one viewport. The percentage is of the
  // track's own width, which is why the card count feeds the calculation.
  const distance = ((projects.length - 1) / projects.length) * 100;
  const x = useTransform(progress, [0, 1], ["0%", `-${distance}%`]);
  const counter = useTransform(progress, (value) =>
    String(Math.min(projects.length, Math.floor(value * projects.length) + 1)).padStart(2, "0"),
  );
  const barScale = useTransform(progress, [0, 1], [1 / projects.length, 1]);

  if (useStaticRail) {
    return (
      <section id="work" className="section work-static">
        <div className="shell">
          <WorkHead />
        </div>
        <div
          className="work-rail"
          role="region"
          aria-label="Selected projects. Swipe to browse."
        >
          {projects.map((project, index) => (
            <WorkCard key={project.slug} project={project} index={index} />
          ))}
        </div>
        <div className="shell">
          <p className="work-hint work-hint-static">Swipe to browse</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="work"
      className="work-scene"
      ref={ref}
      style={{ height: `${projects.length * 92}vh` }}
    >
      <div className="work-sticky">
        <div className="shell work-head-wrap">
          <WorkHead />
        </div>

        <div className="work-track-viewport">
          <motion.div
            className="work-track"
            style={{ x, width: `${projects.length * 100}%` }}
          >
            {projects.map((project, index) => (
              <WorkCard key={project.slug} project={project} index={index} />
            ))}
          </motion.div>
        </div>

        <div className="shell work-progress">
          <span className="work-counter">
            <motion.b>{counter}</motion.b>
            <i />
            {String(projects.length).padStart(2, "0")}
          </span>
          <span className="work-bar">
            <motion.i style={{ scaleX: barScale }} />
          </span>
          <span className="work-hint">Keep scrolling</span>
        </div>
      </div>
    </section>
  );
}

function WorkHead() {
  return (
    <div className="work-head">
      <div>
        <Reveal>
          <p className="eyebrow">02 — Selected work</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="h-display work-title">
            Work with a clear <span className="editorial lume">decision</span> at
            its centre.
          </h2>
        </Reveal>
      </div>
      <Reveal delay={0.16}>
        <Link href="/archive" className="btn btn-ghost work-archive-cta">
          Full archive <ArrowUpRight aria-hidden="true" />
        </Link>
      </Reveal>
    </div>
  );
}

function WorkCard({
  project,
  index,
}: {
  project: (typeof archiveProjects)[number];
  index: number;
}) {
  // One project ships a bespoke editorial still; everything else uses its
  // system diagram.
  const visual =
    project.slug === "applied-image-search"
      ? {
          image: "/images/projects/image-led-discovery-editorial-v2.png",
          alt: "Editorial still representing image-led product discovery",
        }
      : project.visual;

  // The archive's visuals are a mix: photographs, and SVG diagrams that ship
  // on both dark and cream grounds. Photographs fill the pane; diagrams are
  // inset on a common dark ground so a cream diagram reads as a framed
  // specimen instead of a blown-out panel.
  const isDiagram = visual?.image?.endsWith(".svg");

  return (
    <article className="work-card">
      <div className={`work-card-media${isDiagram ? " is-diagram" : ""}`}>
        {visual?.image ? (
          <Image
            src={visual.image}
            alt={visual.alt}
            fill
            sizes="(max-width: 900px) 88vw, 52vw"
            loading={index === 0 ? "eager" : "lazy"}
          />
        ) : (
          <span className="work-card-fallback">{project.filter}</span>
        )}
        <span className="work-card-index">{String(index + 1).padStart(2, "0")}</span>
        <div className="work-card-sheen" aria-hidden="true" />
      </div>

      <div className="work-card-body">
        <p className="eyebrow eyebrow-plain">{project.category}</p>
        <h3 className="h-title">{project.title}</h3>
        <p className="work-card-desc">{project.shortDescription}</p>

        <div className="work-card-impact">
          <span>Outcome</span>
          <strong>{project.impact}</strong>
        </div>

        <ul className="work-card-tools">
          {project.tools.slice(0, 5).map((tool) => (
            <li className="tag" key={tool}>
              {tool}
            </li>
          ))}
        </ul>

        <Link href={`/archive/${project.slug}`} className="link work-card-link">
          Read the case study <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
