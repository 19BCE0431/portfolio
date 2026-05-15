"use client";

import {
  ArrowUpRight,
  BookOpenText,
  BriefcaseBusiness,
  Layers3,
  Mail,
  MoveRight,
  PenLine,
  Route,
  Sparkles,
} from "lucide-react";
import { motion, type MotionValue, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { getProjectBySlug, homepageProjects } from "../data/archive";
import type { JournalPost } from "../data/journal";
import {
  backgroundCards,
  credibilityMarkers,
  profile,
  skills,
  thesisPoints,
} from "../data/portfolio";
import { HeadingReveal } from "./HeadingReveal";
import { ProjectCard } from "./ProjectCard";
import { Reveal } from "./Reveal";
import { SectionLabel } from "./SectionLabel";
import { SiteNav } from "./SiteNav";

const premiumEase = [0.16, 1, 0.3, 1] as const;

const heroMarkers = [
  { label: "Current chapter", value: "MBA at IIM Sirmaur" },
  { label: "Foundation", value: "CSE, VIT Vellore" },
  { label: "Applied work", value: "Data Science Engineer" },
];

const systemFlow = [
  "Portfolio direction",
  "Project archive",
  "Weekly insight drafts",
  "Human-reviewed publishing",
];

const narrativeCards = [
  {
    title: "Product and strategy direction",
    text: "The MBA chapter is where I am sharpening how I frame customers, markets, positioning, adoption, and business choices.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Technical foundation",
    text: "Computer Science and Data Science experience give me a practical sense of what AI, analytics, and automation can actually do.",
    icon: Layers3,
  },
  {
    title: "Thinking in evidence",
    text: "The archive and journal are designed to show applied work, decisions supported, and how my direction is developing over time.",
    icon: BookOpenText,
  },
];

function SmartLink({
  href,
  children,
  className,
  ariaLabel,
}: {
  href: string;
  children: ReactNode;
  className: string;
  ariaLabel?: string;
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  const isExternal = href.startsWith("http");

  return (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

function ActionLink({
  href,
  children,
  variant = "light",
  icon,
}: {
  href: string;
  children: ReactNode;
  variant?: "light" | "dark";
  icon?: ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();
  const className =
    variant === "dark"
      ? "group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-white/12 bg-white/[0.08] px-4 py-2.5 text-[13px] font-medium text-white/88 shadow-[0_18px_48px_rgba(0,0,0,0.16)] transition hover:border-white/22 hover:bg-white/[0.12] focus:outline-none focus:ring-2 focus:ring-white/20 sm:w-auto"
      : "group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-black/10 bg-[rgba(255,253,248,0.78)] px-4 py-2.5 text-[13px] font-medium text-[var(--foreground)] shadow-[0_18px_54px_rgba(16,18,18,0.06)] backdrop-blur transition hover:border-black/18 hover:bg-white focus:outline-none focus:ring-2 focus:ring-black/15 sm:w-auto";

  return (
    <motion.span
      className="inline-flex w-full sm:w-auto"
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.24, ease: premiumEase }}
    >
      <SmartLink href={href} className={className}>
        {icon}
        <span>{children}</span>
        <ArrowUpRight className="h-3.5 w-3.5 opacity-55 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </SmartLink>
    </motion.span>
  );
}

function AmbientField({ progress }: { progress: MotionValue<number> }) {
  const shouldReduceMotion = useReducedMotion();
  const y = useTransform(progress, [0, 0.45], [0, 72]);
  const scale = useTransform(progress, [0, 0.45], [1, 1.07]);
  const opacity = useTransform(progress, [0, 0.45], [1, 0.42]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-[-10vw] top-0 h-[92svh] overflow-hidden"
      style={shouldReduceMotion ? undefined : { y, scale, opacity }}
    >
      <div className="premium-grid absolute left-[6vw] top-24 h-[520px] w-[min(860px,88vw)] opacity-[0.12] [mask-image:radial-gradient(circle_at_34%_32%,black,transparent_68%)]" />
      <motion.div
        className="orbital-line right-[4vw] top-24 hidden h-[420px] w-[640px] opacity-80 sm:block"
        animate={shouldReduceMotion ? undefined : { rotate: [-18, -10, -18] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="orbital-line right-[16vw] top-56 hidden h-[180px] w-[360px] opacity-80 md:block"
        animate={shouldReduceMotion ? undefined : { rotate: [8, -6, 8] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute right-[14vw] top-[32%] hidden h-2 w-2 rounded-full bg-[var(--sage)] shadow-[0_0_48px_rgba(104,121,109,0.45)] sm:block" />
      <div className="absolute right-[33vw] top-[48%] hidden h-1.5 w-1.5 rounded-full bg-[var(--steel)] opacity-70 sm:block" />
    </motion.div>
  );
}

function HeroVisual({ progress }: { progress: MotionValue<number> }) {
  const shouldReduceMotion = useReducedMotion();
  const portraitY = useTransform(progress, [0, 0.42], [0, -42]);
  const [portraitMissing, setPortraitMissing] = useState(false);

  return (
    <Reveal className="relative z-10 w-full justify-self-center lg:justify-self-end" delay={0.12}>
      <motion.div
        className="relative mx-auto w-full max-w-[330px] sm:max-w-[390px] lg:mx-0 lg:max-w-[470px]"
        style={{ y: shouldReduceMotion ? 0 : portraitY }}
      >
        <div className="absolute -inset-5 rounded-[8px] bg-[linear-gradient(135deg,rgba(104,121,109,0.14),rgba(104,119,137,0.06)_48%,rgba(154,127,99,0.12))] blur-2xl" />
        <motion.figure
          className="premium-panel relative overflow-hidden p-2"
          whileHover={shouldReduceMotion ? undefined : { y: -5 }}
          transition={{ duration: 0.45, ease: premiumEase }}
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] bg-[var(--surface-cool)]">
            {portraitMissing ? (
              <div
                role="img"
                aria-label={profile.portraitAlt}
                className="grid h-full place-items-center bg-[linear-gradient(145deg,#eef0ee,#fffdf8)] px-8 text-center"
              >
                <div>
                  <p className="editorial-kicker">Portrait</p>
                  <p className="mt-3 text-[1.12rem] font-semibold leading-[1.25]">
                    {profile.shortName}
                  </p>
                  <p className="mt-2 text-[0.88rem] leading-[1.5] text-[var(--muted)]">
                    Replace public/images/profile.jpg with a professional portrait.
                  </p>
                </div>
              </div>
            ) : (
              <Image
                src={profile.portrait}
                alt={profile.portraitAlt}
                fill
                priority
                sizes="(max-width: 640px) 78vw, (max-width: 1024px) 42vw, 34vw"
                onError={() => setPortraitMissing(true)}
                className="object-cover object-[52%_34%] saturate-[0.92] contrast-[1.04] transition-transform duration-[1100ms] ease-[var(--ease)] hover:scale-[1.018]"
              />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_58%,rgba(16,18,18,0.34))]" />
          </div>
          <figcaption className="flex flex-col gap-1 px-1 pb-1 pt-4 text-[12px] leading-[1.45] text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
            <span>MBA · Product/strategy · Data Science foundation</span>
            <span>{profile.location}</span>
          </figcaption>
        </motion.figure>

      </motion.div>
    </Reveal>
  );
}

function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const copyY = useTransform(scrollYProgress, [0, 0.35], [0, 22]);

  return (
    <section className="section-shell relative grid min-h-[92svh] items-center gap-10 overflow-hidden pb-12 pt-24 md:pt-30 lg:grid-cols-[minmax(0,0.96fr)_minmax(360px,0.58fr)] lg:gap-20">
      <AmbientField progress={scrollYProgress} />
      <motion.div className="relative z-10 max-w-[880px]" style={{ y: shouldReduceMotion ? 0 : copyY }}>
        <motion.p
          className="mb-6 max-w-[520px] text-[12px] font-semibold uppercase leading-[1.55] tracking-[0.18em] text-[var(--muted)]"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: premiumEase }}
        >
          {profile.name} · MBA at IIM Sirmaur
        </motion.p>
        <HeadingReveal
          as="h1"
          lines={["MBA lens.", "Technical depth.", "Product direction."]}
          mobileLines={["MBA lens.", "Technical depth.", "Product direction."]}
          className="display-tight max-w-[880px] text-[clamp(2.75rem,13vw,6rem)] font-semibold leading-[0.98] text-[var(--foreground)] md:text-[clamp(4.65rem,7.4vw,7.8rem)] md:leading-[0.91]"
          delay={0.06}
        />
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-[760px] text-pretty-balance text-[clamp(1.02rem,4.2vw,1.26rem)] leading-[1.62] text-[var(--muted-strong)] md:mt-8 md:text-[clamp(1.16rem,2vw,1.48rem)] md:leading-[1.52]">
            I am an MBA candidate at IIM Sirmaur, building toward product
            management, marketing, strategy, AI-enabled workflows, and
            business decision-making. My Computer Science and Data Science
            foundation helps me connect market questions with practical
            execution.
          </p>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="mt-7 grid max-w-[520px] grid-cols-2 gap-2.5 sm:mt-9 sm:flex sm:max-w-none sm:flex-wrap sm:gap-3 [&>*:last-child]:col-span-2">
            <ActionLink href={`mailto:${profile.email}`} icon={<Mail className="h-4 w-4 text-[var(--sage)]" />}>
              Email
            </ActionLink>
            <ActionLink href="/archive" icon={<MoveRight className="h-4 w-4 text-[var(--steel)]" />}>
              View archive
            </ActionLink>
            <ActionLink href="/journal" icon={<PenLine className="h-4 w-4 text-[var(--clay)]" />}>
              Read journal
            </ActionLink>
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-10 grid gap-3 border-y border-black/10 py-5 sm:grid-cols-3 md:mt-14">
            {heroMarkers.map((marker) => (
              <div key={marker.label}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {marker.label}
                </p>
                <p className="mt-2 text-[0.95rem] leading-[1.35] text-[var(--foreground)]">
                  {marker.value}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </motion.div>
      <HeroVisual progress={scrollYProgress} />
      <div className="noise-layer" />
      <div className="absolute bottom-0 left-0 right-0 h-px hairline" />
    </section>
  );
}

function ThesisCard({
  point,
  index,
  progress,
}: {
  point: (typeof thesisPoints)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const shouldReduceMotion = useReducedMotion();
  const start = Math.max(0, index * 0.24);
  const opacity = useTransform(
    progress,
    [start, start + 0.14, start + 0.42],
    [0.46, 1, 0.72],
  );
  const y = useTransform(
    progress,
    [start, start + 0.18, start + 0.42],
    [24, 0, -8],
  );

  return (
    <motion.article
      className="premium-panel p-5 md:p-7"
      style={shouldReduceMotion ? undefined : { opacity, y }}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="editorial-kicker">
          0{index + 1} / {point.label}
        </p>
        <Sparkles className="mt-0.5 h-4 w-4 text-[var(--sage)] opacity-60" />
      </div>
      <p className="mt-6 text-[clamp(1.08rem,2vw,1.42rem)] leading-[1.5] text-[var(--muted-strong)]">
        {point.text}
      </p>
    </motion.article>
  );
}

function Thesis() {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 78%", "end 26%"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0.08, 1]);

  return (
    <section ref={sectionRef} id="thesis" className="section-shell relative scroll-mt-28 py-20 md:py-36">
      <div className="grid gap-10 lg:grid-cols-[0.78fr_1fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:h-max">
          <Reveal>
            <SectionLabel>Thesis</SectionLabel>
            <HeadingReveal
              lines={["The work is moving", "from execution to judgment."]}
              mobileLines={["From execution", "to judgment."]}
              className="max-w-[700px] text-[clamp(2.25rem,10vw,4.9rem)] font-semibold leading-[1.01] tracking-[0] lg:leading-[0.96]"
            />
            <p className="mt-6 max-w-[620px] text-[1rem] leading-[1.68] text-[var(--muted-strong)] md:text-[1.14rem]">
              I started by building automation, prediction, document
              intelligence, image-led discovery, pricing dashboards, and
              alerts. The MBA is teaching me to ask the next question: what
              decision changes because this exists?
            </p>
            <div className="mt-8 h-px overflow-hidden bg-black/10">
              <motion.div
                className="h-full origin-left bg-[var(--foreground)]"
                style={shouldReduceMotion ? undefined : { scaleX: lineScale }}
              />
            </div>
          </Reveal>
        </div>

        <div className="grid gap-4">
          {thesisPoints.map((point, index) => (
            <ThesisCard
              key={point.label}
              point={point}
              index={index}
              progress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Background() {
  const shouldReduceMotion = useReducedMotion();
  const coreBackground = backgroundCards.slice(0, 4);
  const interestCard = backgroundCards[4];
  const retailCard = backgroundCards[5];

  return (
    <section id="background" className="dark-transition scroll-mt-28 py-24 text-[var(--surface)] md:py-44">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1fr] lg:items-end lg:gap-20">
          <Reveal>
            <SectionLabel>Background</SectionLabel>
            <HeadingReveal
              lines={["Business-school chapter,", "technical foundation."]}
              mobileLines={["Business-school", "chapter,", "technical foundation."]}
              className="max-w-[780px] text-[clamp(2.35rem,10vw,5.4rem)] font-semibold leading-[1] tracking-[0] md:leading-[0.96]"
            />
          </Reveal>
          <Reveal delay={0.08}>
            <p className="max-w-[720px] text-pretty-balance text-[clamp(1.04rem,2vw,1.28rem)] leading-[1.68] text-[var(--deep-muted)]">
              At IIM Sirmaur, I am building toward product management,
              marketing, strategy, and consumer-behavior work. Before the MBA,
              I studied CSE at VIT Vellore and worked in Bangalore as a Data
              Science Intern, then Data Science Engineer. At BigHaat, my work
              touched order behavior, content workflows, logistics, pricing
              intelligence, and decision support.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-3 md:mt-20 md:grid-cols-6">
          {coreBackground.map((item, index) => (
            <Reveal key={item.label} delay={index * 0.04} className="md:col-span-3 xl:col-span-2">
              <motion.article
                className="dark-panel min-h-[210px] p-5 md:p-6"
                whileHover={shouldReduceMotion ? undefined : { y: -5 }}
                transition={{ duration: 0.34, ease: premiumEase }}
              >
                <p className="editorial-kicker text-white/42">{item.label}</p>
                <p className="mt-8 text-[1.35rem] leading-[1.18] text-white/92 md:text-[1.65rem]">
                  {item.value}
                </p>
                <p className="mt-4 text-[0.92rem] leading-[1.55] text-white/54">
                  {item.detail}
                </p>
              </motion.article>
            </Reveal>
          ))}
          <Reveal className="md:col-span-3" delay={0.08}>
            <article className="dark-panel min-h-[250px] p-5 md:p-7">
              <p className="editorial-kicker text-white/42">Current interests</p>
              <p className="mt-7 max-w-[620px] text-[1.35rem] leading-[1.35] text-white/90">
                {interestCard.value}
              </p>
              <p className="mt-5 max-w-[620px] text-[0.98rem] leading-[1.68] text-white/58">
                {interestCard.detail}
              </p>
            </article>
          </Reveal>
          <Reveal className="md:col-span-3" delay={0.12}>
            <article className="dark-panel min-h-[250px] p-5 md:p-7">
              <p className="editorial-kicker text-white/42">{retailCard.label}</p>
              <p className="mt-7 max-w-[620px] text-[1.35rem] leading-[1.35] text-white/90">
                {retailCard.value}
              </p>
              <p className="mt-5 max-w-[620px] text-[0.98rem] leading-[1.68] text-white/58">
                {retailCard.detail}
              </p>
            </article>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-6 border-t border-white/10 pt-8 lg:grid-cols-[0.75fr_1fr]">
          <Reveal>
            <div>
              <p className="editorial-kicker text-white/42">Grounded markers</p>
              <div className="mt-5 grid gap-3 text-[0.95rem] leading-[1.5] text-white/64 sm:grid-cols-2">
                {credibilityMarkers.map((marker) => (
                  <p key={marker}>{marker}</p>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div>
              <p className="editorial-kicker text-white/42">Working toolkit</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span key={skill} className="rounded-[8px] border border-white/10 px-2.5 py-1 text-[12px] text-white/62">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FeaturedCaseStudy() {
  const project = getProjectBySlug("living-ai-portfolio-system");

  if (!project) return null;

  return (
    <section className="section-shell relative scroll-mt-28 py-20 md:py-36">
      <div className="absolute left-0 top-10 hidden h-px w-1/2 bg-gradient-to-r from-black/20 to-transparent md:block" />
      <div className="grid gap-7 lg:grid-cols-[0.76fr_1fr] lg:items-stretch lg:gap-6">
        <Reveal>
          <article className="premium-panel flex h-full min-h-[430px] flex-col justify-between overflow-hidden p-6 md:p-9">
            <div>
              <SectionLabel>Featured case study</SectionLabel>
              <HeadingReveal
                lines={["Living AI", "Portfolio System"]}
                mobileLines={["Living AI", "Portfolio System"]}
                className="max-w-[640px] text-[clamp(2.4rem,10vw,5.5rem)] font-semibold leading-[0.98] tracking-[0]"
              />
              <p className="mt-6 max-w-[620px] text-[1rem] leading-[1.68] text-[var(--muted-strong)] md:text-[1.15rem]">
                A living professional system designed to evolve with my MBA
                journey, projects, writing, and career direction. AI accelerates
                execution; human taste, positioning, and review shape the work.
              </p>
            </div>
            <div className="mt-8">
              <ActionLink href={`/archive/${project.slug}`} icon={<Route className="h-4 w-4 text-[var(--sage)]" />}>
                Read the case study
              </ActionLink>
            </div>
          </article>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="grid h-full gap-3 sm:grid-cols-2">
            {narrativeCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <article
                  key={card.title}
                  className={`premium-panel p-5 md:p-7 ${index === 2 ? "sm:col-span-2" : ""}`}
                >
                  <Icon className="h-5 w-5 text-[var(--sage)]" />
                  <h3 className="mt-7 text-[1.25rem] font-semibold leading-[1.2]">
                    {card.title}
                  </h3>
                  <p className="mt-4 text-[0.95rem] leading-[1.65] text-[var(--muted)]">
                    {card.text}
                  </p>
                </article>
              );
            })}
            <article className="premium-panel overflow-hidden p-5 sm:col-span-2 md:p-7">
              <p className="editorial-kicker">Roadmap</p>
              <div className="mt-6 grid gap-3 md:grid-cols-4">
                {systemFlow.map((step, index) => (
                  <div key={step} className="relative border-t border-black/10 pt-4">
                    <span className="text-[11px] font-semibold text-[var(--sage)]">0{index + 1}</span>
                    <p className="mt-3 text-[0.92rem] leading-[1.45] text-[var(--muted-strong)]">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ArchivePreview() {
  const selectedProjects = homepageProjects
    .filter((project) => project.slug !== "living-ai-portfolio-system")
    .slice(0, 4);

  return (
    <section id="archive" className="section-shell relative scroll-mt-28 overflow-hidden py-20 md:py-36">
      <div className="premium-grid pointer-events-none absolute right-0 top-24 h-[360px] w-[520px] opacity-[0.1] [mask-image:radial-gradient(circle,black,transparent_70%)]" />
      <div className="mb-10 grid gap-8 md:mb-14 lg:grid-cols-[0.72fr_1fr] lg:gap-16">
        <Reveal>
          <SectionLabel>Selected archive</SectionLabel>
          <HeadingReveal
            lines={["Work that shaped how I think."]}
            mobileLines={["Evidence,", "not just claims."]}
            className="max-w-[680px] text-[clamp(2.35rem,10vw,5.1rem)] font-semibold leading-[1] tracking-[0] md:leading-[0.96]"
          />
        </Reveal>
        <Reveal delay={0.08}>
          <div className="max-w-[720px]">
            <p className="text-[clamp(1.02rem,1.7vw,1.22rem)] leading-[1.68] text-[var(--muted-strong)]">
              A curated preview of projects, experiments, and learning notes — from applied AI and data science work to product, pricing, and market-facing decisions. Each piece is framed by what it changed, what it taught me, and how it shaped my business lens.
            </p>
            <Link href="/archive" className="mt-6 inline-flex items-center gap-2 text-[0.95rem] font-medium text-[var(--foreground)]">
              View full project library
              <ArrowUpRight className="h-4 w-4 text-[var(--muted)]" />
            </Link>
          </div>
        </Reveal>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {selectedProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} compact />
        ))}
      </div>
    </section>
  );
}

function JournalPreview({ posts }: { posts: JournalPost[] }) {
  const hasPosts = posts.length > 0;

  return (
    <section id="journal" className="section-shell scroll-mt-28 border-y border-black/10 py-20 md:py-32">
      <div className="mb-10 grid gap-8 md:mb-12 lg:grid-cols-[0.82fr_1fr] lg:items-end lg:gap-16">
        <Reveal>
          <SectionLabel>Journal</SectionLabel>
          <HeadingReveal
            lines={["Notes on products,", "markets, AI, and decisions."]}
            mobileLines={["Products,", "markets, AI,", "and decisions."]}
            className="max-w-[760px] text-[clamp(2.35rem,10vw,5rem)] font-semibold leading-[1] tracking-[0] md:leading-[0.96]"
          />
        </Reveal>
        <Reveal delay={0.08}>
          <p className="max-w-[680px] text-[clamp(1.02rem,1.65vw,1.2rem)] leading-[1.68] text-[var(--muted-strong)]">
            A thinking-in-public library for product strategy, market signals,
            Applied AI, consumer behavior, and business decisions. Drafts stay
            private until they are reviewed and worth publishing.
          </p>
          <Link href="/journal" className="mt-6 inline-flex items-center gap-2 text-[0.95rem] font-medium text-[var(--foreground)]">
            {hasPosts ? "View insight library" : "View journal foundation"}
            <ArrowUpRight className="h-4 w-4 text-[var(--muted)]" />
          </Link>
        </Reveal>
      </div>

      <div className="divide-y divide-black/10 border-y border-black/10">
        {hasPosts ? (
          posts.map((post, index) => (
            <Reveal key={post.slug} delay={index * 0.04}>
              <Link href={`/journal/${post.slug}`} className="group grid gap-4 py-6 md:grid-cols-[170px_1fr_40px] md:items-start md:gap-10 md:py-8">
                <span className="text-[12px] font-medium text-[var(--sage)]">{post.category}</span>
                <div>
                  <h3 className="text-[clamp(1.34rem,2.25vw,2.2rem)] font-semibold leading-[1.08] tracking-[0]">
                    {post.title}
                  </h3>
                  <p className="mt-3 max-w-[820px] text-[0.98rem] leading-[1.64] text-[var(--muted)]">
                    {post.summary}
                  </p>
                  <p className="mt-3 text-[12px] text-[var(--muted)]">{post.readingTime}</p>
                </div>
                <ArrowUpRight className="hidden h-4 w-4 text-[var(--muted)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 md:block" />
              </Link>
            </Reveal>
          ))
        ) : (
          <Reveal>
            <article className="grid gap-5 py-9 md:grid-cols-[0.7fr_1fr] md:items-center">
              <div>
                <p className="text-[1.35rem] font-semibold text-[var(--foreground)]">
                  Long-form notes will appear here once they are reviewed and published.
                </p>
                <p className="mt-3 max-w-[680px] text-[0.98rem] leading-[1.64] text-[var(--muted)]">
                  The system is ready for weekly notes on products, markets, AI,
                  consumer behavior, and business decisions.
                </p>
              </div>
              <div className="premium-panel p-5">
                <p className="editorial-kicker">Publishing rule</p>
                <p className="mt-4 text-[0.98rem] leading-[1.6] text-[var(--muted-strong)]">
                  Drafts remain private until the source links, argument,
                  writing quality, and professional fit are reviewed.
                </p>
              </div>
            </article>
          </Reveal>
        )}
      </div>
    </section>
  );
}

export function HomePageClient({ journalPosts }: { journalPosts: JournalPost[] }) {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <Thesis />
        <Background />
        <FeaturedCaseStudy />
        <ArchivePreview />
        <JournalPreview posts={journalPosts} />
      </main>
    </>
  );
}
