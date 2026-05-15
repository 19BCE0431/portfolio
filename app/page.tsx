"use client";

import { ArrowUpRight, Link2, Mail, MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  type MotionValue,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef, useState, type ReactNode } from "react";
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
    "group relative inline-flex min-h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-[8px] border border-black/10 bg-white/54 px-3.5 py-2.5 text-[13px] font-medium text-[var(--foreground)] shadow-[0_10px_32px_rgba(17,19,19,0.05)] backdrop-blur transition-colors duration-300 hover:border-black/20 hover:bg-white sm:min-h-0 sm:w-auto sm:justify-start sm:py-2";
  const content = (
    <>
      <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.72),transparent)] transition-transform duration-700 group-hover:translate-x-full" />
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

function HeroField({ progress }: { progress: MotionValue<number> }) {
  const shouldReduceMotion = useReducedMotion();
  const y = useTransform(progress, [0, 0.42], [0, 58]);
  const scale = useTransform(progress, [0, 0.45], [1, 1.08]);
  const opacity = useTransform(progress, [0, 0.5], [0.95, 0.42]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-[-12vw] top-0 h-[74svh] overflow-hidden"
      style={shouldReduceMotion ? undefined : { y, scale, opacity }}
    >
      <div className="premium-grid absolute left-[4vw] top-24 h-[420px] w-[min(760px,82vw)] opacity-[0.12] [mask-image:radial-gradient(circle_at_35%_35%,black,transparent_68%)]" />
      <motion.div
        className="orbital-line right-[4vw] top-28 hidden h-[360px] w-[520px] sm:block"
        animate={shouldReduceMotion ? undefined : { rotate: [-18, -12, -18] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="orbital-line right-[9vw] top-44 hidden h-[230px] w-[370px] sm:block"
        animate={shouldReduceMotion ? undefined : { rotate: [-8, -16, -8] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="motion-line left-[10vw] top-[58%] hidden w-[38vw] sm:block"
        initial={shouldReduceMotion ? false : { scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1.1, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
      />
      <div className="absolute right-[12vw] top-[22%] hidden h-2 w-2 rounded-full bg-[var(--sage)] shadow-[0_0_42px_rgba(105,121,107,0.45)] sm:block" />
      <div className="absolute right-[28vw] top-[42%] hidden h-1.5 w-1.5 rounded-full bg-[var(--steel)] opacity-70 sm:block" />
    </motion.div>
  );
}

function ScrollStoryCard({
  point,
  index,
  progress,
}: {
  point: (typeof thesisPoints)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const shouldReduceMotion = useReducedMotion();
  const start = Math.max(0, index * 0.22);
  const middle = start + 0.18;
  const end = start + 0.38;
  const opacity = useTransform(progress, [start, middle, end], [0.42, 1, 0.56]);
  const scale = useTransform(progress, [start, middle, end], [0.96, 1, 0.98]);
  const y = useTransform(progress, [start, middle, end], [18, 0, -10]);

  return (
    <motion.article
      className="premium-card-shadow rounded-[8px] border border-black/10 bg-[rgba(251,251,248,0.72)] p-5 backdrop-blur-xl md:p-6"
      style={shouldReduceMotion ? undefined : { opacity, scale, y }}
    >
      <p className="font-mono text-[12px] text-[var(--sage)]">
        0{index + 1} / {point.label}
      </p>
      <p className="mt-4 text-[clamp(1rem,1.5vw,1.18rem)] leading-[1.55] text-[var(--muted-strong)]">
        {point.text}
      </p>
    </motion.article>
  );
}

function ScrollStory() {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 72%", "end 26%"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0.08, 1]);

  return (
    <section
      ref={sectionRef}
      className="section-shell relative scroll-mt-28 py-16 md:py-28"
    >
      <div className="absolute inset-x-0 top-0 h-px hairline" />
      <div className="grid gap-8 md:grid-cols-[0.62fr_1fr] md:gap-16">
        <div className="md:sticky md:top-32 md:h-max">
          <SectionLabel>Progression</SectionLabel>
          <h2 className="max-w-[520px] text-[clamp(1.9rem,7vw,3.7rem)] font-semibold leading-[1.02] tracking-[0]">
            Technical work, business judgment, customer context.
          </h2>
          <div className="mt-7 h-px overflow-hidden bg-black/10">
            <motion.div
              className="h-full origin-left bg-[var(--foreground)]"
              style={shouldReduceMotion ? undefined : { scaleX: lineScale }}
            />
          </div>
        </div>

        <div className="grid gap-4">
          {thesisPoints.map((point, index) => (
            <ScrollStoryCard
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

function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const portraitY = useTransform(scrollYProgress, [0, 0.42], [0, -42]);
  const copyY = useTransform(scrollYProgress, [0, 0.35], [0, 24]);
  const [portraitMissing, setPortraitMissing] = useState(false);

  return (
    <section
      id="top"
      className="section-shell relative grid items-center gap-8 pb-12 pt-22 sm:gap-12 sm:pb-16 sm:pt-28 md:min-h-[92svh] md:grid-cols-[minmax(0,0.96fr)_minmax(300px,0.62fr)] md:gap-14 md:pb-20 md:pt-32 lg:min-h-[100svh] lg:gap-20"
    >
      <HeroField progress={scrollYProgress} />
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
          lines={["From data science execution to", "business decision-making"]}
          mobileLines={[
            "Data science",
            "execution,",
            "business",
            "decisions.",
          ]}
          className="display-tight text-[clamp(2.25rem,10.6vw,4.8rem)] font-semibold leading-[1.02] text-[var(--foreground)] sm:leading-[0.98] md:text-[clamp(3.35rem,7vw,6.25rem)] md:leading-[0.94]"
          delay={0.08}
        />

        <Reveal delay={0.08}>
          <p className="mt-5 max-w-[690px] text-[clamp(1rem,4.05vw,1.22rem)] leading-[1.58] text-[var(--muted-strong)] sm:mt-8 md:text-[clamp(1.1rem,2vw,1.48rem)] md:leading-[1.52]">
            Technology-trained MBA candidate at IIM Sirmaur, with a Computer
            Science foundation from VIT Vellore and hands-on Data Science
            Engineer experience. I am now building toward product management,
            marketing, strategy, consumer behavior, and decisions that connect
            analysis to action.
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
              href="#contact"
              icon={<Link2 className="h-4 w-4 text-[var(--steel)]" />}
            >
              Contact
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
          className="group relative mx-auto w-full max-w-[250px] min-[390px]:max-w-[272px] sm:max-w-[360px] md:mx-0 md:max-w-[430px]"
          style={{ y: shouldReduceMotion ? 0 : portraitY }}
          whileHover={shouldReduceMotion ? undefined : { y: -6 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute -inset-4 rounded-[8px] bg-[linear-gradient(135deg,rgba(105,121,107,0.13),rgba(105,119,137,0.06)_48%,rgba(155,127,100,0.1))] blur-2xl" />
          <div className="portrait-frame soft-shadow relative overflow-hidden border border-black/10 bg-[var(--surface)] p-2">
            <motion.div
              className="relative aspect-[4/5] overflow-hidden bg-[var(--surface-cool)]"
              animate={shouldReduceMotion ? undefined : { scale: [1, 1.012, 1] }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {portraitMissing ? (
                <div
                  role="img"
                  aria-label={profile.portraitAlt}
                  className="grid h-full place-items-center bg-[linear-gradient(145deg,rgba(239,241,239,1),rgba(251,251,248,1))] px-8 text-center"
                >
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      Portrait
                    </p>
                    <p className="mt-3 text-[1.08rem] font-semibold leading-[1.25] text-[var(--foreground)]">
                      {profile.shortName}
                    </p>
                    <p className="mt-2 text-[0.88rem] leading-[1.5] text-[var(--muted)]">
                      Replace `public/images/profile.jpg` with a professional
                      portrait.
                    </p>
                  </div>
                </div>
              ) : (
                <Image
                  src={profile.portrait}
                  alt={profile.portraitAlt}
                  fill
                  priority
                  sizes="(max-width: 640px) 72vw, (max-width: 768px) 42vw, 34vw"
                  onError={() => setPortraitMissing(true)}
                  className="object-cover object-[52%_34%] saturate-[0.9] contrast-[1.03] transition-transform duration-[1000ms] ease-[var(--ease)] group-hover:scale-[1.018]"
                />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_58%,rgba(17,19,19,0.28))]" />
            </motion.div>
            <figcaption className="grid gap-1 px-1 pb-1 pt-4 text-[12px] leading-[1.45] text-[var(--muted)] sm:grid-cols-[1fr_auto] sm:gap-4">
              <span>Data Science · MBA · Product/strategy</span>
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
            lines={[
              "From models and automation",
              "to the decisions they support.",
            ]}
            mobileLines={[
              "From models",
              "and automation",
              "to the decisions",
              "they support.",
            ]}
            className="max-w-[560px] text-[clamp(2rem,9.3vw,3.25rem)] font-semibold leading-[1.03] tracking-[-0.01em] md:text-[clamp(2.1rem,5.1vw,4.75rem)] md:leading-[0.99]"
          />
        </Reveal>

        <div>
          <Reveal>
            <p className="max-w-[740px] text-[clamp(1.16rem,5vw,1.45rem)] leading-[1.32] text-[var(--foreground)] md:text-[clamp(1.2rem,2.3vw,2.05rem)] md:leading-[1.2]">
              My first professional chapter was hands-on: building models,
              automation flows, document intelligence, image-led discovery,
              pricing dashboards, and alerts. The MBA chapter is helping me
              look beyond the build: what decision is being improved, who uses
              it, what trade-offs matter, and how value is measured.
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
  const shouldReduceMotion = useReducedMotion();

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
              lines={[
                "CSE foundation,",
                " data science work,",
                " and an MBA lens.",
              ]}
              mobileLines={[
                "CSE foundation,",
                " data science",
                " and an MBA lens.",
              ]}
              className="max-w-[700px] text-[clamp(2.05rem,9.4vw,3.45rem)] font-semibold leading-[1.03] tracking-[-0.01em] md:text-[clamp(2.25rem,5.55vw,5.2rem)] md:leading-[0.98]"
            />
          </Reveal>

          <Reveal delay={0.08}>
            <p className="max-w-[660px] text-[clamp(1.03rem,1.72vw,1.24rem)] leading-[1.65] text-[var(--deep-muted)]">
              I studied Computer Science and Engineering at VIT Vellore, then
              moved into Data Science and Applied AI work in Bangalore. At
              BigHaat, I worked across order behavior, content workflows,
              logistics, pricing intelligence, and internal decision support.
              At IIM Sirmaur, I am adding a business-school lens to what should
              be built, who it serves, how it is adopted, and what decisions it
              changes.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-3 md:mt-24 md:grid-cols-2 xl:grid-cols-4">
          {backgroundCards.map((item, index) => (
            <Reveal key={item.label} delay={index * 0.05}>
              <motion.div
                className="group relative min-h-[190px] overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur transition-colors duration-500 hover:bg-white/[0.055]"
                whileHover={shouldReduceMotion ? undefined : { y: -5 }}
                transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="pointer-events-none absolute inset-x-6 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-500 group-hover:scale-x-100" />
                <p className="mb-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">
                  {item.label}
                </p>
                <p className="text-[1.28rem] leading-[1.28] text-white/88">
                  {item.value}
                </p>
                <p className="mt-4 text-[0.9rem] leading-[1.5] text-white/50">
                  {item.detail}
                </p>
              </motion.div>
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
    <section
      id="archive"
      className="section-shell relative scroll-mt-28 overflow-hidden py-20 md:py-36"
    >
      <div className="premium-grid pointer-events-none absolute right-0 top-20 h-[360px] w-[520px] opacity-[0.1] [mask-image:radial-gradient(circle,black,transparent_70%)]" />
      <div className="mb-10 grid gap-8 md:mb-14 md:grid-cols-[0.72fr_1fr] md:gap-16">
        <Reveal>
          <SectionLabel>Selected archive</SectionLabel>
          <HeadingReveal
            lines={[
              "Data Science work,",
              " business signals,",
              " and evolving MBA notes.",
            ]}
            mobileLines={[
              "Data Science",
              " business signals,",
              " and MBA notes.",
            ]}
            className="text-[clamp(2.05rem,9.2vw,3.35rem)] font-semibold leading-[1.03] tracking-[-0.01em] md:text-[clamp(2.25rem,5.25vw,4.95rem)] md:leading-[0.99]"
          />
        </Reveal>
        <Reveal delay={0.08}>
          <div className="max-w-[700px]">
            <p className="text-[clamp(1.04rem,1.68vw,1.22rem)] leading-[1.64] text-[var(--muted-strong)]">
              A preview of the full archive: AI-assisted discovery, document
              intelligence, automation, pricing insight, customer-behavior
              notes, and MBA case work. Each item is framed around the problem,
              the decision it supported, and what I learned from building it.
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
            marketing, Applied AI, retail, and consumer behavior.
          </p>
          <Link
            href="/journal"
            className="mt-6 inline-flex items-center gap-2 text-[0.95rem] font-medium text-[var(--foreground)]"
          >
            View journal foundation
            <ArrowUpRight className="h-4 w-4 text-[var(--muted)]" />
          </Link>
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
        <ScrollStory />
        <Background />
        <ArchivePreview />
        <Journal />
      </main>
      <Footer />
    </>
  );
}
