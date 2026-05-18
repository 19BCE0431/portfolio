"use client";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  ChevronRight,
  Mail,
  MoveRight,
  Route,
  Sparkles,
} from "lucide-react";
import {
  motion,
  type MotionValue,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Children,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { getProjectBySlug, homepageProjects } from "../data/archive";
import type { JournalPost } from "../data/journal";
import { mbaLifeImages, recognitionImages } from "../data/media";
import {
  backgroundCards,
  credibilityMarkers,
  directionNotes,
  heroMarkers,
  personalInterests,
  profile,
  readingShelf,
  systemNodes,
  thesisPoints,
  workingModes,
} from "../data/portfolio";
import { HeadingReveal } from "./HeadingReveal";
import { ProjectCard } from "./ProjectCard";
import { ProjectVisual } from "./ProjectVisual";
import { Reveal } from "./Reveal";
import { SectionLabel } from "./SectionLabel";

const premiumEase = [0.16, 1, 0.3, 1] as const;

const heroSignalCards = [
  {
    label: "Work signal",
    title: "Messy inputs into operating clarity",
    detail: "PDFs, prices, anomalies, pipelines",
  },
  {
    label: "MBA signal",
    title: "Markets, behavior, product judgment",
    detail: "Cases, consumers, strategy rooms",
  },
  {
    label: "Personal signal",
    title: "Retail memory meets AI workflows",
    detail: "CM Silks, BigHaat, journal notes",
  },
];

const bridgeMoments = [
  {
    label: "The thread",
    words: ["choice", "signals", "systems", "trust"],
  },
  {
    label: "Keep going",
    words: ["campus", "notes", "shelf", "life"],
  },
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function usePageScrollProgress() {
  const progress = useMotionValue(0);

  useEffect(() => {
    const update = () => {
      const range = Math.max(window.innerHeight * 1.35, 1);
      progress.set(clamp(window.scrollY / range));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [progress]);

  return progress;
}

function useElementScrollProgress(ref: RefObject<HTMLElement | null>) {
  const progress = useMotionValue(0);

  useEffect(() => {
    const update = () => {
      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const start = viewport * 0.82;
      const end = -rect.height * 0.18;
      progress.set(clamp((start - rect.top) / (start - end)));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [progress, ref]);

  return progress;
}

function ExperienceBackdrop() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 86,
    damping: 26,
    mass: 0.42,
  });
  const washY = useTransform(smoothProgress, [0, 1], ["-8%", "24%"]);
  const washOpacity = useTransform(smoothProgress, [0, 0.45, 1], [0.72, 0.42, 0.58]);

  return (
    <div className="experience-backdrop" aria-hidden="true">
      <motion.div
        className="experience-wash"
        style={shouldReduceMotion ? undefined : { y: washY, opacity: washOpacity }}
      />
      <motion.div
        className="experience-progress"
        style={shouldReduceMotion ? undefined : { scaleX: smoothProgress }}
      />
    </div>
  );
}

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
      ? "premium-link group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-white/12 bg-white/[0.08] px-4 py-2.5 text-[13px] font-medium text-white/88 shadow-[0_18px_48px_rgba(0,0,0,0.16)] transition hover:border-white/22 hover:bg-white/[0.12] focus:outline-none focus:ring-2 focus:ring-white/20 sm:w-auto"
      : "premium-link group hover-light inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-black/10 bg-[rgba(255,253,248,0.78)] px-4 py-2.5 text-[13px] font-medium text-[var(--foreground)] shadow-[0_18px_54px_rgba(16,18,18,0.06)] backdrop-blur transition hover:border-black/18 hover:bg-white focus:outline-none focus:ring-2 focus:ring-black/15 sm:w-auto";

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

function GlideDeck({
  children,
  ariaLabel,
  tone = "light",
  className = "",
  slideClassName = "",
}: {
  children: ReactNode;
  ariaLabel: string;
  tone?: "light" | "dark";
  className?: string;
  slideClassName?: string;
}) {
  const items = Children.toArray(children).filter(Boolean);
  const railRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  const updateActiveIndex = () => {
    if (frameRef.current !== null) return;

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      const rail = railRef.current;
      if (!rail) return;

      const railCenter = rail.scrollLeft + rail.clientWidth / 2;
      const nextIndex = Array.from(rail.children).reduce(
        (closest, child, index) => {
          const item = child as HTMLElement;
          const itemCenter = item.offsetLeft + item.offsetWidth / 2;
          const distance = Math.abs(itemCenter - railCenter);

          return distance < closest.distance ? { index, distance } : closest;
        },
        { index: 0, distance: Number.POSITIVE_INFINITY },
      ).index;

      setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
    });
  };

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const scrollToIndex = (index: number) => {
    const rail = railRef.current;
    const target = rail?.children[index] as HTMLElement | undefined;
    if (!rail || !target) return;

    rail.scrollTo({
      left: target.offsetLeft - rail.offsetLeft,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
    setActiveIndex(index);
  };

  const move = (direction: "previous" | "next") => {
    const nextIndex =
      direction === "next"
        ? Math.min(activeIndex + 1, items.length - 1)
        : Math.max(activeIndex - 1, 0);

    scrollToIndex(nextIndex);
  };

  if (items.length === 0) return null;

  return (
    <div
      className={`glide-deck ${tone === "dark" ? "glide-deck-dark" : ""} ${className}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              tone === "dark" ? "bg-white/52" : "bg-[var(--sage)]"
            }`}
            aria-hidden="true"
          />
          <span
            className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${
              tone === "dark" ? "text-white/48" : "text-[var(--muted)]"
            }`}
          >
            Swipe
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => move("previous")}
            aria-label={`Show previous item in ${ariaLabel}`}
            disabled={activeIndex === 0}
            className={`grid h-9 w-9 place-items-center rounded-[8px] border transition focus:outline-none focus:ring-2 ${
              tone === "dark"
                ? "border-white/10 bg-white/[0.055] text-white/68 hover:bg-white/[0.09] focus:ring-white/20 disabled:text-white/22"
                : "border-black/10 bg-white/55 text-[var(--foreground)] hover:bg-white focus:ring-black/15 disabled:text-black/22"
            }`}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => move("next")}
            aria-label={`Show next item in ${ariaLabel}`}
            disabled={activeIndex === items.length - 1}
            className={`grid h-9 w-9 place-items-center rounded-[8px] border transition focus:outline-none focus:ring-2 ${
              tone === "dark"
                ? "border-white/10 bg-white/[0.055] text-white/68 hover:bg-white/[0.09] focus:ring-white/20 disabled:text-white/22"
                : "border-black/10 bg-white/55 text-[var(--foreground)] hover:bg-white focus:ring-black/15 disabled:text-black/22"
            }`}
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="relative">
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute bottom-3 right-0 top-0 z-10 w-10 ${
            tone === "dark"
              ? "bg-gradient-to-l from-[rgba(13,15,16,0.92)] to-transparent"
              : "bg-gradient-to-l from-[rgba(244,245,241,0.95)] to-transparent"
          }`}
        />
        <div
          ref={railRef}
          className="glide-rail"
          role="region"
          aria-label={ariaLabel}
          tabIndex={0}
          onScroll={updateActiveIndex}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className={`glide-slide ${slideClassName}`}
              aria-label={`${index + 1} of ${items.length}`}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5" aria-label={`${ariaLabel} position`}>
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollToIndex(index)}
              aria-label={`Show item ${index + 1} of ${items.length}`}
              aria-current={activeIndex === index ? "true" : undefined}
              className={`grid h-7 min-w-7 place-items-center rounded-full focus:outline-none focus:ring-2 ${
                tone === "dark" ? "focus:ring-white/20" : "focus:ring-black/15"
              }`}
            >
              <span
                className={`block h-1.5 rounded-full transition-all ${
                  activeIndex === index
                    ? tone === "dark"
                      ? "w-6 bg-white/78"
                      : "w-6 bg-[var(--foreground)]"
                    : tone === "dark"
                      ? "w-1.5 bg-white/22 hover:bg-white/38"
                      : "w-1.5 bg-black/20 hover:bg-black/36"
                }`}
              />
            </button>
          ))}
        </div>
        <span
          className={`text-[11px] font-medium ${
            tone === "dark" ? "text-white/44" : "text-[var(--muted)]"
          }`}
        >
          {String(activeIndex + 1).padStart(2, "0")} /{" "}
          {String(items.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

function AmbientField({ progress }: { progress: MotionValue<number> }) {
  const shouldReduceMotion = useReducedMotion();
  const y = useTransform(progress, [0, 0.45], [0, 68]);
  const scale = useTransform(progress, [0, 0.45], [1, 1.05]);
  const opacity = useTransform(progress, [0, 0.45], [1, 0.45]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-[-10vw] top-0 h-[96svh] overflow-hidden"
      style={shouldReduceMotion ? undefined : { y, scale, opacity }}
    >
      <div className="premium-grid absolute left-[6vw] top-24 h-[520px] w-[min(860px,88vw)] opacity-[0.12] [mask-image:radial-gradient(circle_at_34%_32%,black,transparent_68%)]" />
      <motion.div
        className="orbital-line right-[4vw] top-24 hidden h-[420px] w-[640px] opacity-75 sm:block"
        animate={shouldReduceMotion ? undefined : { rotate: [-18, -10, -18] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="orbital-line right-[16vw] top-56 hidden h-[180px] w-[360px] opacity-75 md:block"
        animate={shouldReduceMotion ? undefined : { rotate: [8, -6, 8] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute right-[14vw] top-[32%] hidden h-2 w-2 rounded-full bg-[var(--sage)] shadow-[0_0_48px_rgba(104,121,109,0.45)] sm:block" />
      <div className="absolute right-[33vw] top-[48%] hidden h-1.5 w-1.5 rounded-full bg-[var(--steel)] opacity-70 sm:block" />
    </motion.div>
  );
}

function PortraitFrame({ compact = false }: { compact?: boolean }) {
  const [portraitMissing, setPortraitMissing] = useState(false);

  return (
    <div
      className={`relative overflow-hidden rounded-[8px] border border-black/10 bg-[var(--surface-cool)] ${
        compact ? "aspect-square" : "aspect-[4/5]"
      }`}
    >
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
          </div>
        </div>
      ) : (
        <Image
          src={profile.portrait}
          alt={profile.portraitAlt}
          fill
          priority={!compact}
          sizes={compact ? "92px" : "(max-width: 640px) 78vw, (max-width: 1024px) 42vw, 34vw"}
          onError={() => setPortraitMissing(true)}
          className="object-cover object-[52%_34%] saturate-[0.92] contrast-[1.04] transition-transform duration-[1100ms] ease-[var(--ease)] hover:scale-[1.018]"
        />
      )}
      {!compact && (
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_58%,rgba(16,18,18,0.28))]" />
      )}
    </div>
  );
}

function HeroVisual({ progress }: { progress: MotionValue<number> }) {
  const shouldReduceMotion = useReducedMotion();
  const portraitY = useTransform(progress, [0, 0.42], [0, -38]);

  return (
    <Reveal className="relative z-10 w-full justify-self-center lg:justify-self-end" delay={0.12}>
      <motion.div
        className="relative mx-auto w-full max-w-[330px] sm:max-w-[390px] lg:mx-0 lg:max-w-[430px]"
        style={{ y: shouldReduceMotion ? 0 : portraitY }}
      >
        <div className="absolute -inset-5 rounded-[8px] bg-[linear-gradient(135deg,rgba(104,121,109,0.14),rgba(104,119,137,0.06)_48%,rgba(154,127,99,0.12))] blur-2xl" />
        <HeroSignalStack progress={progress} />
        <motion.figure
          className="premium-panel motion-surface hero-portrait-card relative overflow-hidden p-2"
          whileHover={shouldReduceMotion ? undefined : { y: -5 }}
          transition={{ duration: 0.45, ease: premiumEase }}
        >
          <PortraitFrame />
          <figcaption className="grid gap-3 px-1 pb-1 pt-4 text-[12px] leading-[1.45] text-[var(--muted)]">
            {heroMarkers.map((marker) => (
              <div key={marker.label} className="flex items-center justify-between gap-4 border-t border-black/10 pt-2 first:border-t-0 first:pt-0">
                <span>{marker.label}</span>
                <span className="text-right text-[var(--muted-strong)]">
                  {marker.value}
                </span>
              </div>
            ))}
          </figcaption>
        </motion.figure>
      </motion.div>
    </Reveal>
  );
}

function HeroSignalStack({ progress }: { progress: MotionValue<number> }) {
  const shouldReduceMotion = useReducedMotion();
  const yOne = useTransform(progress, [0, 0.45], [0, -32]);
  const yTwo = useTransform(progress, [0, 0.45], [0, 24]);
  const rotate = useTransform(progress, [0, 0.45], [-4, 1.5]);

  return (
    <div className="hero-signal-stack" aria-hidden="true">
      {heroSignalCards.map((card, index) => (
        <motion.div
          key={card.label}
          className={`hero-signal-card hero-signal-card-${index + 1}`}
          style={
            shouldReduceMotion
              ? undefined
              : {
                  y: index === 1 ? yTwo : yOne,
                  rotate: index === 2 ? rotate : undefined,
                }
          }
        >
          <span>{card.label}</span>
          <strong>{card.title}</strong>
          <small>{card.detail}</small>
        </motion.div>
      ))}
    </div>
  );
}

function MobilePortraitStrip() {
  return (
    <Reveal className="mt-6 lg:hidden" delay={0.2}>
      <div className="editorial-panel grid grid-cols-[82px_1fr] items-center gap-4 overflow-hidden p-2.5">
        <PortraitFrame compact />
        <div className="min-w-0">
          <p className="text-[0.96rem] font-semibold leading-[1.25]">
            {profile.shortName}
          </p>
          <p className="mt-1 text-[0.8rem] leading-[1.45] text-[var(--muted)]">
            IIM Sirmaur MBA · Product, markets, behavior, AI workflows
          </p>
        </div>
      </div>
    </Reveal>
  );
}

function QuietScrollCue() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 md:block"
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 0.72 }}
      transition={{ delay: 1, duration: 0.6, ease: premiumEase }}
    >
      <span className="relative block h-11 w-px overflow-hidden bg-black/10">
        <motion.span
          className="absolute left-0 top-0 h-5 w-px bg-[var(--foreground)]"
          animate={shouldReduceMotion ? undefined : { y: [0, 28, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
    </motion.div>
  );
}

function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const scrollYProgress = usePageScrollProgress();
  const copyY = useTransform(scrollYProgress, [0, 0.35], [0, 20]);
  const kineticX = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);

  return (
    <section
      id="intro"
      className="hero-shell hero-stage relative grid min-h-[92svh] scroll-mt-28 items-center gap-8 overflow-hidden pb-10 pt-[5.75rem] md:min-h-[100svh] md:gap-10 md:pb-16 md:pt-28 lg:grid-cols-[minmax(0,0.96fr)_minmax(330px,0.46fr)] lg:gap-14"
    >
      <AmbientField progress={scrollYProgress} />
      <motion.div
        aria-hidden="true"
        className="hero-kinetic-rail"
        style={
          shouldReduceMotion
            ? undefined
            : { x: kineticX }
        }
      >
        Product strategy · Consumer behavior · AI workflows · Retail signals ·
      </motion.div>
      <motion.div
        className="hero-copy-stack relative z-10 max-w-[980px]"
        style={{ y: shouldReduceMotion ? 0 : copyY }}
      >
        <Reveal delay={0.02}>
          <div className="hero-badge-row mb-5 flex flex-wrap gap-2">
            {["MBA / Product", "AI workflows", "Indian markets"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </Reveal>
        <HeadingReveal
          as="h1"
          lines={["Builder roots.", "Business lens.", "Human choices."]}
          mobileLines={["Builder roots.", "Business lens.", "Human choices."]}
          className="display-tight hero-display max-w-[1040px] text-[clamp(2.75rem,12vw,4.15rem)] font-semibold leading-[0.94] text-[var(--foreground)] md:text-[clamp(4.15rem,6.35vw,7.15rem)] md:leading-[0.9]"
          delay={0.04}
        />
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-[800px] text-pretty-balance text-[clamp(1.06rem,4.2vw,1.32rem)] leading-[1.62] text-[var(--muted-strong)] md:mt-8 md:text-[clamp(1.18rem,2vw,1.5rem)] md:leading-[1.5]">
            <span className="md:hidden">
              I am an MBA candidate at IIM Sirmaur, shaped by data science,
              BigHaat systems, and a growing interest in how people choose.
            </span>
            <span className="hidden md:inline">
              I started with Computer Science and Data Science, then spent a
              year turning messy BigHaat workflows into signals, automations,
              and decision support. The MBA chapter is widening that work into
              product, marketing, strategy, consumer behavior, and AI-enabled
              systems that people can actually trust.
            </span>
          </p>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="mt-7 grid max-w-[560px] grid-cols-2 gap-2.5 sm:mt-9 sm:flex sm:max-w-none sm:flex-wrap sm:gap-3 [&>*:last-child]:col-span-2">
            <ActionLink href={`mailto:${profile.email}`} icon={<Mail className="h-4 w-4 text-[var(--sage)]" />}>
              Email
            </ActionLink>
            <ActionLink href="/#work" icon={<MoveRight className="h-4 w-4 text-[var(--steel)]" />}>
              See the work
            </ActionLink>
            <ActionLink href="/#personal" icon={<Sparkles className="h-4 w-4 text-[var(--clay)]" />}>
              Meet the human
            </ActionLink>
          </div>
        </Reveal>
        <MobilePortraitStrip />
        <Reveal delay={0.2}>
          <div className="mt-10 hidden gap-3 border-y border-black/10 py-5 sm:grid-cols-3 md:mt-14 md:grid">
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
      <div className="relative z-10 hidden lg:block">
        <HeroVisual progress={scrollYProgress} />
      </div>
      <div className="noise-layer" />
      <div className="absolute bottom-0 left-0 right-0 h-px hairline" />
      <QuietScrollCue />
    </section>
  );
}

function StoryBridge({
  label,
  words,
}: {
  label: string;
  words: string[];
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="section-shell scene-bridge" aria-label={label}>
      <div className="scene-bridge-inner">
        <span className="editorial-kicker">{label}</span>
        <div className="scene-word-row" aria-hidden="true">
          {words.map((word, index) => (
            <motion.span
              key={word}
              className="scene-word"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.65 }}
              transition={{ duration: 0.55, delay: index * 0.055, ease: premiumEase }}
            >
              {word}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}

function DirectionPoint({
  point,
  index,
  progress,
  className = "",
}: {
  point: (typeof thesisPoints)[number];
  index: number;
  progress: MotionValue<number>;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const start = Math.max(0, index * 0.22);
  const opacity = useTransform(progress, [start, start + 0.12, start + 0.42], [0.5, 1, 0.78]);
  const y = useTransform(progress, [start, start + 0.18, start + 0.42], [20, 0, -6]);

  return (
    <motion.article
      className={`premium-panel motion-surface p-5 md:p-7 ${className}`}
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

function DirectionNoteCard({
  note,
  index,
}: {
  note: (typeof directionNotes)[number];
  index: number;
}) {
  const Icon = note.icon;

  return (
    <article className="editorial-panel motion-surface hover-light group h-full min-h-[212px] p-5 transition duration-500 hover:-translate-y-1 hover:bg-white md:min-h-[220px] md:p-6">
      <div className="flex items-start justify-between gap-4">
        <Icon className="h-5 w-5 text-[var(--sage)]" />
        <span className="grid h-8 w-8 place-items-center rounded-full border border-black/10 text-[12px] text-[var(--sage)] transition group-hover:translate-x-1">
          0{index + 1}
        </span>
      </div>
      <p className="editorial-kicker mt-7">{note.title}</p>
      <p className="mt-4 text-[1.04rem] leading-[1.58] text-[var(--muted-strong)] md:text-[1.16rem]">
        {note.text}
      </p>
    </article>
  );
}

function Direction() {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const scrollYProgress = useElementScrollProgress(sectionRef);
  const lineScale = useTransform(scrollYProgress, [0, 1], [0.08, 1]);

  return (
    <section
      ref={sectionRef}
      id="direction"
      className="section-shell scene-section relative py-12 md:py-32"
    >
      <div className="absolute left-0 top-0 hidden h-full w-px vertical-hairline opacity-60 lg:block" />
      <div className="grid gap-12 lg:grid-cols-[0.72fr_1fr] lg:gap-18">
        <div className="lg:sticky lg:top-32 lg:h-max">
          <Reveal>
            <SectionLabel>Direction</SectionLabel>
            <HeadingReveal
              lines={["Less resume.", "More point of view."]}
              mobileLines={["Less resume.", "More point", "of view."]}
              className="max-w-[720px] text-[clamp(2.35rem,10vw,5.2rem)] font-semibold leading-[1] tracking-[0] md:leading-[0.94]"
            />
            <p className="mt-6 max-w-[650px] text-[1.02rem] leading-[1.7] text-[var(--muted-strong)] md:text-[1.14rem]">
              The old version would have been a list of tools. This version is
              closer to the truth: I like systems, but I am more interested in
              the decisions around them: who uses them, what changes, what earns
              trust, and where a market quietly reveals itself.
            </p>
            <div className="mt-8 h-px overflow-hidden bg-black/10">
              <motion.div
                className="h-full origin-left bg-[var(--foreground)]"
                style={shouldReduceMotion ? undefined : { scaleX: lineScale }}
              />
            </div>
          </Reveal>
        </div>

        <div className="min-w-0">
          <div className="min-w-0 overflow-hidden lg:hidden">
            <GlideDeck
              ariaLabel="Direction and point of view cards"
              slideClassName="glide-slide-wide"
            >
              {thesisPoints.map((point, index) => (
                <DirectionPoint
                  key={point.label}
                  point={point}
                  index={index}
                  progress={scrollYProgress}
                  className="min-h-[268px]"
                />
              ))}
              {directionNotes.map((note, index) => (
                <DirectionNoteCard
                  key={note.title}
                  note={note}
                  index={index}
                />
              ))}
            </GlideDeck>
          </div>

          <div className="hidden gap-3 lg:grid lg:gap-4">
            {thesisPoints.map((point, index) => (
              <DirectionPoint
                key={point.label}
                point={point}
                index={index}
                progress={scrollYProgress}
                className="h-full"
              />
            ))}
          </div>
          <div className="mt-4 hidden gap-3 lg:grid lg:grid-cols-2 lg:gap-4">
            {directionNotes.map((note, index) => (
              <Reveal
                key={note.title}
                delay={index * 0.04}
                className="h-full"
              >
                <DirectionNoteCard note={note} index={index} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BackgroundCard({
  item,
  index,
}: {
  item: (typeof backgroundCards)[number];
  index: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const Icon = item.icon;
  const wide = index === 0 || index === 1;

  return (
    <Reveal
      delay={index * 0.035}
      className={`${wide ? "lg:col-span-3" : "lg:col-span-3 xl:col-span-2"} h-full`}
    >
      <motion.article
        className="dark-panel motion-surface group flex min-h-[218px] flex-col justify-between overflow-hidden p-5 md:min-h-[230px] md:p-6"
        whileHover={shouldReduceMotion ? undefined : { y: -5 }}
        transition={{ duration: 0.34, ease: premiumEase }}
      >
        <div className="flex items-start justify-between gap-5">
          <p className="editorial-kicker text-white/42">
            {item.label}
          </p>
          <Icon className="h-5 w-5 shrink-0 text-white/42 transition group-hover:text-white/72" />
        </div>
        <div>
          <p className="mt-8 text-[1.35rem] leading-[1.18] text-white/92 md:text-[1.65rem]">
            {item.value}
          </p>
          <p className="mt-4 text-[0.92rem] leading-[1.55] text-white/54">
            {item.detail}
          </p>
        </div>
      </motion.article>
    </Reveal>
  );
}

function Background() {
  return (
    <section id="background" className="dark-transition scene-section scene-section-dark scroll-mt-28 py-14 text-[var(--surface)] md:py-40">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1fr] lg:items-end lg:gap-20">
          <Reveal>
            <SectionLabel>Background</SectionLabel>
            <HeadingReveal
              lines={["The MBA is", "a wider lens."]}
              mobileLines={["The MBA is", "a wider lens."]}
              className="max-w-[820px] text-[clamp(2.35rem,10vw,5.4rem)] font-semibold leading-[1] tracking-[0] md:leading-[0.96]"
            />
          </Reveal>
          <Reveal delay={0.08}>
            <p className="max-w-[720px] text-pretty-balance text-[clamp(1.04rem,2vw,1.28rem)] leading-[1.68] text-[var(--deep-muted)]">
              I did not leave the builder side behind. I am learning to place
              it inside a bigger room: customers, categories, pricing,
              positioning, operations, and the behavior that decides whether a
              system matters.
            </p>
          </Reveal>
        </div>

        <div className="mt-8 min-w-0 overflow-hidden lg:hidden">
          <GlideDeck
            ariaLabel="MBA and background cards"
            tone="dark"
            slideClassName="glide-slide-wide"
          >
            {backgroundCards.map((item, index) => (
              <BackgroundCard key={item.label} item={item} index={index} />
            ))}
          </GlideDeck>
        </div>

        <div className="mt-8 hidden gap-3 lg:mt-20 lg:grid lg:grid-cols-6">
          {backgroundCards.map((item, index) => (
            <BackgroundCard key={item.label} item={item} index={index} />
          ))}
        </div>

        <div className="mt-8 grid gap-3 border-t border-white/10 pt-6 lg:hidden">
          <details className="dark-panel p-4">
            <summary className="cursor-pointer text-[12px] font-semibold uppercase tracking-[0.16em] text-white/58">
              Credibility markers
            </summary>
            <div className="mt-4 grid gap-3 text-[0.9rem] leading-[1.5] text-white/64">
              {credibilityMarkers.map((marker) => (
                <p key={marker}>{marker}</p>
              ))}
            </div>
          </details>
          <details className="dark-panel p-4">
            <summary className="cursor-pointer text-[12px] font-semibold uppercase tracking-[0.16em] text-white/58">
              Working modes
            </summary>
            <div className="mt-4 flex flex-wrap gap-2">
              {workingModes.map((mode, index) => (
                <span
                  key={mode}
                  className={`rounded-[8px] border px-2.5 py-1 text-[12px] ${
                    index < 8
                      ? "border-white/13 bg-white/[0.045] text-white/70"
                      : "border-white/8 text-white/42"
                  }`}
                >
                  {mode}
                </span>
              ))}
            </div>
          </details>
        </div>

        <div className="mt-10 hidden gap-7 border-t border-white/10 pt-8 lg:grid lg:grid-cols-[0.74fr_1fr]">
          <Reveal>
            <div>
              <p className="editorial-kicker text-white/42">Credibility markers</p>
              <div className="mt-5 grid gap-3 text-[0.95rem] leading-[1.5] text-white/64 sm:grid-cols-2">
                {credibilityMarkers.map((marker) => (
                  <p key={marker}>{marker}</p>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div>
              <p className="editorial-kicker text-white/42">Working modes</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {workingModes.map((mode, index) => (
                  <span
                    key={mode}
                    className={`rounded-[8px] border px-2.5 py-1 text-[12px] ${
                      index < 8
                        ? "border-white/13 bg-white/[0.045] text-white/70"
                        : "border-white/8 text-white/42"
                    }`}
                  >
                    {mode}
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
  const selectedProjects = homepageProjects
    .filter((project) => project.slug !== "living-ai-portfolio-system")
    .slice(0, 4);

  return (
    <section
      id="work"
      className="section-shell scene-section relative overflow-hidden py-12 md:py-36"
    >
      <div className="premium-grid pointer-events-none absolute right-0 top-24 h-[360px] w-[520px] opacity-[0.1] [mask-image:radial-gradient(circle,black,transparent_70%)]" />
      <div className="mb-10 grid gap-8 md:mb-14 lg:grid-cols-[0.72fr_1fr] lg:gap-16">
        <Reveal>
          <SectionLabel>Selected work</SectionLabel>
          <HeadingReveal
            lines={["Proof, not just", "project cards."]}
            mobileLines={["Proof,", "not just", "project cards."]}
            className="max-w-[720px] text-[clamp(2.35rem,10vw,5.1rem)] font-semibold leading-[1] tracking-[0] md:leading-[0.96]"
          />
        </Reveal>
        <Reveal delay={0.08}>
          <div className="max-w-[720px]">
            <p className="text-[clamp(1.02rem,1.7vw,1.22rem)] leading-[1.68] text-[var(--muted-strong)]">
              The strongest work here comes from real friction: PDFs that
              slowed teams down, competitor prices that needed watching, order
              drops that needed early signals, and AI flows that had to earn
              their place in a working business.
            </p>
            <Link
              href="/archive"
              className="interactive-underline mt-6 inline-flex items-center gap-2 text-[0.95rem] font-medium text-[var(--foreground)]"
            >
              View full project library
              <ArrowUpRight className="h-4 w-4 text-[var(--muted)]" />
            </Link>
          </div>
        </Reveal>
      </div>

      <div className="min-w-0 overflow-hidden lg:hidden">
        <GlideDeck
          ariaLabel="Selected work cards"
          slideClassName="glide-slide-project"
        >
          {selectedProjects.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              compact
              priority={index === 0}
            />
          ))}
        </GlideDeck>
      </div>

      <div className="hidden gap-4 lg:grid lg:grid-cols-6">
        {selectedProjects.map((project, index) => (
          <div
            key={project.slug}
            className={`min-w-0 ${
              index < 2 ? "lg:col-span-3" : "lg:col-span-3 xl:col-span-2"
            } ${index === 2 ? "xl:col-start-2" : ""}`}
          >
            <ProjectCard project={project} compact={index > 1} priority={index === 0} />
          </div>
        ))}
      </div>
    </section>
  );
}

function SystemNodeCard({
  node,
  index,
}: {
  node: (typeof systemNodes)[number];
  index: number;
}) {
  const Icon = node.icon;

  return (
    <article className="editorial-panel motion-surface hover-light group relative h-full min-h-[192px] overflow-hidden p-5 md:min-h-[190px] md:p-6">
      <div className="flex items-start justify-between gap-4">
        <Icon className="h-5 w-5 text-[var(--sage)]" />
        <span className="grid h-8 w-8 place-items-center rounded-full border border-black/10 text-[12px] text-[var(--sage)] transition group-hover:translate-x-1">
          0{index + 1}
        </span>
      </div>
      <h3 className="mt-7 text-[1.18rem] font-semibold leading-[1.2]">
        {node.title}
      </h3>
      <p className="mt-3 text-[0.92rem] leading-[1.6] text-[var(--muted)]">
        {node.text}
      </p>
    </article>
  );
}

function FeaturedSystem() {
  const project = getProjectBySlug("living-ai-portfolio-system");

  if (!project) return null;

  return (
    <section id="system" className="section-shell scene-section relative py-12 md:py-36">
      <div className="absolute left-0 top-10 hidden h-px w-1/2 bg-gradient-to-r from-black/20 to-transparent md:block" />
      <div className="grid gap-7 lg:grid-cols-[0.78fr_1fr] lg:items-stretch lg:gap-6">
        <Reveal>
          <article className="editorial-panel motion-surface hover-light relative flex h-full min-h-[350px] flex-col justify-between overflow-hidden p-5 md:min-h-[520px] md:p-8">
            <div className="signal-grid pointer-events-none absolute inset-0 opacity-[0.12]" />
            <div className="relative z-10">
              <SectionLabel>Living AI Portfolio System</SectionLabel>
              <HeadingReveal
                lines={["A portfolio that", "keeps working."]}
                mobileLines={["A portfolio", "that keeps", "working."]}
                className="max-w-[680px] text-[clamp(2.35rem,10vw,5.3rem)] font-semibold leading-[0.98] tracking-[0]"
              />
              <p className="mt-6 max-w-[640px] text-[1rem] leading-[1.68] text-[var(--muted-strong)] md:text-[1.15rem]">
                This site is also a product experiment: AI-assisted, reviewed
                by me, and designed to keep proof, notes, drafts, analytics,
                and future MBA work from becoming scattered.
              </p>
            </div>
            <div className="relative z-10 mt-8">
              <ActionLink href={`/archive/${project.slug}`} icon={<Route className="h-4 w-4 text-[var(--sage)]" />}>
                Read the system case
              </ActionLink>
            </div>
          </article>
        </Reveal>

        <Reveal delay={0.08} className="min-w-0">
          <div className="grid h-full min-w-0 gap-3">
            <article className="editorial-panel motion-surface overflow-hidden p-3 sm:col-span-2">
              <ProjectVisual project={project} />
            </article>
            <div className="min-w-0 overflow-hidden lg:hidden">
              <GlideDeck
                ariaLabel="System node cards"
                slideClassName="glide-slide-wide"
              >
                {systemNodes.map((node, index) => (
                  <SystemNodeCard key={node.title} node={node} index={index} />
                ))}
              </GlideDeck>
            </div>
            <div className="hidden gap-3 lg:grid lg:grid-cols-2">
              {systemNodes.map((node, index) => (
                <SystemNodeCard key={node.title} node={node} index={index} />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function RecognitionSection() {
  const recognition = recognitionImages[0];

  return (
    <section
      id="recognition"
      className="section-shell scene-section relative py-12 md:py-32"
    >
      <div className="grid gap-12 lg:grid-cols-[0.72fr_1fr] lg:gap-16">
        <Reveal>
          <div className="lg:sticky lg:top-32">
            <SectionLabel>Recognition</SectionLabel>
            <HeadingReveal
              lines={["Small wins,", "real signals."]}
              mobileLines={["Small wins,", "real signals."]}
              className="max-w-[720px] text-[clamp(2.35rem,10vw,5rem)] font-semibold leading-[1] tracking-[0] md:leading-[0.96]"
            />
            <p className="mt-6 max-w-[650px] text-[1.02rem] leading-[1.7] text-[var(--muted-strong)] md:text-[1.16rem]">
              An early campus signal: Top 10 in the Iconic Quiz conducted by
              iimjobs.com and Markezen at IIM Sirmaur. I keep it here as quiet
              proof that sharper rooms make the thinking sharper too.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <article className="editorial-panel motion-surface overflow-hidden p-3 md:p-4">
            <div className="relative aspect-[1.08] overflow-hidden rounded-[6px] bg-[var(--surface-cool)] sm:aspect-[1.35]">
              <Image
                src={recognition.src}
                alt={recognition.alt}
                fill
                sizes="(max-width: 768px) 92vw, 52vw"
                className="media-lift object-cover transition-transform duration-[900ms] ease-[var(--ease)] hover:scale-[1.025]"
              />
            </div>
            <div className="grid gap-4 px-1 pb-1 pt-4 md:grid-cols-[1fr_auto] md:items-end">
              <p className="max-w-[640px] text-[0.95rem] leading-[1.58] text-[var(--muted-strong)]">
                {recognition.caption}
              </p>
              <span className="rounded-[8px] border border-black/10 bg-white/50 px-2.5 py-1 text-[12px] text-[var(--sage)]">
                Top 10
              </span>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}

function MbaImageCard({
  image,
  index,
}: {
  image: (typeof mbaLifeImages)[number];
  index: number;
}) {
  return (
    <article className="motion-surface group h-full overflow-hidden rounded-[8px] border border-black/10 bg-[rgba(255,253,248,0.68)] p-2 shadow-[0_28px_80px_rgba(16,18,18,0.07)] backdrop-blur">
      <div
        className={`relative overflow-hidden rounded-[6px] bg-[var(--surface-cool)] ${
          index === 0 ? "aspect-[1.35]" : "aspect-[4/5] md:aspect-[0.86]"
        }`}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={
            index === 0
              ? "(max-width: 768px) 82vw, 44vw"
              : "(max-width: 768px) 82vw, 22vw"
          }
          className="media-lift object-cover transition-transform duration-[900ms] ease-[var(--ease)] group-hover:scale-[1.035]"
        />
      </div>
      <p className="px-1 py-3 text-[0.86rem] leading-[1.5] text-[var(--muted)]">
        {image.caption}
      </p>
    </article>
  );
}

function MbaChapterSection() {
  return (
    <section id="mba-life" className="section-shell scene-section relative py-12 md:py-24">
      <div className="mb-10 grid gap-8 lg:grid-cols-[0.8fr_1fr] lg:items-end lg:gap-16">
        <Reveal>
          <SectionLabel>MBA chapter</SectionLabel>
          <HeadingReveal
            lines={["Inside the", "current chapter."]}
            mobileLines={["Inside the", "current chapter."]}
            className="max-w-[760px] text-[clamp(2.2rem,9vw,4.7rem)] font-semibold leading-[1] tracking-[0] md:leading-[0.96]"
          />
        </Reveal>
        <Reveal delay={0.08}>
          <p className="max-w-[700px] text-[clamp(1rem,1.65vw,1.18rem)] leading-[1.68] text-[var(--muted-strong)]">
            IIM Sirmaur is where the technical story is becoming a business
            story: cases, group rooms, consumer behavior, strategy debates, and
            the slower work of learning how decisions travel through people.
          </p>
        </Reveal>
      </div>

      <div className="min-w-0 overflow-hidden lg:hidden">
        <GlideDeck
          ariaLabel="MBA chapter image cards"
          slideClassName="glide-slide-photo"
        >
          {mbaLifeImages.map((image, index) => (
            <MbaImageCard key={image.src} image={image} index={index} />
          ))}
        </GlideDeck>
      </div>

      <div className="hidden gap-3 lg:grid lg:grid-cols-4">
        {mbaLifeImages.map((image, index) => (
          <Reveal
            key={image.src}
            delay={index * 0.04}
            className={`${index === 0 ? "sm:col-span-2 md:col-span-2" : ""} min-w-0`}
          >
            <MbaImageCard image={image} index={index} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function JournalPreview({ posts }: { posts: JournalPost[] }) {
  const hasPosts = posts.length > 0;

  return (
    <section
      id="journal"
      className="section-shell scene-section border-y border-black/10 py-12 md:py-32"
    >
      <div className="mb-10 grid gap-8 md:mb-12 lg:grid-cols-[0.82fr_1fr] lg:items-end lg:gap-16">
        <Reveal>
          <SectionLabel>Journal</SectionLabel>
          <HeadingReveal
            lines={["Notes before", "they become claims."]}
            mobileLines={["Notes before", "they become", "claims."]}
            className="max-w-[760px] text-[clamp(2.35rem,10vw,5rem)] font-semibold leading-[1] tracking-[0] md:leading-[0.96]"
          />
        </Reveal>
        <Reveal delay={0.08}>
          <p className="max-w-[680px] text-[clamp(1.02rem,1.65vw,1.2rem)] leading-[1.68] text-[var(--muted-strong)]">
            A place for observations that are still becoming arguments:
            products, market signals, AI workflows, consumer behavior, and MBA
            thinking. Drafts stay private until they earn the reader&apos;s time.
          </p>
          <Link
            href="/journal"
            className="interactive-underline mt-6 inline-flex items-center gap-2 text-[0.95rem] font-medium text-[var(--foreground)]"
          >
            {hasPosts ? "View insight library" : "View journal foundation"}
            <ArrowUpRight className="h-4 w-4 text-[var(--muted)]" />
          </Link>
        </Reveal>
      </div>

      <div className="divide-y divide-black/10 border-y border-black/10">
        {hasPosts ? (
          posts.map((post, index) => (
            <Reveal key={post.slug} delay={index * 0.04}>
              <Link
                href={`/journal/${post.slug}`}
                className="journal-row group grid gap-4 py-6 md:grid-cols-[170px_1fr_40px] md:items-start md:gap-10 md:py-8"
              >
                <span className="text-[12px] font-medium text-[var(--sage)]">
                  {post.category}
                </span>
                <div>
                  <h3 className="text-[clamp(1.34rem,2.25vw,2.2rem)] font-semibold leading-[1.08] tracking-[0]">
                    {post.title}
                  </h3>
                  <p className="mt-3 max-w-[820px] text-[0.98rem] leading-[1.64] text-[var(--muted)]">
                    {post.summary}
                  </p>
                  <p className="mt-3 text-[12px] text-[var(--muted)]">
                    {post.readingTime}
                  </p>
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
                  Long-form notes will appear here once they are reviewed.
                </p>
                <p className="mt-3 max-w-[680px] text-[0.98rem] leading-[1.64] text-[var(--muted)]">
                  The weekly insight system is ready for notes on products,
                  markets, AI, consumer behavior, and business decisions.
                </p>
              </div>
              <div className="premium-panel p-5">
                <p className="editorial-kicker">Publishing rule</p>
                <p className="mt-4 text-[0.98rem] leading-[1.6] text-[var(--muted-strong)]">
                  A draft can be fast. A public note should be clear, sourced,
                  and worth someone else&apos;s attention.
                </p>
              </div>
            </article>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function BookShelfCard({
  book,
  index,
}: {
  book: (typeof readingShelf)[number];
  index: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      className={`book-card book-card-${book.accent} motion-surface group flex h-full min-h-[360px] flex-col justify-between overflow-hidden rounded-[8px] border border-white/12 p-3 shadow-[0_26px_80px_rgba(16,18,18,0.08)] sm:p-4 md:min-h-[390px] lg:min-h-[410px]`}
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y: -7,
              rotateX: 1.4,
              rotateY: index % 2 === 0 ? -1.2 : 1.2,
            }
      }
      transition={{ duration: 0.34, ease: premiumEase }}
    >
      <span className="pointer-events-none absolute inset-y-4 left-3 w-px bg-white/16" />
      <span className="pointer-events-none absolute left-5 right-5 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-500 group-hover:scale-x-100" />
      <div>
        <div className="flex items-start justify-between gap-4">
          <span className="rounded-full border border-white/16 bg-white/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/68 backdrop-blur transition duration-300 group-hover:border-white/28 group-hover:bg-white/[0.12] group-hover:text-white/82">
            {book.mode}
          </span>
          <BookOpenText className="h-4 w-4 text-white/54" />
        </div>

        <div className="book-cover-art mt-5 rounded-[7px] border border-white/14 bg-white/[0.07] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
          <div className="book-cover-frame relative mx-auto aspect-[0.66] w-[68%] max-w-[128px] overflow-hidden rounded-[5px] border border-white/18 bg-black/20 shadow-[0_18px_44px_rgba(0,0,0,0.24)] md:w-[72%] md:max-w-[150px]">
            <Image
              src={book.coverSrc}
              alt={`${book.title} book cover`}
              fill
              sizes="(max-width: 640px) 160px, (max-width: 1024px) 140px, 120px"
              className="media-lift object-cover"
            />
          </div>
          <p className="mt-3 line-clamp-2 text-center text-[0.78rem] font-medium leading-[1.28] text-white/72">
            {book.author}
          </p>
        </div>
      </div>
      <p className="mt-4 line-clamp-4 border-t border-white/14 pt-3 text-[0.84rem] leading-[1.5] text-white/72 sm:text-[0.9rem]">
        {book.note}
      </p>
    </motion.article>
  );
}

function ReadingShelf() {
  return (
    <section id="personal" className="section-shell scene-section relative py-12 md:py-32">
      <div className="mb-10 grid gap-8 md:mb-14 lg:grid-cols-[0.76fr_1fr] lg:items-end lg:gap-16">
        <Reveal>
          <SectionLabel>Reading shelf</SectionLabel>
          <HeadingReveal
            lines={["What I keep", "coming back to."]}
            mobileLines={["What I keep", "coming back to."]}
            className="max-w-[760px] text-[clamp(2.35rem,10vw,5rem)] font-semibold leading-[1] tracking-[0] md:leading-[0.96]"
          />
        </Reveal>
        <Reveal delay={0.08}>
          <p className="max-w-[680px] text-[clamp(1.02rem,1.65vw,1.2rem)] leading-[1.68] text-[var(--muted-strong)]">
            Not a perfect canon. Just books I return to when I want to think
            about brands, leadership, ambition, choices, and the softer side of
            building a life around work.
          </p>
        </Reveal>
      </div>

      <div className="min-w-0 overflow-hidden lg:hidden">
        <GlideDeck
          ariaLabel="Reading shelf cards"
          tone="dark"
          slideClassName="glide-slide-book"
        >
          {readingShelf.map((book, index) => (
            <BookShelfCard key={book.title} book={book} index={index} />
          ))}
        </GlideDeck>
      </div>

      <div className="hidden gap-3 lg:grid lg:grid-cols-5 lg:gap-4">
        {readingShelf.map((book, index) => (
          <Reveal
            key={book.title}
            delay={index * 0.03}
            className="min-w-0"
          >
            <BookShelfCard book={book} index={index} />
          </Reveal>
        ))}
      </div>
      <p className="mt-4 text-[11px] leading-[1.5] text-[var(--muted)]">
        Cover thumbnails via{" "}
        <a
          href="https://openlibrary.org/dev/docs/api/covers"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-[var(--sage)] underline-offset-4 hover:underline"
        >
          Open Library
        </a>
        ; used here as small identifying visuals.
      </p>
    </section>
  );
}

function FuturePhotoStrip() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {profile.photoSlots.map((slot) => (
        <div key={slot.id} className="editorial-panel motion-surface min-w-0 overflow-hidden p-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] bg-[linear-gradient(145deg,#eef1ed,#fffdf8)]">
            <Image
              src={slot.src}
              alt={`${slot.label}: ${slot.note}`}
              fill
              sizes="(max-width: 640px) 92vw, 180px"
              className="media-lift object-cover transition-transform duration-[900ms] ease-[var(--ease)] hover:scale-[1.035]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-3 text-white">
              <p className="text-[0.86rem] font-semibold leading-[1.2]">
                {slot.label}
              </p>
              <p className="mt-1 text-[0.72rem] leading-[1.4] text-white/70">
                {slot.note}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function InterestMotif({
  title,
  featured = false,
}: {
  title: string;
  featured?: boolean;
}) {
  const lineColor = featured ? "bg-white/18" : "bg-black/10";
  const borderColor = featured ? "border-white/14" : "border-black/10";
  const softFill = featured ? "bg-white/[0.07]" : "bg-black/[0.035]";
  const accentFill = featured
    ? "bg-[rgba(216,194,154,0.7)]"
    : "bg-[rgba(104,121,109,0.55)]";

  if (title === "Badminton") {
    return (
      <div
        aria-hidden="true"
        className={`relative mt-5 h-28 overflow-hidden rounded-[8px] border ${borderColor} ${softFill}`}
      >
        <span className={`absolute left-1/2 top-0 h-full w-px ${lineColor}`} />
        <span className={`absolute left-0 right-0 top-1/2 h-px ${lineColor}`} />
        <span className={`absolute left-[18%] top-[16%] h-[68%] w-[64%] rounded-full border ${borderColor}`} />
        <span className={`absolute right-9 top-7 h-10 w-10 rounded-full border ${borderColor}`} />
        <span className={`absolute bottom-7 right-12 h-9 w-px rotate-[-38deg] ${lineColor}`} />
        <span className={`absolute bottom-5 left-8 h-2.5 w-2.5 rounded-full ${accentFill}`} />
      </div>
    );
  }

  if (title === "Chess") {
    return (
      <div
        aria-hidden="true"
        className={`relative mt-5 grid h-28 grid-cols-6 overflow-hidden rounded-[8px] border ${borderColor}`}
      >
        {Array.from({ length: 24 }).map((_, square) => (
          <span
            key={square}
            className={square % 2 === 0 ? softFill : "bg-transparent"}
          />
        ))}
        <span className={`absolute bottom-5 left-7 h-10 w-7 rounded-t-full ${accentFill}`} />
        <span className={`absolute bottom-4 left-5 h-2 w-11 rounded-full ${accentFill}`} />
        <span className={`absolute right-7 top-5 h-10 w-10 rounded-full border ${borderColor}`} />
      </div>
    );
  }

  if (title === "Early morning runs") {
    return (
      <div
        aria-hidden="true"
        className={`relative mt-5 h-28 overflow-hidden rounded-[8px] border ${borderColor} ${softFill}`}
      >
        <span className={`absolute left-8 top-7 h-9 w-9 rounded-full ${accentFill}`} />
        <span className={`absolute bottom-8 left-7 h-px w-[78%] ${lineColor}`} />
        <span className={`absolute bottom-8 left-7 h-14 w-[84%] rounded-[50%] border-t ${borderColor}`} />
        <span className={`absolute bottom-12 right-10 h-2 w-20 rounded-full ${featured ? "bg-white/18" : "bg-[rgba(104,121,109,0.2)]"}`} />
      </div>
    );
  }

  if (title === "Photography") {
    return (
      <div
        aria-hidden="true"
        className={`relative mt-5 h-28 overflow-hidden rounded-[8px] border ${borderColor} ${softFill}`}
      >
        <span className={`absolute left-8 top-6 h-16 w-24 rounded-[8px] border ${borderColor}`} />
        <span className={`absolute left-[68px] top-10 h-8 w-8 rounded-full border ${borderColor}`} />
        <span className={`absolute right-8 top-8 h-12 w-20 rounded-[8px] ${featured ? "bg-white/10" : "bg-white/50"}`} />
        <span className={`absolute bottom-5 left-8 h-px w-[74%] ${lineColor}`} />
      </div>
    );
  }

  if (title === "Technology + AI tools") {
    return (
      <div
        aria-hidden="true"
        className={`relative mt-5 h-28 overflow-hidden rounded-[8px] border ${borderColor} ${softFill}`}
      >
        <span className={`absolute left-[18%] top-[26%] h-3 w-3 rounded-full ${accentFill}`} />
        <span className={`absolute left-[46%] top-[54%] h-3 w-3 rounded-full ${accentFill}`} />
        <span className={`absolute right-[18%] top-[30%] h-3 w-3 rounded-full ${accentFill}`} />
        <span className={`absolute left-[20%] top-[34%] h-px w-[29%] rotate-[25deg] ${lineColor}`} />
        <span className={`absolute right-[20%] top-[38%] h-px w-[30%] rotate-[-18deg] ${lineColor}`} />
        <span className={`absolute bottom-5 left-8 right-8 h-10 rounded-[8px] border ${borderColor}`} />
      </div>
    );
  }

  if (title === "Brands and markets") {
    return (
      <div
        aria-hidden="true"
        className={`relative mt-5 flex h-28 items-end gap-2 overflow-hidden rounded-[8px] border ${borderColor} ${softFill} px-7 pb-6`}
      >
        {[44, 62, 34, 76, 54].map((height, index) => (
          <span
            key={height}
            className={`w-full rounded-t-[6px] ${index === 3 ? accentFill : lineColor}`}
            style={{ height }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`relative mt-5 h-28 overflow-hidden rounded-[8px] border ${borderColor} ${softFill}`}
    >
      <span className={`absolute left-7 top-7 h-px w-[70%] ${lineColor}`} />
      <span className={`absolute left-7 top-14 h-px w-[55%] ${lineColor}`} />
      <span className={`absolute left-7 top-[84px] h-px w-[78%] ${lineColor}`} />
      <span className={`absolute right-8 top-8 h-12 w-12 rounded-full border ${borderColor}`} />
    </div>
  );
}

function PersonalInterestCard({
  interest,
  index,
}: {
  interest: (typeof personalInterests)[number];
  index: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const Icon = interest.icon;

  return (
    <motion.article
      className={`interest-card motion-surface hover-light group relative h-full min-h-[366px] overflow-hidden rounded-[8px] border p-5 transition duration-500 lg:min-h-0 lg:p-6 ${
        interest.featured
          ? "border-black/12 bg-[rgba(16,18,18,0.92)] text-white shadow-[0_34px_110px_rgba(16,18,18,0.16)]"
          : "editorial-panel"
      }`}
      style={
        {
          "--interest-tilt": `${index % 2 === 0 ? -0.9 : 0.9}deg`,
        } as CSSProperties
      }
      whileHover={
        shouldReduceMotion
          ? undefined
          : { y: -7, rotate: index % 2 === 0 ? -0.6 : 0.6, scale: 1.008 }
      }
      whileTap={shouldReduceMotion ? undefined : { scale: 0.992 }}
      transition={{ duration: 0.32, ease: premiumEase }}
    >
      <div className="flex items-start justify-between gap-4">
        <Icon
          className={`h-5 w-5 ${
            interest.featured ? "text-white/68" : "text-[var(--sage)]"
          }`}
        />
        <span
          className={`grid h-8 w-8 place-items-center rounded-full border text-[12px] transition group-hover:translate-x-1 ${
            interest.featured
              ? "border-white/12 text-white/50"
              : "border-black/10 text-[var(--sage)]"
          }`}
        >
          0{index + 1}
        </span>
      </div>
      <InterestMotif
        title={interest.title}
        featured={interest.featured}
      />
      <h3 className="mt-7 text-[1.18rem] font-semibold leading-[1.2]">
        {interest.title}
      </h3>
      <p
        className={`mt-4 text-[0.95rem] leading-[1.65] ${
          interest.featured ? "text-white/66" : "text-[var(--muted)]"
        }`}
      >
        {interest.text}
      </p>
    </motion.article>
  );
}

function PersonalInterests() {
  return (
    <section className="section-shell relative py-12 md:py-32">
      <div className="grid gap-10 lg:grid-cols-[0.78fr_1fr] lg:gap-16">
        <Reveal>
          <SectionLabel>Off the screen</SectionLabel>
          <HeadingReveal
            lines={["A few things", "that keep me human."]}
            mobileLines={["A few things", "that keep me", "human."]}
            className="max-w-[760px] text-[clamp(2.35rem,10vw,5rem)] font-semibold leading-[1] tracking-[0] md:leading-[0.96]"
          />
          <p className="mt-6 max-w-[660px] text-[1.02rem] leading-[1.7] text-[var(--muted-strong)] md:text-[1.16rem]">
            I do not want the site to pretend life is only output. Badminton,
            chess, running, photos, sketches, cooking, tools, and market
            watching all feed the same habit: paying attention before making a
            move.
          </p>
          <div id="gallery" className="mt-8 scroll-mt-28">
            <FuturePhotoStrip />
          </div>
          <Reveal delay={0.08}>
            <Link
              href="/life"
              className="premium-link group mt-4 flex items-center justify-between gap-4 rounded-[8px] border border-black/10 bg-[rgba(255,253,248,0.68)] px-4 py-3 text-[0.95rem] font-medium text-[var(--foreground)] shadow-[0_18px_54px_rgba(16,18,18,0.055)] backdrop-blur transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-black/15"
            >
              <span>Life, lightly documented</span>
              <ArrowUpRight className="h-4 w-4 text-[var(--muted)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
        </Reveal>
        <div className="min-w-0">
          <div className="min-w-0 overflow-hidden lg:hidden">
            <GlideDeck
              ariaLabel="Personal interests cards"
              slideClassName="glide-slide-wide"
            >
              {personalInterests.map((interest, index) => (
                <PersonalInterestCard
                  key={interest.title}
                  interest={interest}
                  index={index}
                />
              ))}
            </GlideDeck>
          </div>

          <div className="hidden gap-3 lg:grid lg:grid-cols-2">
            {personalInterests.map((interest, index) => (
              <Reveal
                key={interest.title}
                delay={index * 0.035}
                className={`${interest.featured ? "sm:col-span-2" : ""} min-w-0`}
              >
                <PersonalInterestCard interest={interest} index={index} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ClosingBridge() {
  return (
    <section className="section-shell py-10 md:py-16">
      <Reveal>
        <Link
          href="#contact"
          className="premium-link motion-surface group flex flex-col gap-5 rounded-[8px] border border-black/10 bg-[rgba(255,253,248,0.64)] p-5 shadow-[0_30px_90px_rgba(16,18,18,0.07)] backdrop-blur transition hover:bg-white md:flex-row md:items-center md:justify-between md:p-7"
        >
          <span className="max-w-[760px] text-[clamp(1.35rem,3.8vw,2.4rem)] font-semibold leading-[1.1]">
            If the direction feels useful, thoughtful, or simply worth a
            conversation, let&apos;s talk.
          </span>
          <span className="inline-flex items-center gap-2 text-[0.95rem] font-medium text-[var(--muted-strong)]">
            Contact
            <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </Link>
      </Reveal>
    </section>
  );
}

export function HomePageClient({ journalPosts }: { journalPosts: JournalPost[] }) {
  return (
    <main className="relative">
      <ExperienceBackdrop />
      <Hero />
      <StoryBridge {...bridgeMoments[0]} />
      <Direction />
      <Background />
      <ArchivePreview />
      <FeaturedSystem />
      <RecognitionSection />
      <MbaChapterSection />
      <JournalPreview posts={journalPosts} />
      <ReadingShelf />
      <StoryBridge {...bridgeMoments[1]} />
      <PersonalInterests />
      <ClosingBridge />
    </main>
  );
}
