import { ArrowLeft, Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "../../components/Footer";
import { HeadingReveal } from "../../components/HeadingReveal";
import { Reveal } from "../../components/Reveal";
import { SectionLabel } from "../../components/SectionLabel";
import { SiteNav } from "../../components/SiteNav";
import {
  getPublishedJournalPost,
  publishedJournalPosts,
} from "../../data/journal";

type JournalDetailProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return publishedJournalPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: JournalDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPublishedJournalPost(slug);

  if (!post) {
    return {
      title: "Journal note not found",
    };
  }

  return {
    title: post.title,
    description: post.summary,
  };
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default async function JournalDetailPage({ params }: JournalDetailProps) {
  const { slug } = await params;
  const post = getPublishedJournalPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <SiteNav />
      <main className="relative overflow-hidden pt-24 md:pt-40">
        <div
          aria-hidden="true"
          className="premium-grid pointer-events-none absolute right-[-140px] top-24 h-[380px] w-[560px] opacity-[0.1] [mask-image:radial-gradient(circle,black,transparent_72%)]"
        />
        <article className="section-shell pb-16 pt-5 md:pb-32 md:pt-8">
          <Reveal>
            <Link
              href="/journal"
              className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-black/10 bg-white/45 px-3.5 py-2 text-[13px] font-medium text-[var(--foreground)] shadow-[0_10px_32px_rgba(17,19,19,0.05)] backdrop-blur transition hover:bg-white md:mb-10 md:min-h-0"
            >
              <ArrowLeft className="h-4 w-4 text-[var(--muted)]" />
              Back to journal
            </Link>
          </Reveal>

          <div className="grid gap-10 md:grid-cols-[0.78fr_1fr] md:items-end md:gap-16">
            <Reveal>
              <SectionLabel>Journal</SectionLabel>
              <HeadingReveal
                as="h1"
                lines={[post.title]}
                className="max-w-[880px] text-[clamp(2.05rem,10vw,4.6rem)] font-semibold leading-[1.02] tracking-[0] md:text-[clamp(2.8rem,6.8vw,6.45rem)] md:leading-[0.94]"
              />
            </Reveal>
            <Reveal className="max-w-[690px]" delay={0.08}>
              <div className="mb-5 flex flex-wrap gap-2 md:mb-6">
                <span className="rounded-[8px] border border-black/10 bg-white/45 px-2.5 py-1 text-[12px] font-medium text-[var(--sage)]">
                  {formatDate(post.date)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-black/10 bg-white/45 px-2.5 py-1 text-[12px] font-medium text-[var(--muted)]">
                  <Clock className="h-3.5 w-3.5" />
                  {post.readingTime}
                </span>
              </div>
              <p className="text-[clamp(1rem,4.1vw,1.24rem)] leading-[1.58] text-[var(--muted-strong)] md:text-[clamp(1.12rem,2vw,1.55rem)] md:leading-[1.48]">
                {post.summary}
              </p>
            </Reveal>
          </div>

          <div className="mt-10 grid gap-10 md:mt-20 md:grid-cols-[0.32fr_1fr] md:gap-16">
            <aside className="md:sticky md:top-32 md:h-max">
              <Reveal>
                <div className="rounded-[8px] border border-black/10 bg-white/45 p-4 backdrop-blur">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-[8px] border border-black/10 px-2.5 py-1 text-[11px] text-[var(--muted-strong)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            </aside>

            <div className="max-w-[780px]">
              <Reveal>
                <p className="text-[1.08rem] leading-[1.72] text-[var(--foreground)] md:text-[1.22rem]">
                  {post.intro}
                </p>
              </Reveal>

              <div className="mt-10 divide-y divide-black/10 border-y border-black/10">
                {post.sections.map((section) => (
                  <Reveal key={section.heading}>
                    <section className="py-7">
                      <h2 className="text-[1.35rem] font-semibold leading-[1.12]">
                        {section.heading}
                      </h2>
                      <div className="mt-4 grid gap-4 text-[1rem] leading-[1.72] text-[var(--muted-strong)]">
                        {section.body.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    </section>
                  </Reveal>
                ))}
              </div>

              <Reveal>
                <section className="mt-10 rounded-[8px] border border-black/10 bg-white/45 p-5 backdrop-blur md:p-6">
                  <h2 className="text-[1.2rem] font-semibold">Key takeaways</h2>
                  <ul className="mt-4 grid gap-3 text-[0.98rem] leading-[1.62] text-[var(--muted-strong)]">
                    {post.takeaways.map((takeaway) => (
                      <li key={takeaway} className="border-t border-black/10 pt-3">
                        {takeaway}
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>

              <Reveal>
                <section className="mt-6 rounded-[8px] border border-black/10 bg-[rgba(251,251,248,0.72)] p-5 backdrop-blur md:p-6">
                  <h2 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    LinkedIn adaptation note
                  </h2>
                  <p className="mt-3 text-[0.98rem] leading-[1.64] text-[var(--muted-strong)]">
                    {post.linkedInNote}
                  </p>
                </section>
              </Reveal>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
