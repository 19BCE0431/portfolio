import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "../../components/Footer";
import { HeadingReveal } from "../../components/HeadingReveal";
import { Reveal } from "../../components/Reveal";
import { SectionLabel } from "../../components/SectionLabel";
import { SiteNav } from "../../components/SiteNav";
import { archiveProjects, getProjectBySlug } from "../../data/archive";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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
      <section className="grid gap-4 border-t border-black/10 py-6 md:grid-cols-[220px_1fr] md:gap-12 md:py-8">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          {title}
        </h2>
        <div className="max-w-[780px] text-[clamp(1rem,4.2vw,1.08rem)] leading-[1.68] text-[var(--muted-strong)] md:text-[clamp(1.02rem,1.4vw,1.16rem)]">
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

  return (
    <>
      <SiteNav />
      <main className="pt-28 md:pt-40">
        <article className="section-shell pb-20 pt-6 md:pb-32 md:pt-8">
          <Reveal>
            <Link
              href="/archive"
              className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-black/10 bg-white/45 px-3.5 py-2 text-[13px] font-medium text-[var(--foreground)] shadow-[0_10px_32px_rgba(17,19,19,0.05)] backdrop-blur transition hover:bg-white md:mb-10 md:min-h-0"
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
                className="max-w-[820px] text-[clamp(2.25rem,10.2vw,4.45rem)] font-semibold leading-[1] tracking-[-0.01em] md:text-[clamp(2.8rem,6.8vw,6.45rem)] md:leading-[0.94]"
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
              <p className="text-[clamp(1.06rem,4.6vw,1.24rem)] leading-[1.56] text-[var(--muted-strong)] md:text-[clamp(1.12rem,2vw,1.55rem)] md:leading-[1.48]">
                {project.shortDescription}
              </p>
            </Reveal>
          </div>

          <div className="mt-12 md:mt-24">
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
          </div>

          <div className="mt-12 border-t border-black/10 pt-8">
            <Link
              href="/archive"
              className="group inline-flex items-center gap-2 text-[0.95rem] font-medium text-[var(--foreground)]"
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
