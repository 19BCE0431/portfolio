"use client";

import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  Download,
  GraduationCap,
  Mail,
  MapPin,
  ScanSearch,
  Sparkles,
  Trophy,
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
import { useRef, type CSSProperties, type ReactNode } from "react";
import {
  getProjectBySlug,
  type ArchiveProject,
} from "../data/archive";
import type { JournalPost } from "../data/journal";
import { lifeGalleryImages, mbaLifeImages } from "../data/media";
import { profile, workingModes } from "../data/portfolio";

const ease = [0.16, 1, 0.3, 1] as const;

const proofPoints = [
  {
    value: "28%",
    label: "order lift",
    detail: "from image-led product discovery",
  },
  {
    value: "60%",
    label: "faster runtime",
    detail: "after database and script optimisation",
  },
  {
    value: "Top 10%",
    label: "academic signal",
    detail: "at IIM Sirmaur, 2025-26",
  },
  {
    value: "9.15",
    label: "B.Tech CGPA",
    detail: "Computer Science at VIT Vellore",
  },
];

const storyChapters = [
  {
    number: "01",
    label: "Engineering",
    title: "Build the system.",
    body: "Computer Science gave me the discipline to make ambiguous problems concrete: inputs, constraints, edge cases, and working software.",
  },
  {
    number: "02",
    label: "Applied AI",
    title: "Put it in the real world.",
    body: "At BigHaat, models and automations had to survive live data, operational urgency, and the moment a customer or team needed an answer.",
  },
  {
    number: "03",
    label: "Business",
    title: "Ask the better question.",
    body: "The MBA is widening the frame from how a system works to why a market moves, what a customer trusts, and which decision matters next.",
  },
];

const projectSpecs = [
  {
    slug: "applied-image-search",
    number: "01",
    result: "+28%",
    resultLabel: "orders",
    color: "#d9ff6c",
    textColor: "#121410",
  },
  {
    slug: "order-drop-detection",
    number: "02",
    result: "40%",
    resultLabel: "faster issue response",
    color: "#91c8ff",
    textColor: "#0b1824",
  },
  {
    slug: "competitor-price-intelligence",
    number: "03",
    result: "9",
    resultLabel: "competitor sites tracked",
    color: "#ff8d73",
    textColor: "#24100c",
  },
  {
    slug: "invoice-pdf-automation",
    number: "04",
    result: "OCR",
    resultLabel: "manual entry to review flow",
    color: "#ddd2ff",
    textColor: "#171224",
  },
] as const;

const featuredProjects = projectSpecs
  .map((spec) => {
    const project = getProjectBySlug(spec.slug);
    return project ? { ...spec, project } : null;
  })
  .filter(
    (
      entry,
    ): entry is (typeof projectSpecs)[number] & { project: ArchiveProject } =>
      Boolean(entry),
  );

const resumeTimeline = [
  {
    period: "2025 - 2027",
    role: "MBA Candidate",
    organisation: "Indian Institute of Management Sirmaur",
    summary:
      "Product, marketing, strategy, consumer behaviour, and the business judgment around technology.",
    signals: ["Academic Excellence", "Top 10% of batch", "83.6%"],
    icon: GraduationCap,
  },
  {
    period: "2024 - 2025",
    role: "Data Science Engineer",
    organisation: "BigHaat Agro",
    summary:
      "Built applied AI, search, pricing, anomaly, logistics, document, and automation systems in a live agri-commerce environment.",
    signals: ["Image search", "RAG", "Dashboards", "Automation"],
    icon: BriefcaseBusiness,
  },
  {
    period: "2023 - 2024",
    role: "Data Science Intern",
    organisation: "BigHaat Agro",
    summary:
      "Moved from model-building into operational workflows, alerting, competitive intelligence, and decision support.",
    signals: ["Python", "Superset", "Selenium", "Scrapy"],
    icon: Code2,
  },
  {
    period: "2019 - 2023",
    role: "B.Tech, Computer Science",
    organisation: "VIT Vellore",
    summary:
      "A technical foundation in software, data, real-time collaboration, forecasting, and systems thinking.",
    signals: ["CGPA 9.15/10", "Real-time systems", "Forecasting"],
    icon: GraduationCap,
  },
];

const toolsDesk = [
  {
    number: "01",
    title: "Case War Room",
    text: "Turn a business case into a structured team workflow, from source decoding to recommendation.",
    icon: BrainCircuit,
  },
  {
    number: "02",
    title: "SIP Readiness Scorecard",
    text: "Translate an internship target into visible gaps, evidence, and a practical preparation sequence.",
    icon: CheckCircle2,
  },
  {
    number: "03",
    title: "Interview Intelligence",
    text: "Move from scattered company research to sharper talking points and better questions.",
    icon: ScanSearch,
  },
];

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.72, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

function PageProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 28,
    mass: 0.35,
  });

  return (
    <motion.div
      className="np-page-progress"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}

function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.82], [1, 0.2]);

  return (
    <section id="intro" ref={heroRef} className="np-hero">
      <motion.div
        className="np-hero-media"
        style={shouldReduceMotion ? undefined : { y: imageY }}
        aria-hidden="true"
      >
        <Image
          src={profile.portrait}
          alt=""
          fill
          priority
          sizes="100vw"
          className="np-hero-image"
        />
      </motion.div>
      <div className="np-hero-shade" aria-hidden="true" />
      <div className="np-hero-index" aria-hidden="true">
        <span>Portfolio</span>
        <span>2026</span>
      </div>

      <motion.div
        className="np-hero-copy"
        style={
          shouldReduceMotion
            ? undefined
            : { y: copyY, opacity: copyOpacity }
        }
      >
        <motion.div
          className="np-availability"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease }}
        >
          <span aria-hidden="true" />
          MBA at IIM Sirmaur · Product, strategy & AI
        </motion.div>

        <motion.h1
          initial={shouldReduceMotion ? false : { opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.86, delay: 0.24, ease }}
        >
          Mohit
          <span>Sai Krishna.</span>
        </motion.h1>

        <motion.p
          className="np-hero-positioning"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, delay: 0.38, ease }}
        >
          I turn data, AI, and operating signals into products and decisions
          that make sense to people.
        </motion.p>

        <motion.div
          className="np-hero-actions"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.68, delay: 0.48, ease }}
        >
          <Link href="#work" className="np-action np-action-primary">
            Explore the work
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </Link>
          <a
            href={profile.resume}
            className="np-action np-action-ghost"
            target="_blank"
            rel="noreferrer"
          >
            Resume
            <Download className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href={`mailto:${profile.email}`}
            className="np-action np-action-icon"
            aria-label={`Email ${profile.shortName}`}
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
          </a>
        </motion.div>
      </motion.div>

      <div className="np-hero-foot">
        <span className="np-hero-location">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          India
        </span>
        <span className="np-hero-scroll">
          Scroll to read
          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </section>
  );
}

function ProofStrip() {
  return (
    <section className="np-proof" aria-label="Selected proof points">
      <div className="np-proof-rail">
        {proofPoints.map((point, index) => (
          <Reveal
            key={point.label}
            className="np-proof-item"
            delay={index * 0.05}
          >
            <strong>{point.value}</strong>
            <span>{point.label}</span>
            <small>{point.detail}</small>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Story() {
  return (
    <section id="story" className="np-story">
      <div className="np-shell np-story-grid">
        <div className="np-story-intro">
          <Reveal>
            <p className="np-kicker">The through-line</p>
            <h2>From building systems to shaping choices.</h2>
            <p>
              The technology is useful. The decision it improves is the point.
            </p>
          </Reveal>

          <Reveal className="np-capability-cloud" delay={0.08}>
            {workingModes.slice(0, 8).map((mode) => (
              <span key={mode}>{mode}</span>
            ))}
          </Reveal>
        </div>

        <div className="np-story-chapters">
          {storyChapters.map((chapter, index) => (
            <Reveal
              key={chapter.number}
              className="np-story-chapter"
              delay={index * 0.06}
            >
              <div className="np-story-number">{chapter.number}</div>
              <div>
                <p>{chapter.label}</p>
                <h3>{chapter.title}</h3>
                <span>{chapter.body}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectChapter({
  entry,
  index,
}: {
  entry: (typeof featuredProjects)[number];
  index: number;
}) {
  const { project } = entry;

  return (
    <article
      className="np-project"
      style={
        {
          "--project-color": entry.color,
          "--project-ink": entry.textColor,
        } as CSSProperties
      }
    >
      <div className="np-project-copy">
        <Reveal>
          <div className="np-project-meta">
            <span>{entry.number}</span>
            <span>{project.category}</span>
            <span>{project.status}</span>
          </div>
          <h3>{project.title}</h3>
          <p className="np-project-lede">{project.shortDescription}</p>

          <div className="np-project-result">
            <strong>{entry.result}</strong>
            <span>{entry.resultLabel}</span>
          </div>

          <dl className="np-project-details">
            <div>
              <dt>The problem</dt>
              <dd>{project.problem}</dd>
            </div>
            <div>
              <dt>My contribution</dt>
              <dd>{project.contribution}</dd>
            </div>
          </dl>

          <div className="np-project-tools">
            {project.tools.slice(0, 4).map((tool) => (
              <span key={tool}>{tool}</span>
            ))}
          </div>

          <Link href={`/archive/${project.slug}`} className="np-text-link">
            Read the case
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>

      <div className="np-project-visual">
        <div className="np-project-visual-inner">
          <div className="np-project-visual-head">
            <span>{project.visual?.label ?? "Project system"}</span>
            <span>0{index + 1} / 04</span>
          </div>
          {project.visual?.image && (
            <div className="np-project-image-wrap">
              <Image
                src={project.visual.image}
                alt={project.visual.alt}
                fill
                sizes="(max-width: 780px) 92vw, 48vw"
                className="np-project-image"
              />
            </div>
          )}
          <p>{project.visual?.caption}</p>
        </div>
      </div>
    </article>
  );
}

function Work() {
  return (
    <section id="work" className="np-work">
      <div className="np-shell np-work-head">
        <Reveal>
          <p className="np-kicker np-kicker-light">Selected work</p>
          <h2>Proof, not a project dump.</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p>
            Four systems where the technical work connects to a visible
            customer, operating, or market outcome.
          </p>
          <Link href="/archive" className="np-text-link np-text-link-light">
            Full archive
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>

      <div className="np-project-list">
        {featuredProjects.map((entry, index) => (
          <ProjectChapter key={entry.slug} entry={entry} index={index} />
        ))}
      </div>
    </section>
  );
}

function ResumeChapter() {
  return (
    <section id="resume" className="np-resume">
      <div className="np-shell np-resume-grid">
        <div className="np-resume-intro">
          <Reveal>
            <p className="np-kicker np-kicker-dark">Resume · 2026</p>
            <h2>Technical depth. Business direction.</h2>
            <p>
              A quick read of the path from Computer Science to applied AI,
              agri-commerce operations, and an MBA at IIM Sirmaur.
            </p>
            <a
              href={profile.resume}
              className="np-resume-download"
              target="_blank"
              rel="noreferrer"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Open the full resume
            </a>
          </Reveal>

          <Reveal className="np-resume-signal" delay={0.08}>
            <Trophy className="h-5 w-5" aria-hidden="true" />
            <div>
              <strong>Academic Excellence</strong>
              <span>Top 10% at IIM Sirmaur · 2025-26</span>
            </div>
          </Reveal>
        </div>

        <div className="np-timeline">
          {resumeTimeline.map((entry, index) => {
            const Icon = entry.icon;

            return (
              <Reveal
                key={`${entry.period}-${entry.role}`}
                className="np-timeline-row"
                delay={index * 0.045}
              >
                <div className="np-timeline-period">{entry.period}</div>
                <div className="np-timeline-marker">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="np-timeline-copy">
                  <p>{entry.organisation}</p>
                  <h3>{entry.role}</h3>
                  <span>{entry.summary}</span>
                  <div>
                    {entry.signals.map((signal) => (
                      <small key={signal}>{signal}</small>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ToolsDesk() {
  return (
    <section id="tools" className="np-tools">
      <div className="np-shell">
        <div className="np-tools-head">
          <Reveal>
            <p className="np-kicker">MBA tools desk</p>
            <h2>The portfolio also works.</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p>
              Small AI-assisted workspaces built around the repeated friction
              of case rooms, internship preparation, and company research.
            </p>
            <Link href="/tools" className="np-action np-action-dark">
              Open the tools
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>

        <div className="np-tools-rail">
          {toolsDesk.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <Reveal
                key={tool.title}
                className="np-tool"
                delay={index * 0.06}
              >
                <div>
                  <span>{tool.number}</span>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3>{tool.title}</h3>
                <p>{tool.text}</p>
                <Link href="/tools" aria-label={`Explore ${tool.title}`}>
                  Explore
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function formatJournalDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function Journal({ posts }: { posts: JournalPost[] }) {
  return (
    <section id="journal" className="np-journal">
      <div className="np-shell">
        <div className="np-journal-head">
          <Reveal>
            <p className="np-kicker">Notes in public</p>
            <h2>Thinking that survives the edit.</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p>
              Product, market, consumer, and AI observations written to make a
              useful question clearer.
            </p>
            <Link href="/journal" className="np-text-link">
              Browse all notes
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>

        <div className="np-journal-list">
          {posts.map((post, index) => (
            <Reveal key={post.slug} delay={index * 0.05}>
              <Link href={`/journal/${post.slug}`} className="np-journal-row">
                <div className="np-journal-index">0{index + 1}</div>
                <div className="np-journal-copy">
                  <p>
                    {post.category} · {formatJournalDate(post.date)}
                  </p>
                  <h3>{post.title}</h3>
                  <span>{post.summary}</span>
                  <small>{post.readingTime}</small>
                </div>
                <div className="np-journal-arrow" aria-hidden="true">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const lifeFrames = [
  mbaLifeImages[2]!,
  lifeGalleryImages[4]!,
  mbaLifeImages[1]!,
  lifeGalleryImages[1]!,
  lifeGalleryImages[2]!,
];

function Life() {
  return (
    <section id="life" className="np-life">
      <div className="np-shell np-life-head">
        <Reveal>
          <p className="np-kicker np-kicker-light">Beyond the resume</p>
          <h2>A person, not only a profile.</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p>
            Campus rain, mountain roads, badminton, books, photography, and the
            quiet reset between demanding weeks.
          </p>
          <Link href="/life" className="np-text-link np-text-link-light">
            Open the life archive
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>

      <div className="np-life-rail">
        {lifeFrames.map((image, index) => (
          <Reveal
            key={image.src}
            className={`np-life-frame np-life-frame-${index + 1}`}
            delay={index * 0.04}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 780px) 82vw, 32vw"
              className="np-life-image"
            />
            <div>
              <span>0{index + 1}</span>
              <p>{image.caption}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ClosingPrompt() {
  return (
    <section className="np-closing">
      <div className="np-shell">
        <Reveal>
          <Sparkles className="h-6 w-6" aria-hidden="true" />
          <p>One useful conversation can change the direction of the work.</p>
          <a href={`mailto:${profile.email}`}>
            Start one
            <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

export function PortfolioExperience({
  journalPosts,
}: {
  journalPosts: JournalPost[];
}) {
  return (
    <main className="neo-portfolio">
      <PageProgress />
      <Hero />
      <ProofStrip />
      <Story />
      <Work />
      <ResumeChapter />
      <ToolsDesk />
      <Journal posts={journalPosts} />
      <Life />
      <ClosingPrompt />
    </main>
  );
}
