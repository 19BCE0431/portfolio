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
import { useEffect, useRef, useState, type ReactNode } from "react";
import { getProjectBySlug, type ArchiveProject } from "../data/archive";
import type { JournalPost } from "../data/journal";
import { lifeGalleryImages } from "../data/media";
import { profile } from "../data/portfolio";
import { WorkMotionScene } from "./WorkMotionScene";

const ease = [0.16, 1, 0.3, 1] as const;

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
  { id: "resume", label: "Resume" },
  { id: "notes", label: "Field notes" },
  { id: "life", label: "Outside the work" },
  { id: "contact", label: "Connect" },
];

function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "left" | "right" | "up";
}) {
  const shouldReduceMotion = useReducedMotion();
  const initialOffset =
    direction === "left"
      ? { x: -58, y: 0 }
      : direction === "right"
        ? { x: 58, y: 0 }
        : { x: 0, y: 42 };

  return (
    <motion.div
      className={className}
      initial={
        shouldReduceMotion
          ? false
          : { opacity: 0, ...initialOffset, scale: 0.985, filter: "blur(8px)" }
      }
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.16, margin: "-6% 0px" }}
      transition={{ duration: 0.88, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

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
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.3,
  });
  const [activeSection, setActiveSection] = useState(sections[0]);

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

        if (visible?.target.id) {
          const section = sections.find((item) => item.id === visible.target.id);
          if (section) setActiveSection(section);
        }
      },
      {
        rootMargin: "-34% 0px -50% 0px",
        threshold: [0.02, 0.2, 0.45],
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const activeIndex = sections.findIndex((section) => section.id === activeSection.id);

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
        style={shouldReduceMotion ? undefined : { y: mediaY, scale: mediaScale }}
      >
        <WorkMotionScene />
      </motion.div>
      <div className="lux-hero-shade" aria-hidden="true" />

      <motion.div
        className="lux-hero-copy lux-shell"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        style={shouldReduceMotion ? undefined : { y: copyY, opacity: copyOpacity }}
        transition={{ duration: 0.82, delay: 0.12, ease }}
      >
        <p className="lux-hero-context">Product · Strategy · Applied AI</p>
        <h1>
          <span>Mohit Sai </span>
          <span>Krishna</span>
        </h1>
        <p className="lux-hero-thesis">
          I connect technical depth with business judgment to make complex
          products, markets, and decisions easier to understand.
        </p>
        <div className="lux-hero-actions">
          <Link href="#profile" className="lux-button lux-button-light">
            Explore the portfolio
            <ArrowDown aria-hidden="true" />
          </Link>
          <a
            href={profile.resume}
            target="_blank"
            rel="noreferrer"
            className="lux-button lux-button-quiet"
          >
            Resume
            <Download aria-hidden="true" />
          </a>
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
        <Reveal className="lux-profile-visual" direction="left">
          <div className="lux-profile-image">
            <motion.div
              className="lux-profile-image-inner"
              style={shouldReduceMotion ? undefined : { y: portraitY }}
            >
              <Image
                src="/images/profile/profile-campus-01.jpg"
                alt="Mohit Sai Krishna on the IIM Sirmaur campus"
                fill
                loading="eager"
                sizes="(max-width: 760px) 100vw, 42vw"
              />
            </motion.div>
            <div className="lux-profile-image-wash" aria-hidden="true" />
          </div>
          <div className="lux-profile-caption">
            <span>Current chapter</span>
            <strong>IIM Sirmaur · India</strong>
          </div>
        </Reveal>

        <Reveal className="lux-profile-copy" delay={0.08} direction="right">
          <p className="lux-eyebrow">Profile</p>
          <h2>Technology taught me how to build. Business is teaching me what deserves to be built.</h2>
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
        </Reveal>
      </div>
    </section>
  );
}

function Work() {
  return (
    <section id="work" className="lux-work lux-section">
      <div className="lux-shell">
        <div className="lux-section-head">
          <Reveal direction="left">
            <p className="lux-eyebrow lux-eyebrow-light">Selected work</p>
            <h2>Systems built around real decisions.</h2>
          </Reveal>
          <Reveal delay={0.08} direction="right">
            <p>
              Three examples from applied AI and operations. The full archive
              holds the broader technical record.
            </p>
            <Link href="/archive">
              View full archive
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Reveal>
        </div>

        <div className="lux-project-list">
          {selectedProjects.map((project, index) => (
            <Reveal
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
                <h3>{project.title}</h3>
                <p>{project.shortDescription}</p>
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

              <div className="lux-project-visual">
                {project.visual?.image && (
                  <Image
                    src={project.visual.image}
                    alt={project.visual.alt}
                    fill
                    sizes="(max-width: 760px) 100vw, 44vw"
                  />
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Resume() {
  return (
    <section id="resume" className="lux-resume lux-section">
      <div className="lux-shell lux-resume-grid">
        <Reveal className="lux-resume-intro" direction="left">
          <p className="lux-eyebrow">Resume</p>
          <h2>A technical beginning. A broader business direction.</h2>
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
        </Reveal>

        <Reveal className="lux-timeline" direction="right" delay={0.08}>
          {timeline.map((entry, index) => (
            <Reveal
              key={`${entry.period}-${entry.title}`}
              className="lux-timeline-row"
              delay={index * 0.035}
              direction="up"
            >
              <span className="lux-timeline-period">{entry.period}</span>
              <div>
                <p>{entry.place}</p>
                <h3>{entry.title}</h3>
                <span>{entry.note}</span>
              </div>
            </Reveal>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function Notes({ posts }: { posts: JournalPost[] }) {
  return (
    <section id="notes" className="lux-notes lux-section">
      <div className="lux-shell">
        <div className="lux-section-head lux-section-head-dark">
          <Reveal direction="left">
            <p className="lux-eyebrow lux-eyebrow-light">Field notes</p>
            <h2>Ideas made clearer by writing them down.</h2>
          </Reveal>
          <Reveal delay={0.08} direction="right">
            <p>
              Short reflections on product, markets, AI, consumer behaviour,
              and what business school is changing in how I think.
            </p>
            <Link href="/journal">
              Browse the journal
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Reveal>
        </div>

        <div className="lux-note-list">
          {posts.slice(0, 3).map((post, index) => (
            <Reveal
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
            </Reveal>
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
          <Reveal direction="left">
            <p className="lux-eyebrow">Outside the work</p>
            <h2>The quieter parts matter too.</h2>
          </Reveal>
          <Reveal delay={0.08} direction="right">
            <p>
              Hills, travel, friends, photography, and the small pauses that
              keep ambition from becoming the only thing in the frame.
            </p>
            <Link href="/life">
              View the life archive
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Reveal>
        </div>

        <div className="lux-life-grid">
          {lifeFrames.map((image, index) => (
            <Reveal
              key={image.src}
              className={`lux-life-frame lux-life-frame-${index + 1}`}
              delay={index * 0.04}
              direction={index % 2 === 0 ? "left" : "right"}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 760px) 100vw, 55vw"
              />
              <p>{image.caption}</p>
            </Reveal>
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
      <Resume />
      <Notes posts={journalPosts} />
      <Life />
    </main>
  );
}
