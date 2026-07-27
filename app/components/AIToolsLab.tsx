"use client";

import {
  AnimatePresence,
  motion,
  type PanInfo,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  FilePenLine,
  Grid3X3,
  MousePointerClick,
  Newspaper,
  SearchCheck,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
import {
  aiTools,
  statusCta,
  statusLabels,
  toolsDeskDescription,
  toolsDeskTitle,
  type AITool,
  type ToolAccent,
  type ToolStatus,
} from "../data/tools";
import { trackToolEvent } from "../lib/toolAnalytics";
import { Reveal } from "./Reveal";
import { SectionLabel } from "./SectionLabel";

const premiumEase = [0.16, 1, 0.3, 1] as [number, number, number, number];

const toolIcons: Record<string, LucideIcon> = {
  "case-war-room": BriefcaseBusiness,
  "sip-readiness-scorecard": ClipboardCheck,
  "company-interview-intelligence": Building2,
  "business-news-talking-points": Newspaper,
  "mba-skill-gap-heatmap": Grid3X3,
  "mba-calculator-lab": Calculator,
  "weak-internship-reframer": FilePenLine,
  "market-research-survey-builder": SearchCheck,
};

const statusStyles: Record<
  ToolStatus,
  {
    badge: string;
    dot: string;
    rail: string;
    note: string;
  }
> = {
  Live: {
    badge: "border-emerald-200/28 bg-emerald-300/[0.1] text-emerald-100",
    dot: "bg-emerald-300",
    rail: "from-emerald-300/86 to-emerald-100/0",
    note: "Working workspace.",
  },
  "In Build": {
    badge: "border-amber-200/34 bg-amber-300/[0.12] text-amber-100",
    dot: "bg-amber-300",
    rail: "from-amber-300/90 to-amber-100/0",
    note: "Being built now. The page is a build plan, not a finished app.",
  },
  Concept: {
    badge: "border-slate-200/22 bg-slate-200/[0.08] text-slate-100",
    dot: "bg-slate-300",
    rail: "from-slate-200/72 to-slate-100/0",
    note: "Concept only. Interest decides whether it earns build time.",
  },
  "Priority Candidate": {
    badge: "border-indigo-200/32 bg-indigo-300/[0.12] text-indigo-100",
    dot: "bg-indigo-300",
    rail: "from-indigo-300/86 to-indigo-100/0",
    note: "High-priority idea, waiting for enough signal to build.",
  },
};

const accentStyles: Record<
  ToolAccent,
  {
    icon: string;
    text: string;
    soft: string;
    line: string;
    glow: string;
  }
> = {
  emerald: {
    icon: "border-emerald-200/18 bg-emerald-300/[0.1] text-emerald-100",
    text: "text-emerald-100",
    soft: "bg-emerald-300/[0.08]",
    line: "from-emerald-300/0 via-emerald-200/48 to-emerald-300/0",
    glow: "rgba(110,231,183,0.15)",
  },
  gold: {
    icon: "border-amber-200/24 bg-amber-300/[0.12] text-amber-100",
    text: "text-amber-100",
    soft: "bg-amber-300/[0.1]",
    line: "from-amber-300/0 via-amber-200/58 to-amber-300/0",
    glow: "rgba(251,191,36,0.2)",
  },
  violet: {
    icon: "border-indigo-200/22 bg-indigo-300/[0.12] text-indigo-100",
    text: "text-indigo-100",
    soft: "bg-indigo-300/[0.1]",
    line: "from-indigo-300/0 via-indigo-200/52 to-indigo-300/0",
    glow: "rgba(165,180,252,0.18)",
  },
  slate: {
    icon: "border-slate-200/20 bg-slate-200/[0.1] text-slate-100",
    text: "text-slate-100",
    soft: "bg-slate-200/[0.08]",
    line: "from-slate-300/0 via-slate-100/42 to-slate-300/0",
    glow: "rgba(226,232,240,0.13)",
  },
  steel: {
    icon: "border-sky-200/20 bg-sky-300/[0.1] text-sky-100",
    text: "text-sky-100",
    soft: "bg-sky-300/[0.08]",
    line: "from-sky-300/0 via-sky-200/48 to-sky-300/0",
    glow: "rgba(125,211,252,0.16)",
  },
  copper: {
    icon: "border-orange-200/20 bg-orange-300/[0.1] text-orange-100",
    text: "text-orange-100",
    soft: "bg-orange-300/[0.08]",
    line: "from-orange-300/0 via-orange-200/48 to-orange-300/0",
    glow: "rgba(253,186,116,0.17)",
  },
  sage: {
    icon: "border-lime-200/18 bg-lime-200/[0.1] text-lime-100",
    text: "text-lime-100",
    soft: "bg-lime-200/[0.08]",
    line: "from-lime-300/0 via-lime-200/44 to-lime-300/0",
    glow: "rgba(190,242,100,0.13)",
  },
};

function ToolStatusBadge({ status }: { status: ToolStatus }) {
  const style = statusStyles[status];

  return (
    <span
      className={`inline-flex min-h-8 items-center gap-2 rounded-[8px] border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${style.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {statusLabels[status]}
    </span>
  );
}

function ToolBriefCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-[#15181b] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/36">
        {label}
      </p>
      <p className="mt-3 text-[0.92rem] leading-[1.55] text-white/72">
        {value}
      </p>
    </div>
  );
}

function ToolBuildPlan({
  tool,
  activeIndex,
}: {
  tool: AITool;
  activeIndex: number;
}) {
  const Icon = toolIcons[tool.slug] ?? BriefcaseBusiness;
  const accent = accentStyles[tool.accent];

  return (
    <aside className="relative overflow-hidden rounded-[8px] border border-white/10 bg-[#0c0f11] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:p-5">
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accent.line}`} />
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/36">
              Desk note
            </p>
            <p className="mt-3 text-[1.15rem] font-semibold leading-[1.22] text-white/88">
              {tool.spotlightNote}
            </p>
          </div>
          <span
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-[8px] border ${accent.icon}`}
          >
            <Icon className="h-5 w-5" />
          </span>
        </div>

        <div className="mt-7 grid gap-3">
          {tool.plannedWorkflow.slice(0, 4).map((step, index) => (
            <div
              key={step}
              className="grid grid-cols-[34px_1fr] items-start gap-3 rounded-[8px] border border-white/10 bg-[#15181b] p-3"
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-[8px] text-[11px] font-semibold ${accent.soft} ${accent.text}`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="text-[0.9rem] leading-[1.5] text-white/70">
                {step}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[8px] border border-white/10 bg-black/20 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/34">
            Interest tracking
          </p>
          <p className="mt-2 text-[0.78rem] leading-[1.52] text-white/52">
            Open the roadmap and press <span className="text-white/68">I want this tool</span>{" "}
            to leave a private signal. I am not showing public counts until
            there is real backend data with duplicate and bot filtering.
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/36">
          <span>Tool {String(activeIndex + 1).padStart(2, "0")}</span>
          <span>{String(aiTools.length).padStart(2, "0")} in desk</span>
        </div>
      </div>
    </aside>
  );
}

function SpotlightStage({
  tool,
  activeIndex,
}: {
  tool: AITool;
  activeIndex: number;
}) {
  const accent = accentStyles[tool.accent];
  const status = statusStyles[tool.status];

  return (
    <article
      className="relative overflow-hidden rounded-[8px] border border-[rgba(232,203,148,0.22)] bg-[#101214] p-5 text-white shadow-[0_42px_150px_rgba(0,0,0,0.44)] md:p-7 lg:p-8"
      style={{
        boxShadow: `0 0 0 1px rgba(255,255,255,0.06) inset, 0 42px 150px rgba(0,0,0,0.44), 0 0 58px ${accent.glow}`,
      }}
    >
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accent.line}`} />
      <div className="relative z-10 grid gap-7 lg:grid-cols-[minmax(0,0.94fr)_minmax(340px,0.62fr)] lg:items-stretch">
        <div className="flex min-h-[500px] flex-col justify-between gap-8 md:min-h-[470px]">
          <div>
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <ToolStatusBadge status={tool.status} />
              <span className="inline-flex min-h-8 items-center rounded-[8px] border border-white/10 bg-[#171a1d] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/52">
                {tool.category}
              </span>
            </div>

            <h3 className="max-w-[760px] text-[clamp(2.15rem,9vw,4.45rem)] font-semibold leading-[0.98] tracking-[0] text-white lg:text-[clamp(3rem,5vw,4.8rem)]">
              {tool.name}
            </h3>
            <p className="mt-5 max-w-[680px] text-[1rem] leading-[1.72] text-white/70 md:text-[1.08rem]">
              {tool.oneLineBenefit}
            </p>

            <div className="mt-7 grid gap-3 md:grid-cols-2">
              <ToolBriefCard label="About this tool" value={tool.homepageAbout} />
              <ToolBriefCard label="Use it when" value={tool.usefulWhen} />
            </div>
          </div>

          <div>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {tool.microFeatures.map((feature) => (
                <div
                  key={feature}
                  className="rounded-[8px] border border-white/10 bg-[#171a1d] px-3 py-3 text-[0.84rem] font-medium leading-[1.35] text-white/72"
                >
                  <span
                    className={`mb-3 block h-px w-9 bg-gradient-to-r ${status.rail}`}
                  />
                  {feature}
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={tool.route}
                onClick={() =>
                  trackToolEvent("tool_card_click", {
                    tool,
                    source: "tools_desk_spotlight",
                    action: statusCta[tool.status],
                  })
                }
                className="premium-link inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] border border-white/16 bg-[var(--surface)] px-4 py-3 text-[13px] font-semibold text-black shadow-[0_22px_60px_rgba(0,0,0,0.28)] transition hover:border-white/30 hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/24 sm:w-auto"
                style={{ color: "#101212" }}
              >
                {statusCta[tool.status]}
                <ArrowUpRight
                  className="h-4 w-4"
                  style={{ color: "rgba(16,18,18,0.58)" }}
                />
              </Link>
              <p className={`max-w-[460px] text-[0.83rem] leading-[1.5] ${accent.text}`}>
                {status.note}
              </p>
            </div>
          </div>
        </div>

        <ToolBuildPlan tool={tool} activeIndex={activeIndex} />
      </div>
    </article>
  );
}

function ToolProgressDots({
  activeIndex,
  showIndex,
}: {
  activeIndex: number;
  showIndex: (index: number) => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-center gap-2 px-1 pb-1">
        {aiTools.map((tool, index) => {
          const isActive = activeIndex === index;
          const status = statusStyles[tool.status];

          return (
            <button
              key={tool.slug}
              type="button"
              onClick={() => showIndex(index)}
              aria-label={`Show ${tool.name}`}
              aria-current={isActive ? "true" : undefined}
              className={`group grid h-9 place-items-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-white/20 ${
                isActive
                  ? "w-11 border border-white/16 bg-white/12 shadow-[0_12px_34px_rgba(0,0,0,0.22)]"
                  : "w-9 border border-white/10 bg-[#111416] hover:border-white/18 hover:bg-[#181c20]"
              }`}
            >
              <span
                className={`h-1.5 rounded-full ${status.dot} transition-all ${
                  isActive ? "w-5" : "w-1.5 opacity-70 group-hover:opacity-100"
                }`}
              />
            </button>
          );
        })}
    </div>
  );
}

function SpotlightCarousel() {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const tools = aiTools;
  const activeTool = tools[activeIndex];

  const showRelative = useCallback(
    (delta: number) => {
      setActiveIndex((current) => (current + delta + tools.length) % tools.length);
    },
    [tools.length],
  );

  const showIndex = useCallback(
    (index: number) => {
      setActiveIndex((index + tools.length) % tools.length);
    },
    [tools.length],
  );

  useEffect(() => {
    if (paused || shouldReduceMotion) return;

    const rotation = window.setInterval(() => showRelative(1), 9000);

    return () => window.clearInterval(rotation);
  }, [paused, shouldReduceMotion, showRelative]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showRelative(1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showRelative(-1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      showIndex(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      showIndex(tools.length - 1);
    }
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (info.offset.x < -70 || info.velocity.x < -420) showRelative(1);
    if (info.offset.x > 70 || info.velocity.x > 420) showRelative(-1);
  };

  return (
    <div
      id="tools-desk-spotlight"
      className="relative scroll-mt-28 rounded-[8px] border border-white/10 bg-[#07090a] p-2 shadow-[0_34px_140px_rgba(0,0,0,0.34)] md:p-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative z-10">
        <div className="flex flex-col gap-3 px-1 pb-3 sm:flex-row sm:items-center sm:justify-between md:px-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/46">
            <span className="inline-flex items-center gap-2 rounded-[8px] border border-white/10 bg-[#111416] px-2.5 py-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${statusStyles[activeTool.status].dot}`} />
              {statusLabels[activeTool.status]}
            </span>
            <span className="rounded-[8px] border border-white/10 bg-[#111416] px-2.5 py-1.5">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(tools.length).padStart(2, "0")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => showRelative(-1)}
              aria-label="Show previous tool"
              className="grid h-10 w-10 place-items-center rounded-[8px] border border-white/12 bg-[#111416] text-white/72 transition hover:border-white/22 hover:bg-[#181c20] focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => showRelative(1)}
              aria-label="Show next tool"
              className="grid h-10 w-10 place-items-center rounded-[8px] border border-white/12 bg-[#111416] text-white/72 transition hover:border-white/22 hover:bg-[#181c20] focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          role="region"
          aria-label="MBA tools desk carousel"
          aria-roledescription="carousel"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="outline-none"
        >
          <motion.div
            drag={shouldReduceMotion ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.08}
            onDragEnd={handleDragEnd}
            className="touch-pan-y"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTool.slug}
                initial={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { opacity: 0, y: 18, scale: 0.985 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -12, scale: 0.99 }
                }
                transition={{ duration: 0.42, ease: premiumEase }}
                aria-live="polite"
              >
                <SpotlightStage tool={activeTool} activeIndex={activeIndex} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        <ToolProgressDots activeIndex={activeIndex} showIndex={showIndex} />
      </div>
    </div>
  );
}

function LabViewTracker({
  sectionRef,
}: {
  sectionRef: RefObject<HTMLElement | null>;
}) {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        trackToolEvent("tools_lab_view", {
          source: "homepage",
          action: "section_visible",
        });
        observer.disconnect();
      },
      { threshold: 0.32 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, [sectionRef]);

  return null;
}

export function AIToolsLab() {
  const sectionRef = useRef<HTMLElement | null>(null);

  return (
    <section
      ref={sectionRef}
      id="ai-tools-lab"
      className="dark-transition scene-section scene-section-dark scroll-mt-28 overflow-hidden bg-[#07090a] py-14 text-[var(--surface)] md:py-28"
    >
      <LabViewTracker sectionRef={sectionRef} />
      <div className="section-shell">
        <Reveal>
          <div className="mx-auto max-w-[980px] text-center">
            <SectionLabel>{toolsDeskTitle}</SectionLabel>
            <h2
              aria-label={toolsDeskTitle}
              className="mx-auto max-w-[860px] text-[clamp(2.65rem,12vw,5.8rem)] font-semibold leading-[0.96] tracking-[0] text-white md:leading-[0.9]"
            >
              <span className="block">MBA Tools</span>
              <span className="sr-only"> </span>
              <span className="block">Desk</span>
            </h2>
            <p className="mx-auto mt-5 max-w-[780px] text-[clamp(1.02rem,3.8vw,1.34rem)] leading-[1.58] text-white/74">
              {toolsDeskDescription}
            </p>
            <div className="mx-auto mt-6 grid max-w-[880px] gap-3 text-left md:grid-cols-3">
              <div className="rounded-[8px] border border-white/10 bg-[#101315] p-4">
                <MousePointerClick className="h-4 w-4 text-amber-100/76" />
                <p className="mt-3 text-[0.92rem] font-semibold text-white/84">
                  Built from use, not buzzwords.
                </p>
                <p className="mt-2 text-[0.82rem] leading-[1.55] text-white/48">
                  Each idea starts from a real MBA friction point I have seen or
                  had to work through.
                </p>
              </div>
              <div className="rounded-[8px] border border-white/10 bg-[#101315] p-4">
                <ShieldCheck className="h-4 w-4 text-emerald-100/76" />
                <p className="mt-3 text-[0.92rem] font-semibold text-white/84">
                  Honest build status.
                </p>
                <p className="mt-2 text-[0.82rem] leading-[1.55] text-white/48">
                  If a tool is not usable yet, it is shown as a roadmap, not a
                  fake launch.
                </p>
              </div>
              <div className="rounded-[8px] border border-white/10 bg-[#101315] p-4">
                <CheckCircle2 className="h-4 w-4 text-sky-100/76" />
                <p className="mt-3 text-[0.92rem] font-semibold text-white/84">
                  Private interest signal.
                </p>
                <p className="mt-2 text-[0.82rem] leading-[1.55] text-white/48">
                  Clicks help prioritize. Public counts stay hidden until the
                  data is real and deduped.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-10 md:mt-16" delay={0.06}>
          <SpotlightCarousel />
        </Reveal>
      </div>
    </section>
  );
}
