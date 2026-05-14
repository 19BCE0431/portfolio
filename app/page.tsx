"use client";

import { ArrowUpRight, Link2, Mail, MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import type { ReactNode } from "react";
import { Footer } from "./components/Footer";
import { HeadingReveal } from "./components/HeadingReveal";
import { ProjectCard } from "./components/ProjectCard";
import { Reveal } from "./components/Reveal";
import { SectionLabel } from "./components/SectionLabel";
import { SiteNav } from "./components/SiteNav";
import { homepageProjects } from "./data/archive";
import {
  backgroundCards,
  credibilityMarkers,
  journalItems,
  profile,
  skills,
  thesisPoints,
} from "./data/portfolio";

function LinkButton({
  href,
  children,
  icon,
}: {
  href: string;
  children: ReactNode;
  icon: ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();
  const className =
    "group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-black/10 bg-white/50 px-3.5 py-2.5 text-[13px] font-medium text-[var(--foreground)] shadow-[0_10px_32px_rgba(17,19,19,0.05)] backdrop-blur transition-colors duration-300 hover:border-black/20 hover:bg-white sm:min-h-0 sm:w-auto sm:justify-start sm:py-2";
  const content = (
    <>
      {icon}
      <span>{children}</span>
      <ArrowUpRight className="h-3.5 w-3.5 text-[var(--muted)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </>
  );

  if (href.startsWith("/")) {
    return (
      <motion.span
        className="inline-flex w-full sm:w-auto"
        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      >
        <Link href={href} className={className}>
          {content}
        </Link>
      </motion.span>
    );
  }

  return (
    <motion.a
      href={href}
      className={className}
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
    >
      {content}
    </motion.a>
  );
}

function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const portraitY = useTransform(scrollYProgress, [0, 0.42], [0, -42]);
  const copyY = useTransform(scrollYProgress, [0, 0.35], [0, 24]);

  return (
    <section
      id="top"
      className="section-shell relative grid items-center gap-10 pb-14 pt-24 sm:gap-12 sm:pb-16 sm:pt-28 md:min-h-[92svh] md:grid-cols-[minmax(0,0.96fr)_minmax(300px,0.62fr)] md:gap-14 md:pb-20 md:pt-32 lg:min-h-[100svh] lg:gap-20"
    >
      <motion.div
        className="relative z-10 max-w-[780px]"
        style={{ y: shouldReduceMotion ? 0 : copyY }}
      >
        <motion.p
          className="mb-5 max-w-[300px] text-[11px] font-semibold uppercase leading-[1.55] tracking-[0.16em] text-[var(--muted)] sm:mb-6 sm:max-w-none sm:text-[12px] sm:tracking-[0.18em]"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
        >
          {profile.name} · IIM Sirmaur MBA 2025-2027
        </motion.p>
        <HeadingReveal
          as="h1"
          lines={["From data systems", "to product and strategy."]}
          mobileLines={["From data", "systems to", "product and", "strategy."]}
          className="display-tight text-[clamp(2.65rem,11vw,4.8rem)] font-semibold leading-[0.98] text-[var(--foreground)] md:text-[clamp(3.35rem,7vw,6.25rem)] md:leading-[0.94]"
          delay={0.08}
        />

        <Reveal delay={0.08}>
          <p className="mt-6 max-w-[690px] text-[clamp(1.03rem,4.2vw,1.22rem)] leading-[1.58] text-[var(--muted-strong)] sm:mt-8 md:text-[clamp(1.1rem,2vw,1.48rem)] md:leading-[1.52]">
            Data Science Engineer in Bangalore and MBA candidate at IIM
            Sirmaur. I am building toward product, marketing, strategy, AI
            systems, retail learning, and business decision-making.
          </p>
        </Reveal>

        <Reveal delay={0.14}>
          <div className="mt-7 grid max-w-[420px] grid-cols-2 gap-2.5 sm:mt-9 sm:flex sm:max-w-none sm:flex-wrap sm:gap-3 [&>*:last-child]:col-span-2">
            <LinkButton
              href={`mailto:${profile.email}`}
              icon={<Mail className="h-4 w-4 text-[var(--sage)]" />}
            >
              Email
            </LinkButton>
            <LinkButton
              href={profile.instagram}
              icon={<Link2 className="h-4 w-4 text-[var(--steel)]" />}
            >
              Instagram
            </LinkButton>
            <LinkButton
              href="/archive"
              icon={<MoveRight className="h-4 w-4 text-[var(--clay)]" />}
            >
              View full archive
            </LinkButton>
          </div>
        </Reveal>
      </motion.div>

      <Reveal
        className="relative z-10 w-full justify-self-center md:justify-self-end"
        delay={0.12}
      >
        <motion.figure
          className="group relative mx-auto w-full max-w-[320px] sm:max-w-[380px] md:mx-0 md:max-w-[460px]"
          style={{ y: shouldReduceMotion ? 0 : portraitY }}
          whileHover={shouldReduceMotion ? undefined : { y: -6 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute -inset-5 rounded-[8px] bg-[linear-gradient(135deg,rgba(105,121,107,0.16),rgba(105,119,137,0.07)_44%,rgba(155,127,100,0.12))] blur-2xl" />
          <div className="portrait-mask soft-shadow relative overflow-hidden border border-black/10 bg-[var(--surface)] p-2">
            <motion.div
              className="relative aspect-[0.78] overflow-hidden bg-[var(--surface-cool)]"
              animate={shouldReduceMotion ? undefined : { scale: [1, 1.012, 1] }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Image
                src="/images/IMG_3146.jpg"
                alt={`Portrait of ${profile.name}`}
                fill
                priority
                sizes="(max-width: 768px) 90vw, 42vw"
                className="object-cover object-[52%_54%] saturate-[0.86] contrast-[1.04] transition-transform duration-[1000ms] ease-[var(--ease)] group-hover:scale-[1.025]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_58%,rgba(17,19,19,0.28))]" />
            </motion.div>
            <figcaption className="grid gap-1 px-1 pb-1 pt-4 text-[12px] leading-[1.45] text-[var(--muted)] sm:grid-cols-[1fr_auto] sm:gap-4">
              <span>Data science · MBA · Product/strategy</span>
              <span>{profile.location}</span>
            </figcaption>
          </div>
          <div className="absolute -bottom-7 left-5 right-5 hidden h-px bg-gradient-to-r from-transparent via-black/20 to-transparent md:block" />
        </motion.figure>
      </Reveal>

      <div className="noise-layer" />
      <div className="absolute bottom-0 left-0 right-0 h-px hairline" />
    </section>
  );
}

function Thesis() {
  return (
    <section id="thesis" className="section-shell scroll-mt-28 py-20 md:py-36">
      <div className="grid gap-10 md:grid-cols-[0.72fr_1.08fr] md:gap-16 lg:gap-24">
        <Reveal>
          <SectionLabel>Thesis</SectionLabel>
          <HeadingReveal
            lines={["From building systems", "to understanding decisions."]}
            mobileLines={[
              "From building",
              "systems to",
              "understanding",
              "decisions.",
            ]}
            className="max-w-[560px] text-[clamp(2rem,9.3vw,3.25rem)] font-semibold leading-[1.03] tracking-[-0.01em] md:text-[clamp(2.1rem,5.1vw,4.75rem)] md:leading-[0.99]"
          />
        </Reveal>

        <div>
          <Reveal>
            <p className="max-w-[740px] text-[clamp(1.16rem,5vw,1.45rem)] leading-[1.32] text-[var(--foreground)] md:text-[clamp(1.2rem,2.3vw,2.05rem)] md:leading-[1.2]">
              My first professional chapter has been hands-on: search, RAG,
              OCR, scraping, prediction, anomaly detection, dashboards, and
              production optimization. The MBA chapter is helping me connect
              those systems to product choices, market signals, and business
              outcomes.
            </p>
          </Reveal>

          <div className="mt-9 divide-y divide-black/10 border-y border-black/10 md:mt-12">
            {thesisPoints.map((pillar, index) => (
              <Reveal key={pillar.label} delay={index * 0.05}>
                <div className="grid gap-4 py-6 sm:grid-cols-[96px_1fr]">
                  <span className="font-mono text-[12px] text-[var(--muted)]">
                    {pillar.label}
                  </span>
                  <p className="text-[clamp(1.02rem,1.6vw,1.22rem)] leading-[1.52] text-[var(--muted-strong)]">
                    {pillar.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Background() {
  return (
    <section
      id="background"
      className="dark-transition scroll-mt-28 py-20 text-[var(--surface)] md:py-40"
    >
      <div className="section-shell">
        <div className="grid gap-12 md:grid-cols-[0.9fr_1fr] md:items-end md:gap-16 lg:gap-24">
          <Reveal>
            <SectionLabel>Background</SectionLabel>
            <HeadingReveal
              lines={["CSE foundation,", "applied systems work,", "and an MBA lens."]}
              mobileLines={[
                "CSE foundation,",
                "applied systems",
                "work,",
                "and an MBA lens.",
              ]}
              className="max-w-[700px] text-[clamp(2.05rem,9.4vw,3.45rem)] font-semibold leading-[1.03] tracking-[-0.01em] md:text-[clamp(2.25rem,5.55vw,5.2rem)] md:leading-[0.98]"
            />
          </Reveal>

          <Reveal delay={0.08}>
            <p className="max-w-[660px] text-[clamp(1.03rem,1.72vw,1.24rem)] leading-[1.65] text-[var(--deep-muted)]">
              I studied Computer Science and Engineering at VIT Vellore, then
              moved into applied data, automation, and AI systems work. At
              BigHaat, I worked across order behavior, content workflows,
              logistics, pricing intelligence, and decision-support systems. At
              IIM Sirmaur, I am adding a business-school lens to what should be
              built, who it serves, how it grows, and how it changes decisions.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-3 md:mt-24 md:grid-cols-2 xl:grid-cols-4">
          {backgroundCards.map((item, index) => (
            <Reveal key={item.label} delay={index * 0.05}>
              <div className="min-h-[190px] rounded-[8px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur">
                <p className="mb-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">
                  {item.label}
                </p>
                <p className="text-[1.28rem] leading-[1.28] text-white/88">
                  {item.value}
                </p>
                <p className="mt-4 text-[0.9rem] leading-[1.5] text-white/50">
                  {item.detail}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 grid gap-6 border-t border-white/10 pt-8 lg:grid-cols-[0.8fr_1fr]">
          <Reveal>
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">
                Grounded markers
              </p>
              <div className="grid gap-3 text-[0.95rem] leading-[1.5] text-white/64 sm:grid-cols-2">
                {credibilityMarkers.map((marker) => (
                  <p key={marker}>{marker}</p>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">
                Working toolkit
              </p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-[8px] border border-white/10 px-2.5 py-1 text-[12px] text-white/62"
                  >
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

function ArchivePreview() {
  return (
    <section id="archive" className="section-shell scroll-mt-28 py-20 md:py-36">
      <div className="mb-10 grid gap-8 md:mb-14 md:grid-cols-[0.72fr_1fr] md:gap-16">
        <Reveal>
          <SectionLabel>Selected archive</SectionLabel>
          <HeadingReveal
            lines={["Applied systems,", "business signals,", "and evolving MBA work."]}
            mobileLines={[
              "Applied systems,",
              "business signals,",
              "and evolving",
              "MBA work.",
            ]}
            className="text-[clamp(2.05rem,9.2vw,3.35rem)] font-semibold leading-[1.03] tracking-[-0.01em] md:text-[clamp(2.25rem,5.25vw,4.95rem)] md:leading-[0.99]"
          />
        </Reveal>
        <Reveal delay={0.08}>
          <div className="max-w-[700px]">
            <p className="text-[clamp(1.04rem,1.68vw,1.22rem)] leading-[1.64] text-[var(--muted-strong)]">
              A preview of the full archive: AI-assisted discovery, document
              workflows, market intelligence, retail learning, and MBA case
              notes. The full archive is structured so each item can grow into
              a deeper case study.
            </p>
            <Link
              href="/archive"
              className="mt-6 inline-flex items-center gap-2 text-[0.95rem] font-medium text-[var(--foreground)]"
            >
              View full archive
              <ArrowUpRight className="h-4 w-4 text-[var(--muted)]" />
            </Link>
          </div>
        </Reveal>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {homepageProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} compact />
        ))}
      </div>
    </section>
  );
}

function Journal() {
  return (
    <section
      id="journal"
      className="section-shell scroll-mt-28 border-y border-black/10 py-20 md:py-32"
    >
      <div className="mb-10 grid gap-8 md:mb-12 md:grid-cols-[0.82fr_1fr] md:items-end md:gap-16">
        <Reveal>
          <SectionLabel>Journal</SectionLabel>
          <HeadingReveal
            lines={["Notes I want to turn", "into public thinking."]}
            mobileLines={["Notes I want", "to turn into", "public thinking."]}
            className="max-w-[640px] text-[clamp(2.05rem,9vw,3.3rem)] font-semibold leading-[1.03] tracking-[-0.01em] md:text-[clamp(2.2rem,5vw,4.7rem)] md:leading-[0.99]"
          />
        </Reveal>
        <Reveal delay={0.08}>
          <p className="max-w-[640px] text-[clamp(1.04rem,1.65vw,1.2rem)] leading-[1.64] text-[var(--muted-strong)]">
            This section is intentionally modest for now. It will grow from
            work I have actually done and questions I am studying: product,
            marketing, AI systems, retail, and consumer behavior.
          </p>
        </Reveal>
      </div>

      <div className="divide-y divide-black/10 border-y border-black/10">
        {journalItems.map((item, index) => (
          <Reveal key={item.title} delay={index * 0.04}>
            <article className="grid gap-4 py-6 md:grid-cols-[160px_1fr_32px] md:items-start md:gap-10 md:py-7">
              <span className="text-[12px] font-medium text-[var(--sage)]">
                {item.label}
              </span>
              <div>
                <h3 className="text-[clamp(1.32rem,2.25vw,2.1rem)] font-semibold leading-[1.1] tracking-[-0.01em]">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-[780px] text-[0.98rem] leading-[1.64] text-[var(--muted)]">
                  {item.description}
                </p>
              </div>
              <ArrowUpRight className="hidden h-4 w-4 text-[var(--muted)] md:block" />
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <Thesis />
        <Background />
        <ArchivePreview />
        <Journal />
      </main>
      <Footer />
    </>
  );
}
