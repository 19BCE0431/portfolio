import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "../../components/Footer";
import { HeadingReveal } from "../../components/HeadingReveal";
import { ProjectVisual } from "../../components/ProjectVisual";
import { Reveal } from "../../components/Reveal";
import { SectionLabel } from "../../components/SectionLabel";
import { archiveProjects, getProjectBySlug } from "../../data/archive";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const livingSystemFlow = [
  "Vision",
  "Content direction",
  "Archive structure",
  "Weekly insight drafts",
  "Human review",
  "Publishing workflow",
];

export function generateStaticParams() {
  return archiveProjects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project not found",
    };
  }

  return {
    title: project.title,
    description: project.shortDescription,
    alternates: {
      canonical: `/archive/${project.slug}`,
    },
    openGraph: {
      title: project.title,
      description: project.shortDescription,
      url: `/archive/${project.slug}`,
      type: "article",
      images: project.visual?.image
        ? [
            {
              url: project.visual.image,
              alt: project.visual.alt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.shortDescription,
      images: project.visual?.image ? [project.visual.image] : undefined,
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
      <section className="grid gap-4 border-t border-black/10 py-6 md:grid-cols-[240px_1fr] md:gap-14 md:py-10">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] md:pt-1">
          {title}
        </h2>
        <div className="max-w-[820px] text-[clamp(1rem,4vw,1.12rem)] leading-[1.72] text-[var(--muted-strong)] md:text-[clamp(1.04rem,1.4vw,1.2rem)]">
          {children}
        </div>
      </section>
    </Reveal>
  );
}

function getTitleLines(title: string) {
  const words = title.split(" ");

  if (words.length <= 2) {
    return [title];
  }

  const midpoint = Math.ceil(words.length / 2);

  return [
    words.slice(0, midpoint).join(" "),
    words.slice(midpoint).join(" "),
  ].filter(Boolean);
}

function getMobileTitleLines(title: string) {
  return title.split(" ").reduce<string[]>((lines, word) => {
    const previousLine = lines.at(-1);

    if (!previousLine) {
      return [word];
    }

    const nextLine = `${previousLine} ${word}`;

    if (nextLine.length <= 13) {
      return [...lines.slice(0, -1), nextLine];
    }

    return [...lines, word];
  }, []);
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const titleLines = getTitleLines(project.title);
  const mobileTitleLines = getMobileTitleLines(project.title);
  const detailSections = project.sections;
  const isLivingSystem = project.slug === "living-ai-portfolio-system";

  return (
    <>
      <main className="relative overflow-hidden pt-24 md:pt-40">
        <div
          aria-hidden="true"
          className="premium-grid pointer-events-none absolute right-[-140px] top-24 h-[380px] w-[560px] opacity-[0.1] [mask-image:radial-gradient(circle,black,transparent_72%)]"
        />
        <div
          aria-hidden="true"
          className="motion-line pointer-events-none left-[8vw] top-[180px] w-[42vw] opacity-70"
        />
        <article className="section-shell pb-16 pt-5 md:pb-32 md:pt-8">
          <Reveal>
            <Link
              href="/archive"
              className="premium-link mb-8 inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-black/10 bg-[rgba(255,253,248,0.72)] px-3.5 py-2 text-[13px] font-medium text-[var(--foreground)] shadow-[0_10px_32px_rgba(16,18,18,0.05)] backdrop-blur transition hover:bg-white md:mb-10 md:min-h-0"
            >
              <ArrowLeft className="h-4 w-4 text-[var(--muted)]" />
              Back to archive
            </Link>
          </Reveal>

          <div className="grid gap-10 md:grid-cols-[0.76fr_1fr] md:items-end md:gap-16">
            <Reveal>
              <SectionLabel>{project.category}</SectionLabel>
              <HeadingReveal
                as="h1"
                lines={titleLines}
                mobileLines={mobileTitleLines}
                className="max-w-[820px] text-[clamp(2rem,9.8vw,4.45rem)] font-semibold leading-[1.03] tracking-[0] md:text-[clamp(2.8rem,6.8vw,6.45rem)] md:leading-[0.94]"
              />
            </Reveal>

            <Reveal className="max-w-[690px]" delay={0.08}>
              <div className="mb-5 flex flex-wrap gap-2 md:mb-6">
                <span className="rounded-[8px] border border-black/10 bg-white/45 px-2.5 py-1 text-[12px] font-medium text-[var(--sage)]">
                  {project.status}
                </span>
                <span className="rounded-[8px] border border-black/10 bg-white/45 px-2.5 py-1 text-[12px] font-medium text-[var(--muted)]">
                  {project.filter}
                </span>
              </div>
              <p className="text-[clamp(1rem,4.1vw,1.24rem)] leading-[1.58] text-[var(--muted-strong)] md:text-[clamp(1.12rem,2vw,1.55rem)] md:leading-[1.48]">
                {project.shortDescription}
              </p>
            </Reveal>
          </div>

          <Reveal>
            <div className="motion-surface mx-auto mt-10 max-w-[980px] rounded-[8px] md:mt-16">
              <ProjectVisual project={project} priority />
            </div>
          </Reveal>

          <Reveal>
            <div className="mt-10 grid gap-3 border-y border-black/10 py-4 md:mt-16 md:grid-cols-3 md:py-6">
              <div>
                <p className="editorial-kicker">Changed</p>
                <p className="mt-3 text-[0.98rem] leading-[1.58] text-[var(--muted-strong)]">
                  {project.impact}
                </p>
              </div>
              <div>
                <p className="editorial-kicker">Took away</p>
                <p className="mt-3 text-[0.98rem] leading-[1.58] text-[var(--muted-strong)]">
                  {project.learning}
                </p>
              </div>
              <div>
                <p className="editorial-kicker">Tools / frame</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tools.slice(0, 5).map((tool) => (
                    <span
                      key={tool}
                      className="rounded-[8px] border border-black/10 bg-[rgba(255,253,248,0.6)] px-2.5 py-1 text-[12px] text-[var(--muted-strong)]"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {isLivingSystem && (
            <Reveal>
              <section className="editorial-panel motion-surface relative mt-10 overflow-hidden p-5 md:mt-16 md:p-8">
                <div className="signal-grid pointer-events-none absolute inset-0 opacity-[0.13]" />
                <div className="relative z-10 grid gap-8 lg:grid-cols-[0.62fr_1fr] lg:items-end">
                  <div>
                    <p className="editorial-kicker">System logic</p>
                    <h2 className="mt-4 max-w-[580px] text-[clamp(1.8rem,5vw,3.5rem)] font-semibold leading-[1] tracking-[0]">
                      AI-assisted, human-directed.
                    </h2>
                    <p className="mt-5 max-w-[620px] text-[1rem] leading-[1.68] text-[var(--muted-strong)]">
                      The system is designed around human taste and approval:
                      AI accelerates drafts, structure, and implementation,
                      while direction, positioning, and publishing decisions
                      remain reviewed by me.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {livingSystemFlow.map((step, index) => (
                      <div
                        key={step}
                        className="motion-surface rounded-[8px] border border-black/10 bg-white/42 p-4 backdrop-blur"
                      >
                        <span className="text-[11px] font-semibold text-[var(--sage)]">
                          0{index + 1}
                        </span>
                        <p className="mt-4 text-[0.95rem] leading-[1.45] text-[var(--muted-strong)]">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </Reveal>
          )}

          <div className="mt-10 md:mt-24">
            {detailSections ? (
              <>
                {detailSections.map((section) => (
                  <DetailSection key={section.title} title={section.title}>
                    <div className="grid gap-4">
                      {section.body.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </DetailSection>
                ))}
                <DetailSection title="Working stack">
                  <div className="flex flex-wrap gap-2">
                    {project.tools.map((tool) => (
                      <span
                        key={tool}
                        className="min-h-8 rounded-[8px] border border-black/10 bg-white/45 px-2.5 py-1.5 text-[12px] text-[var(--muted-strong)]"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </DetailSection>
              </>
            ) : (
              <>
                <DetailSection title="Context">
                  <p>{project.context}</p>
                </DetailSection>
                <DetailSection title="Problem">
                  <p>{project.problem}</p>
                </DetailSection>
                <DetailSection title="Contribution">
                  <p>{project.contribution}</p>
                </DetailSection>
                <DetailSection title="Tools used">
                  <div className="flex flex-wrap gap-2">
                    {project.tools.map((tool) => (
                      <span
                        key={tool}
                        className="min-h-8 rounded-[8px] border border-black/10 bg-white/45 px-2.5 py-1.5 text-[12px] text-[var(--muted-strong)]"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </DetailSection>
                <DetailSection title="Impact / learning">
                  <div className="grid gap-4">
                    <p>{project.impact}</p>
                    <p>{project.learning}</p>
                  </div>
                </DetailSection>
                <DetailSection title="Future direction">
                  <p>{project.futureDirection}</p>
                </DetailSection>
              </>
            )}
          </div>

          <div className="mt-12 border-t border-black/10 pt-8">
            <Link
              href="/archive"
              className="interactive-underline group inline-flex items-center gap-2 text-[0.95rem] font-medium text-[var(--foreground)]"
            >
              View all archive items
              <ArrowUpRight className="h-4 w-4 text-[var(--muted)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
