import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  FilePenLine,
  Grid3X3,
  Newspaper,
  SearchCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { CaseWarRoomWorkspace } from "../../components/CaseWarRoomWorkspace";
import { Footer } from "../../components/Footer";
import { HeadingReveal } from "../../components/HeadingReveal";
import { Reveal } from "../../components/Reveal";
import { SectionLabel } from "../../components/SectionLabel";
import { SipReadinessWorkspace } from "../../components/SipReadinessWorkspace";
import { ToolInterestButton } from "../../components/ToolInterestButton";
import { ToolRouteTracker } from "../../components/ToolRouteTracker";
import {
  aiTools,
  getRelatedTools,
  getToolBySlug,
  statusCta,
  statusLabels,
  toolsDeskTitle,
  type AITool,
  type ToolStatus,
} from "../../data/tools";

type ToolPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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

const statusStyles: Record<ToolStatus, string> = {
  Live: "border-emerald-200/28 bg-emerald-300/[0.1] text-emerald-100",
  "In Build": "border-amber-200/34 bg-amber-300/[0.12] text-amber-100",
  Concept: "border-slate-200/22 bg-slate-200/[0.08] text-slate-100",
  "Priority Candidate": "border-indigo-200/32 bg-indigo-300/[0.12] text-indigo-100",
};

export function generateStaticParams() {
  return aiTools.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({
  params,
}: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {
      title: "Tool not found",
    };
  }

  return {
    title: `${tool.name} | ${toolsDeskTitle}`,
    description: tool.oneLineBenefit,
    alternates: {
      canonical: tool.route,
    },
    openGraph: {
      title: `${tool.name} | ${toolsDeskTitle}`,
      description: tool.oneLineBenefit,
      url: tool.route,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.name} | ${toolsDeskTitle}`,
      description: tool.oneLineBenefit,
    },
  };
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Reveal>
      <section className="grid gap-4 border-t border-white/10 py-6 md:grid-cols-[240px_1fr] md:gap-14 md:py-10">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] md:pt-1">
          {title}
        </h2>
        <div className="max-w-[840px] text-[clamp(1rem,4vw,1.12rem)] leading-[1.72] text-[var(--muted-strong)] md:text-[clamp(1.04rem,1.4vw,1.2rem)]">
          {children}
        </div>
      </section>
    </Reveal>
  );
}

function getTitleLines(title: string) {
  const words = title.split(" ");

  if (words.length <= 2) return [title];

  const midpoint = Math.ceil(words.length / 2);

  return [
    words.slice(0, midpoint).join(" "),
    words.slice(midpoint).join(" "),
  ].filter(Boolean);
}

function getMobileTitleLines(title: string) {
  return title.split(" ").reduce<string[]>((lines, word) => {
    const previousLine = lines.at(-1);

    if (!previousLine) return [word];

    const nextLine = `${previousLine} ${word}`;

    if (nextLine.length <= 15) {
      return [...lines.slice(0, -1), nextLine];
    }

    return [...lines, word];
  }, []);
}

function StatusBadge({ status }: { status: ToolStatus }) {
  return (
    <span
      className={`inline-flex min-h-8 items-center rounded-[8px] border px-2.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

function ToolHeroVisual({ tool }: { tool: AITool }) {
  const Icon = toolIcons[tool.slug] ?? Sparkles;

  return (
    <Reveal delay={0.1}>
      <aside className="motion-surface relative overflow-hidden rounded-[8px] border border-white/10 bg-[#101214] p-5 text-white shadow-[0_34px_120px_rgba(16,18,18,0.18),inset_0_1px_0_rgba(255,255,255,0.08)] md:p-6">
        <div className="signal-grid pointer-events-none absolute inset-0 opacity-[0.12]" />
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/42">
                Roadmap desk
              </p>
              <p className="mt-3 max-w-[320px] text-[1.24rem] font-semibold leading-[1.18] text-white/90">
                {tool.spotlightNote}
              </p>
            </div>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[8px] border border-white/10 bg-white/[0.06] text-white/72">
              <Icon className="h-5 w-5" />
            </span>
          </div>

          <div className="mt-8 grid gap-3">
            {tool.plannedWorkflow.map((step, index) => (
              <div
                key={step}
                className="grid grid-cols-[36px_1fr] items-start gap-3 rounded-[8px] border border-white/10 bg-white/[0.04] p-3"
              >
                <span className="grid h-8 w-8 place-items-center rounded-[8px] bg-white/[0.07] text-[11px] font-semibold text-white/60">
                  0{index + 1}
                </span>
                <p className="text-[0.92rem] leading-[1.5] text-white/70">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </Reveal>
  );
}

function RelatedToolCard({ tool }: { tool: AITool }) {
  const Icon = toolIcons[tool.slug] ?? Sparkles;

  return (
    <Link
      href={tool.route}
      className="premium-link group flex h-full flex-col justify-between rounded-[8px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_54px_rgba(0,0,0,0.32)] backdrop-blur transition hover:bg-white/[0.08] md:p-5"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] border border-white/10 bg-white/[0.04] text-[var(--cyan)]">
            <Icon className="h-4 w-4" />
          </span>
          <span className="rounded-[8px] border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-[var(--muted)]">
            {statusLabels[tool.status]}
          </span>
        </div>
        <p className="mt-4 text-[1.05rem] font-semibold leading-[1.22] text-[var(--foreground)]">
          {tool.name}
        </p>
        <p className="mt-3 text-[0.88rem] leading-[1.58] text-[var(--muted)]">
          {tool.oneLineBenefit}
        </p>
      </div>
      <span className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--muted-strong)]">
        {statusCta[tool.status]}
        <ArrowUpRight className="h-3.5 w-3.5 text-[var(--muted)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  if (tool.slug === "case-war-room") {
    return <CaseWarRoomWorkspace tool={tool} />;
  }

  if (tool.slug === "sip-readiness-scorecard") {
    return <SipReadinessWorkspace tool={tool} />;
  }

  const titleLines = getTitleLines(tool.name);
  const mobileTitleLines = getMobileTitleLines(tool.name);
  const relatedTools = getRelatedTools(tool);

  return (
    <>
      <ToolRouteTracker tool={tool} />
      <main className="relative overflow-hidden pt-24 md:pt-40">
        <div
          aria-hidden="true"
          className="premium-grid pointer-events-none absolute right-[-140px] top-24 h-[390px] w-[560px] opacity-[0.11] [mask-image:radial-gradient(circle,black,transparent_72%)]"
        />
        <div
          aria-hidden="true"
          className="motion-line pointer-events-none left-[8vw] top-[180px] w-[42vw] opacity-70"
        />

        <article className="section-shell pb-16 pt-5 md:pb-32 md:pt-8">
          <Reveal>
            <Link
              href="/#ai-tools-lab"
              className="premium-link mb-8 inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[13px] font-medium text-[var(--foreground)] shadow-[0_10px_32px_rgba(0,0,0,0.3)] backdrop-blur transition hover:bg-white/[0.08] md:mb-10 md:min-h-0"
            >
              <ArrowLeft className="h-4 w-4 text-[var(--muted)]" />
              Back to {toolsDeskTitle}
            </Link>
          </Reveal>

          <div className="grid gap-10 lg:grid-cols-[0.82fr_0.72fr] lg:items-end lg:gap-16">
            <Reveal>
              <SectionLabel>{tool.category}</SectionLabel>
              <HeadingReveal
                as="h1"
                lines={titleLines}
                mobileLines={mobileTitleLines}
                className="max-w-[860px] text-[clamp(2rem,9.8vw,4.5rem)] font-semibold leading-[1.03] tracking-[0] md:text-[clamp(2.9rem,6.8vw,6.5rem)] md:leading-[0.94]"
              />
              <div className="mt-6 flex flex-wrap gap-2">
                <StatusBadge status={tool.status} />
                <span className="inline-flex min-h-8 items-center rounded-[8px] border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[12px] font-medium text-[var(--muted)]">
                  {tool.category}
                </span>
              </div>
              <p className="mt-6 max-w-[760px] text-[clamp(1.02rem,4.1vw,1.28rem)] leading-[1.62] text-[var(--muted-strong)] md:text-[clamp(1.12rem,2vw,1.46rem)] md:leading-[1.5]">
                {tool.oneLineBenefit}
              </p>
              <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-start">
                {tool.status === "Live" ? (
                  <Link
                    href={tool.route}
                    className="premium-link inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] border border-white/10 bg-[var(--surface)] px-4 py-3 text-[13px] font-semibold text-[#101214] shadow-[0_24px_72px_rgba(0,0,0,0.35)] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/20"
                  >
                    {statusCta[tool.status]}
                    <ArrowUpRight className="h-4 w-4 text-[#101214]/62" />
                  </Link>
                ) : (
                  <ToolInterestButton tool={tool} source="tool_detail_hero" />
                )}
                <div className="max-w-[420px] rounded-[8px] border border-white/10 bg-white/[0.035] px-3.5 py-3 text-[0.88rem] leading-[1.55] text-[var(--muted)]">
                  Honest status: {statusLabels[tool.status]}. This page shows
                  the build plan until the workspace is actually usable.
                </div>
              </div>
            </Reveal>

            <ToolHeroVisual tool={tool} />
          </div>

          <Reveal>
            <div className="mt-10 grid gap-3 border-y border-white/10 py-4 md:mt-16 md:grid-cols-3 md:py-6">
              <div>
                <p className="editorial-kicker">For</p>
                <p className="mt-3 text-[0.98rem] leading-[1.58] text-[var(--muted-strong)]">
                  {tool.audience[0]}
                </p>
              </div>
              <div>
                <p className="editorial-kicker">Status</p>
                <p className="mt-3 text-[0.98rem] leading-[1.58] text-[var(--muted-strong)]">
                  {statusLabels[tool.status]} roadmap with interest tracking.
                </p>
              </div>
              <div>
                <p className="editorial-kicker">Micro-features</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tool.microFeatures.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-[8px] border border-white/10 bg-white/[0.035] px-2.5 py-1 text-[12px] text-[var(--muted-strong)]"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <div className="mt-10 md:mt-24">
            <DetailSection title="Problem">
              <p>{tool.problemStatement}</p>
            </DetailSection>

            <DetailSection title="About this tool">
              <div className="grid gap-5">
                <p>{tool.homepageAbout}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[8px] border border-white/10 bg-white/[0.035] p-4">
                    <p className="editorial-kicker">Use it when</p>
                    <p className="mt-3 text-[0.98rem] leading-[1.55]">
                      {tool.usefulWhen}
                    </p>
                  </div>
                  <div className="rounded-[8px] border border-white/10 bg-white/[0.035] p-4">
                    <p className="editorial-kicker">Why I am building it</p>
                    <p className="mt-3 text-[0.98rem] leading-[1.55]">
                      {tool.proofOfNeed}
                    </p>
                  </div>
                </div>
              </div>
            </DetailSection>

            <DetailSection title="Who it is for">
              <ul className="grid gap-3">
                {tool.audience.map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--cyan)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </DetailSection>

            <DetailSection title="What it will do">
              <p>{tool.whatItWillDo}</p>
            </DetailSection>

            <DetailSection title="Planned features">
              <div className="grid gap-3 sm:grid-cols-2">
                {tool.plannedFeatures.map((feature, index) => (
                  <div
                    key={feature}
                    className="rounded-[8px] border border-white/10 bg-white/[0.035] p-4"
                  >
                    <span className="text-[11px] font-semibold text-[var(--cyan)]">
                      0{index + 1}
                    </span>
                    <p className="mt-3 text-[0.98rem] leading-[1.5] text-[var(--muted-strong)]">
                      {feature}
                    </p>
                  </div>
                ))}
              </div>
            </DetailSection>

            <DetailSection title="Why it matters">
              <p>{tool.whyItMatters}</p>
            </DetailSection>
          </div>

          <Reveal>
            <section className="editorial-panel motion-surface relative mt-10 overflow-hidden p-5 md:mt-16 md:p-8">
              <div className="signal-grid pointer-events-none absolute inset-0 opacity-[0.13]" />
              <div className="relative z-10 grid gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-center">
                <div>
                  <p className="editorial-kicker">Interest signal</p>
                  <h2 className="mt-4 max-w-[580px] text-[clamp(1.75rem,5vw,3.25rem)] font-semibold leading-[1.02] tracking-[0]">
                    Help decide what deserves build time next.
                  </h2>
                  <p className="mt-5 max-w-[620px] text-[1rem] leading-[1.68] text-[var(--muted-strong)]">
                    I track this privately through analytics and a local
                    browser marker. Repeat clicks from the same browser are
                    treated as repeats, not new interest. I am not showing
                    public counts until there is real backend data with
                    duplicate and bot filtering.
                  </p>
                </div>
                <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4 md:p-5">
                  <ToolInterestButton tool={tool} source="tool_detail_interest_panel" />
                </div>
              </div>
            </section>
          </Reveal>

          {relatedTools.length > 0 && (
            <Reveal>
              <section className="mt-12 border-t border-white/10 pt-8 md:mt-16 md:pt-10">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="editorial-kicker">Related tools</p>
                    <h2 className="mt-3 text-[clamp(1.45rem,4vw,2.5rem)] font-semibold leading-[1.08]">
                      Adjacent tools on the desk.
                    </h2>
                  </div>
                  <Link
                    href="/#ai-tools-lab"
                    className="interactive-underline inline-flex items-center gap-2 text-[0.95rem] font-medium text-[var(--foreground)]"
                  >
                    Back to the tools desk
                    <ArrowUpRight className="h-4 w-4 text-[var(--muted)]" />
                  </Link>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {relatedTools.map((relatedTool) => (
                    <RelatedToolCard key={relatedTool.slug} tool={relatedTool} />
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          <Reveal>
            <div className="mt-10 rounded-[8px] border border-white/10 bg-white/[0.04] p-4 text-[0.92rem] font-medium text-[var(--muted-strong)] shadow-[0_18px_54px_rgba(0,0,0,0.32)] backdrop-blur md:mt-14">
              Built by Mohit Sai Krishna | MBA @ IIM Sirmaur
            </div>
          </Reveal>
        </article>
      </main>
      <Footer />
    </>
  );
}
