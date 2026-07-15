import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Calculator,
  ClipboardCheck,
  FilePenLine,
  Grid3X3,
  Newspaper,
  SearchCheck,
  type LucideIcon,
} from "lucide-react";
import { Footer } from "../components/Footer";
import { HeadingReveal } from "../components/HeadingReveal";
import { Reveal } from "../components/Reveal";
import { SectionLabel } from "../components/SectionLabel";
import {
  aiTools,
  statusCta,
  statusLabels,
  toolsDeskDescription,
  toolsDeskTitle,
  type ToolStatus,
} from "../data/tools";

export const metadata: Metadata = {
  title: toolsDeskTitle,
  description: toolsDeskDescription,
  alternates: {
    canonical: "/tools",
  },
  openGraph: {
    title: toolsDeskTitle,
    description: toolsDeskDescription,
    url: "/tools",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Mohit Sai Krishna MBA tools desk preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: toolsDeskTitle,
    description: toolsDeskDescription,
    images: ["/twitter-image"],
  },
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

const statusDot: Record<ToolStatus, string> = {
  Live: "bg-emerald-300",
  "In Build": "bg-amber-300",
  Concept: "bg-slate-300",
  "Priority Candidate": "bg-indigo-300",
};

const statusBadge: Record<ToolStatus, string> = {
  Live: "border-emerald-200/28 bg-emerald-300/[0.1] text-emerald-100",
  "In Build": "border-amber-200/34 bg-amber-300/[0.12] text-amber-100",
  Concept: "border-slate-200/22 bg-slate-200/[0.08] text-slate-100",
  "Priority Candidate": "border-indigo-200/32 bg-indigo-300/[0.12] text-indigo-100",
};

export default function ToolsIndexPage() {
  const liveCount = aiTools.filter((tool) => tool.status === "Live").length;
  const inBuildCount = aiTools.filter((tool) => tool.status === "In Build").length;

  return (
    <>
      <main className="relative overflow-hidden pt-24 md:pt-32">
        <div
          aria-hidden="true"
          className="premium-grid pointer-events-none absolute right-[-120px] top-28 h-[420px] w-[620px] opacity-[0.1] [mask-image:radial-gradient(circle,black,transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="orbital-line pointer-events-none left-[-180px] top-24 h-[320px] w-[520px] opacity-70"
        />
        <section className="section-shell pb-10 pt-5 md:pb-28 md:pt-8">
          <div className="grid gap-8 md:grid-cols-[0.78fr_1fr] md:items-end md:gap-16">
            <Reveal>
              <SectionLabel>Tools desk</SectionLabel>
              <HeadingReveal
                as="h1"
                lines={["Small tools for the", "messier MBA moments."]}
                mobileLines={[
                  "Small tools for",
                  "the messier",
                  "MBA moments.",
                ]}
                className="max-w-[820px] text-[clamp(2rem,9.8vw,4.4rem)] font-semibold leading-[1.02] tracking-[0] md:text-[clamp(2.75rem,6.7vw,6.25rem)] md:leading-[0.94]"
              />
            </Reveal>
            <Reveal delay={0.08}>
              <p className="max-w-[700px] text-[clamp(0.98rem,4vw,1.24rem)] leading-[1.62] text-[var(--muted-strong)]">
                {toolsDeskDescription}
              </p>
              <div className="mt-7 grid gap-2 sm:grid-cols-3">
                {[
                  ["Live tools", liveCount],
                  ["Currently building", inBuildCount],
                  ["Total on desk", aiTools.length],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="motion-surface rounded-[8px] border border-white/10 bg-white/[0.04] px-3 py-3 backdrop-blur"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {label}
                    </p>
                    <p className="mt-2 text-[1.2rem] font-semibold leading-none">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="section-shell pb-16 md:pb-36">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {aiTools.map((tool, index) => {
              const Icon = toolIcons[tool.slug] ?? BriefcaseBusiness;

              return (
                <Reveal key={tool.slug} delay={Math.min(index * 0.035, 0.2)} className="h-full">
                  <Link
                    href={tool.route}
                    className="group editorial-panel motion-surface hover-light relative flex h-full min-h-[280px] flex-col justify-between overflow-hidden p-5 transition duration-500 focus:outline-none focus:ring-2 focus:ring-white/20 md:p-6"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] border border-white/10 bg-white/[0.04] text-[var(--cyan)]">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span
                          className={`inline-flex min-h-8 items-center gap-2 rounded-[8px] border px-2.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.13em] ${statusBadge[tool.status]}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${statusDot[tool.status]}`} />
                          {statusLabels[tool.status]}
                        </span>
                      </div>

                      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                        {tool.category}
                      </p>
                      <h2 className="mt-2 text-[1.3rem] font-semibold leading-[1.18] tracking-[0]">
                        {tool.name}
                      </h2>
                      <p className="mt-3 text-[0.92rem] leading-[1.58] text-[var(--muted)]">
                        {tool.oneLineBenefit}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-1.5">
                        {tool.microFeatures.map((feature) => (
                          <span
                            key={feature}
                            className="rounded-[7px] border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[var(--muted-strong)]"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-4 text-[0.92rem] font-medium text-[var(--foreground)]">
                      <span>{statusCta[tool.status]}</span>
                      <ArrowUpRight className="h-4 w-4 text-[var(--muted)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
