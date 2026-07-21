"use client";

import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Download,
  Mail,
} from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef, useSyncExternalStore } from "react";
import { getProjectBySlug, type ArchiveProject } from "../data/archive";
import type { JournalPost } from "../data/journal";
import { lifeGalleryImages } from "../data/media";
import { profile } from "../data/portfolio";
import { motionPointer, motionSpring } from "../lib/motionSystem";
import { MagneticButton } from "./MagneticButton";
import { useActiveSection } from "./ActiveSectionProvider";
import {
  MotionHeading,
  MotionMedia,
  MotionReveal,
  MouseParallax,
  SectionLight,
  TiltSurface,
} from "./MotionPrimitives";
import { WorkMotionScene } from "./WorkMotionScene";

const heroLines = ["Mohit Sai", "Krishna"];
const desktopMotionQuery = "(min-width: 761px) and (hover: hover) and (pointer: fine)";

function subscribeToDesktopMotion(callback: () => void) {
  const mediaQuery = window.matchMedia(desktopMotionQuery);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getDesktopMotionSupport() {
  return window.matchMedia(desktopMotionQuery).matches;
}

function getServerDesktopMotionSupport() {
  return false;
}

const projectSlugs = [
  "applied-image-search",
  "order-drop-detection",
  "document-intelligence-system",
] as const;

const selectedProjects = projectSlugs
  .map((slug) => getProjectBySlug(slug))
  .filter((project): project is ArchiveProject => Boolean(project));

const timeline = [
  {
    period: "2025 - 2027",
    title: "MBA Candidate",
    place: "Indian Institute of Management Sirmaur",
    note: "Product, marketing, strategy, consumer behaviour, and the business questions around technology.",
  },
  {
    period: "2024 - 2025",
    title: "Data Science Engineer",
    place: "BigHaat Agro",
    note: "Applied AI, search, pricing, operations, document intelligence, and automation in agri-commerce.",
  },
  {
    period: "2023 - 2024",
    title: "Data Science Intern",
    place: "BigHaat Agro",
    note: "Operational analytics, alerting, web intelligence, and decision-support systems.",
  },
  {
    period: "2019 - 2023",
    title: "B.Tech, Computer Science",
    place: "VIT Vellore",
    note: "Software, data science, collaborative systems, forecasting, and a 9.15/10 CGPA.",
  },
];

const lifeFrames = [
  lifeGalleryImages[0],
  lifeGalleryImages[1],
  lifeGalleryImages[2],
].filter(Boolean);

const sections = [
  { id: "intro", label: "Introduction" },
  { id: "profile", label: "Profile" },
  { id: "work", label: "Selected work" },
  { id: "capability", label: "Capability" },
  { id: "resume", label: "Resume" },
  { id: "proof", label: "Proof" },
  { id: "notes", label: "Field notes" },
  { id: "life", label: "Outside the work" },
  { id: "contact", label: "Connect" },
];

// Grouped from the real skills/workingModes lists — arranged as a narrative
// (why each cluster exists) rather than an undifferentiated tag cloud.
const capabilityGroups = [
  {
    label: "Business lens",
    note: "The questions asked before any code is written.",
    items: [
      "Product thinking",
      "Marketing curiosity",
      "Strategy cases",
      "Consumer behaviour",
      "Decision support",
      "Data storytelling",
    ],
  },
  {
    label: "Applied AI",
    note: "Where a model has to survive a real workflow.",
    items: ["LLMs", "RAG", "Chainlit", "Streamlit", "Dashboards"],
  },
  {
    label: "Engineering",
    note: "Building the system end to end, not just the demo.",
    items: ["Python", "Java", "C++", "JavaScript", "FastAPI", "Node", "Express", "React"],
  },
  {
    label: "Data",
    note: "Where the evidence actually lives.",
    items: ["PostgreSQL", "MySQL", "MongoDB", "Trino/PrestoSQL", "Selenium", "Scrapy"],
  },
];

// Every figure below is drawn from the verified credibility markers.
const proofPoints = [
  {
    figure: "Top 10%",
    label: "Academic Excellence",
    detail: "IIM Sirmaur · Batch 2025-26",
  },
  {
    figure: "9.15",
    suffix: "/10",
    label: "B.Tech CGPA",
    detail: "Computer Science · VIT Vellore",
  },
  {
    figure: "500",
    suffix: "+",
    label: "LeetCode problems",
    detail: "Sustained problem-solving practice",
  },
  {
    figure: "97.9",
    suffix: "%ile",
    label: "JEE Mains",
    detail: "National engineering entrance",
  },
  {
    figure: "1143",
    label: "TS EAMCET rank",
    detail: "Out of 2.42 lakh candidates",
  },
];

function formatDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function ScrollGuide() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, motionSpring.progress);
  const { activeSection: activeSectionId } = useActiveSection();
  const activeIndex = Math.max(
    0,
    sections.findIndex((section) => section.id === activeSectionId),
  );
  const activeSection = sections[activeIndex];

  return (
    <>
      <motion.div
        className="lux-scroll-progress"
        style={{ scaleX: progress }}
        aria-hidden="true"
      />
      <aside className="lux-scroll-marker" aria-label="Current page section">
        <span>{String(activeIndex + 1).padStart(2, "0")}</span>
        <div aria-hidden="true">
          <motion.i style={{ scaleY: progress }} />
        </div>
        <strong>{activeSection.label}</strong>
      </aside>
    </>
  );
}

function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const supportsParallax = useSyncExternalStore(
    subscribeToDesktopMotion,
    getDesktopMotionSupport,
    getServerDesktopMotionSupport,
  );
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "6%"]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.035]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.62]);

  return (
    <section id="intro" ref={heroRef} className="lux-hero">
      <motion.div
        className="lux-hero-media"
        style={
          shouldReduceMotion || !supportsParallax
            ? undefined
            : { y: mediaY, scale: mediaScale }
        }
      >
        {/* Pointer parallax sits inside scroll parallax so the scene has two
            independent depth cues: travel (scroll) and space (cursor). */}
        <MouseParallax depth={motionPointer.subtle} invert>
          <WorkMotionScene />
        </MouseParallax>
      </motion.div>
      <div className="lux-hero-shade" aria-hidden="true" />

      <motion.div
        className="lux-hero-copy lux-shell"
        style={
          shouldReduceMotion || !supportsParallax
            ? undefined
            : { y: copyY, opacity: copyOpacity }
        }
      >
        <p className="lux-hero-context lux-hero-enter-context">
          Digital portfolio · Product strategy · Applied AI
        </p>

        {/* Masked per-line reveal — the type rises out of its own baseline */}
        <h1>
          {heroLines.map((line, index) => (
            <span key={line} className="lux-hero-line">
              <span
                className="lux-hero-enter-line"
                style={{ animationDelay: `${0.68 + index * 0.1}s` }}
              >
                {line}
              </span>
            </span>
          ))}
        </h1>

        <p className="lux-hero-thesis lux-hero-enter-thesis">
          I connect technical depth with business judgment to make complex
          products, markets, and decisions easier to understand.
        </p>

        <div className="lux-hero-actions lux-hero-enter-actions">
          <MagneticButton>
            <Link href="#profile" className="lux-button lux-button-light">
              Explore the portfolio
              <ArrowDown aria-hidden="true" />
            </Link>
          </MagneticButton>
          <MagneticButton>
            <a
              href={profile.resume}
              target="_blank"
              rel="noreferrer"
              className="lux-button lux-button-quiet"
            >
              Resume
              <Download aria-hidden="true" />
            </a>
          </MagneticButton>
        </div>
      </motion.div>

      <div className="lux-hero-foot lux-shell">
        <span>MBA Candidate · IIM Sirmaur</span>
        <span className="lux-hero-scroll-cue">
          Scroll to explore
          <ArrowDown aria-hidden="true" />
        </span>
      </div>
    </section>
  );
}

function Profile() {
  const profileRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: profileRef,
    offset: ["start end", "end start"],
  });
  const portraitY = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"]);

  return (
    <section id="profile" ref={profileRef} className="lux-profile lux-section">
      <div className="lux-shell lux-profile-grid">
        <MotionReveal className="lux-profile-visual" direction="left">
          <div className="lux-profile-image">
            <motion.div
              className="lux-profile-image-inner"
              style={shouldReduceMotion ? undefined : { y: portraitY }}
            >
              <Image
                src="/images/profile/profile-campus-01.jpg"
                alt="Mohit Sai Krishna on the IIM Sirmaur campus"
                fill
                sizes="(max-width: 760px) 100vw, 42vw"
              />
            </motion.div>
            <div className="lux-profile-image-wash" aria-hidden="true" />
          </div>
          <div className="lux-profile-caption">
            <span>Current chapter</span>
            <strong>IIM Sirmaur · India</strong>
          </div>
        </MotionReveal>

        <MotionReveal className="lux-profile-copy" delay={0.08} direction="right">
          <p className="lux-eyebrow">Profile</p>
          <MotionHeading>Technology taught me how to build. Business is teaching me what deserves to be built.</MotionHeading>
          <p className="lux-profile-lede">
            I began in Computer Science and Data Science at VIT Vellore, then
            worked on live AI and automation systems at BigHaat. Now, during my
            MBA, I am widening that technical lens with product, marketing,
            strategy, and consumer behaviour.
          </p>
          <p>
            I am most interested in the point where a complicated system becomes
            a clear choice for a customer, a team, or a business. That is the
            thread connecting the work across this portfolio.
          </p>
          <div className="lux-profile-links">
            <Link href="#work">
              Selected work
              <ArrowRight aria-hidden="true" />
            </Link>
            <a href={`mailto:${profile.email}`}>
              Email me
              <Mail aria-hidden="true" />
            </a>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}

function Work() {
  return (
    <section id="work" className="lux-work lux-section">
      <SectionLight className="motion-section-light-dark" />
      <div className="lux-shell">
        <div className="lux-section-head">
          <MotionReveal direction="left">
            <p className="lux-eyebrow lux-eyebrow-light">Selected work</p>
            <MotionHeading>Systems built around real decisions.</MotionHeading>
          </MotionReveal>
          <MotionReveal delay={0.08} direction="right">
            <p>
              Three examples from applied AI and operations. The full archive
              holds the broader technical record.
            </p>
            <Link href="/archive">
              View full archive
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </MotionReveal>
        </div>

        <div className="lux-project-list">
          {selectedProjects.map((project, index) => (
            <MotionReveal
              key={project.slug}
              className="lux-project"
              delay={index * 0.045}
              direction={index % 2 === 0 ? "left" : "right"}
            >
              <div className="lux-project-copy">
                <div className="lux-project-meta">
                  <span>0{index + 1}</span>
                  <span>{project.category}</span>
                </div>
                <h3 id={`project-${project.slug}-title`}>{project.title}</h3>
                <p>{project.shortDescription}</p>

                {/* The outcome is the most important thing about a project and
                    was previously not surfaced anywhere in the showcase. */}
                {project.impact && (
                  <div className="lux-project-outcome">
                    <span>Outcome</span>
                    <p className="display-serif">{project.impact}</p>
                  </div>
                )}

                <dl>
                  <div>
                    <dt>Context</dt>
                    <dd>{project.context}</dd>
                  </div>
                  <div>
                    <dt>My role</dt>
                    <dd>{project.contribution}</dd>
                  </div>
                </dl>
                <Link href={`/archive/${project.slug}`}>
                  Read the case
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              </div>

              <TiltSurface className="lux-project-visual" cursorLabel="View project">
                <Link
                  href={`/archive/${project.slug}`}
                  className="lux-project-visual-link"
                  aria-labelledby={`project-${project.slug}-title`}
                >
                  <MotionMedia className="lux-project-media" parallax={3}>
                    {project.visual?.image && (
                      <Image
                        src={project.visual.image}
                        alt={project.visual.alt}
                        fill
                        sizes="(max-width: 760px) 100vw, 44vw"
                      />
                    )}
                  </MotionMedia>
                  <span className="lux-project-depth-index" aria-hidden="true">
                    0{index + 1}
                  </span>
                </Link>
              </TiltSurface>
            </MotionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Capability() {
  return (
    <section id="capability" className="lux-capability lux-section">
      <div className="lux-shell">
        <div className="lux-section-head">
          <MotionReveal direction="left">
            <p className="lux-eyebrow">Capability</p>
            <MotionHeading>
              A technical toolkit, pointed at business questions.
            </MotionHeading>
          </MotionReveal>
          <MotionReveal delay={0.08} direction="right">
            <p>
              The stack matters less than what it is aimed at. These are the
              tools I reach for, grouped by the kind of problem they answer.
            </p>
          </MotionReveal>
        </div>

        <div className="lux-capability-grid">
          {capabilityGroups.map((group, index) => (
            <MotionReveal
              key={group.label}
              className="lux-capability-group"
              delay={index * 0.055}
              direction="up"
            >
              <div className="lux-capability-head">
                <span className="lux-capability-index">
                  0{index + 1}
                </span>
                <h3>{group.label}</h3>
              </div>
              <p className="lux-capability-note">{group.note}</p>
              <ul className="lux-capability-list">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </MotionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Proof() {
  return (
    <section id="proof" className="lux-proof lux-section">
      <SectionLight className="motion-section-light-dark" />
      <div className="lux-shell">
        <div className="lux-section-head">
          <MotionReveal direction="left">
            <p className="lux-eyebrow lux-eyebrow-light">Proof</p>
            <MotionHeading>Numbers that were earned slowly.</MotionHeading>
          </MotionReveal>
          <MotionReveal delay={0.08} direction="right">
            <p>
              Not the whole story, but the part that can be checked. Academics,
              entrances, and the quieter habit of showing up to hard problems.
            </p>
          </MotionReveal>
        </div>

        <div className="lux-proof-grid">
          {proofPoints.map((point, index) => (
            <MotionReveal
              key={point.label}
              className="lux-proof-item"
              delay={index * 0.05}
              direction="up"
            >
              <p className="lux-proof-figure display-serif">
                {point.figure}
                {point.suffix && (
                  <span className="lux-proof-suffix">{point.suffix}</span>
                )}
              </p>
              <h3>{point.label}</h3>
              <span>{point.detail}</span>
            </MotionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Resume() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 78%", "end 38%"],
  });
  const timelineProgress = useSpring(scrollYProgress, motionSpring.progress);

  return (
    <section id="resume" className="lux-resume lux-section">
      <div className="lux-shell lux-resume-grid">
        <MotionReveal className="lux-resume-intro" direction="left">
          <p className="lux-eyebrow">Resume</p>
          <MotionHeading>A technical beginning. A broader business direction.</MotionHeading>
          <p>
            The path so far moves from engineering and data science into
            product judgment, markets, and the operating realities around
            technology.
          </p>
          <a
            href={profile.resume}
            target="_blank"
            rel="noreferrer"
            className="lux-button lux-button-dark"
          >
            Open full resume
            <Download aria-hidden="true" />
          </a>
        </MotionReveal>

        <MotionReveal className="lux-timeline" direction="right" delay={0.08}>
          <div ref={timelineRef} className="lux-timeline-track" aria-hidden="true">
            <motion.i
              style={shouldReduceMotion ? { scaleY: 1 } : { scaleY: timelineProgress }}
            />
          </div>
          {timeline.map((entry, index) => (
            <MotionReveal
              key={`${entry.period}-${entry.title}`}
              className="lux-timeline-row"
              delay={index * 0.035}
              direction="up"
            >
              <i className="lux-timeline-node" aria-hidden="true" />
              <span className="lux-timeline-period">{entry.period}</span>
              <div>
                <p>{entry.place}</p>
                <h3>{entry.title}</h3>
                <span>{entry.note}</span>
              </div>
            </MotionReveal>
          ))}
        </MotionReveal>
      </div>
    </section>
  );
}

function Notes({ posts }: { posts: JournalPost[] }) {
  return (
    <section id="notes" className="lux-notes lux-section">
      <div className="lux-shell">
        <div className="lux-section-head lux-section-head-dark">
          <MotionReveal direction="left">
            <p className="lux-eyebrow lux-eyebrow-light">Field notes</p>
            <MotionHeading>Ideas made clearer by writing them down.</MotionHeading>
          </MotionReveal>
          <MotionReveal delay={0.08} direction="right">
            <p>
              Short reflections on product, markets, AI, consumer behaviour,
              and what business school is changing in how I think.
            </p>
            <Link href="/journal">
              Browse the journal
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </MotionReveal>
        </div>

        <div className="lux-note-list">
          {posts.slice(0, 3).map((post, index) => (
            <MotionReveal
              key={post.slug}
              delay={index * 0.045}
              direction={index % 2 === 0 ? "left" : "right"}
            >
              <Link href={`/journal/${post.slug}`} className="lux-note-row">
                <span>0{index + 1}</span>
                <div>
                  <p>{post.category} · {formatDate(post.date)}</p>
                  <h3>{post.title}</h3>
                  <small>{post.readingTime}</small>
                </div>
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </MotionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Life() {
  return (
    <section id="life" className="lux-life lux-section">
      <div className="lux-shell">
        <div className="lux-life-copy">
          <MotionReveal direction="left">
            <p className="lux-eyebrow">Outside the work</p>
            <MotionHeading>The quieter parts matter too.</MotionHeading>
          </MotionReveal>
          <MotionReveal delay={0.08} direction="right">
            <p>
              Hills, travel, friends, photography, and the small pauses that
              keep ambition from becoming the only thing in the frame.
            </p>
            <Link href="/life">
              View the life archive
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </MotionReveal>
        </div>

        <div className="lux-life-grid">
          {lifeFrames.map((image, index) => (
            <MotionReveal
              key={image.src}
              className={`lux-life-frame lux-life-frame-${index + 1}`}
              delay={index * 0.04}
              direction={index % 2 === 0 ? "left" : "right"}
            >
              <MotionMedia
                className="lux-life-media"
                parallax={index === 1 ? 5 : 3}
                fill
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 760px) 100vw, 55vw"
                />
              </MotionMedia>
              <p>{image.caption}</p>
            </MotionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PremiumPortfolio({
  journalPosts,
}: {
  journalPosts: JournalPost[];
}) {
  return (
    <main className="lux-home">
      <ScrollGuide />
      <Hero />
      <Profile />
      <Work />
      <Capability />
      <Resume />
      <Proof />
      <Notes posts={journalPosts} />
      <Life />
    </main>
  );
}
