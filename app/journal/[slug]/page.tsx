import { ArrowLeft, ArrowUpRight, Clock } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "../../components/Footer";
import { HeadingReveal } from "../../components/HeadingReveal";
import { CopyArticleLink } from "../../components/CopyArticleLink";
import { Reveal } from "../../components/Reveal";
import { SectionLabel } from "../../components/SectionLabel";
import { SiteNav } from "../../components/SiteNav";
import {
  getRelatedJournalPosts,
  getVisibleJournalPost,
  getVisibleJournalPosts,
  type JournalBlock,
} from "../../data/journal";

type JournalDetailProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getVisibleJournalPosts().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: JournalDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getVisibleJournalPost(slug);

  if (!post) {
    return {
      title: "Journal note not found",
    };
  }

  return {
    title: post.title,
    description: post.summary,
    alternates: post.canonicalUrl ? { canonical: post.canonicalUrl } : undefined,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.date,
      images: post.ogImage || post.heroImage
        ? [
            {
              url: post.ogImage || post.heroImage || "",
              alt: post.altText || post.heroImageAlt || post.title,
            },
          ]
        : undefined,
    },
  };
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function renderBlock(block: JournalBlock) {
  if (block.type === "heading") {
    return (
      <h2
        key={block.text}
        id={sectionId(block.text)}
        className="scroll-mt-28 pt-5 text-[clamp(1.28rem,5vw,2.15rem)] font-semibold leading-[1.15] tracking-[0]"
      >
        {block.text}
      </h2>
    );
  }

  if (block.type === "list") {
    return (
      <ul key={block.items.join("|")} className="grid gap-3">
        {block.items.map((item) => (
          <li
            key={item}
            className="border-l border-black/15 pl-4 text-[0.97rem] leading-[1.68] text-[var(--muted-strong)] md:text-[1rem] md:leading-[1.72]"
          >
            {item}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p
      key={block.text}
      className="text-[0.98rem] leading-[1.72] text-[var(--muted-strong)] md:text-[1.08rem] md:leading-[1.78]"
    >
      {block.text}
    </p>
  );
}

function sectionId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function takeawaysFromPost(blocks: JournalBlock[]) {
  const index = blocks.findIndex(
    (block) => block.type === "heading" && /takeaways/i.test(block.text),
  );

  if (index < 0) return [];
  const nextList = blocks.slice(index + 1).find((block) => block.type === "list");
  return nextList?.type === "list" ? nextList.items.slice(0, 4) : [];
}

export default async function JournalDetailPage({ params }: JournalDetailProps) {
  const { slug } = await params;
  const post = getVisibleJournalPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedJournalPosts(post);
  const shareUrl = post.canonicalUrl || `/journal/${post.slug}`;
  const takeaways = takeawaysFromPost(post.blocks);
  const sectionHeadings = post.blocks.filter((block) => block.type === "heading").slice(0, 6);
  const hasLinkedInDraft = Boolean(post.slug);

  return (
    <>
      <SiteNav />
      <main className="relative overflow-hidden pt-22 md:pt-40">
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

          <div className="grid gap-8 md:grid-cols-[0.78fr_1fr] md:items-end md:gap-16">
            <Reveal>
              <SectionLabel>{post.category}</SectionLabel>
              <HeadingReveal
                as="h1"
                lines={[post.title]}
                className="max-w-[900px] text-[clamp(2rem,8.4vw,4.6rem)] font-semibold leading-[1.04] tracking-[0] md:text-[clamp(2.8rem,6.8vw,6.45rem)] md:leading-[0.94]"
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
              <p className="text-[clamp(1rem,3.9vw,1.24rem)] leading-[1.58] text-[var(--muted-strong)] md:text-[clamp(1.12rem,2vw,1.55rem)] md:leading-[1.48]">
                {post.summary}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <CopyArticleLink path={shareUrl} />
                {post.sourceLinks.length > 0 && (
                  <a
                    href="#sources"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] border border-black/10 bg-white/45 px-3.5 py-2 text-[13px] font-medium text-[var(--foreground)] shadow-[0_10px_32px_rgba(17,19,19,0.05)] backdrop-blur transition hover:bg-white"
                  >
                    View sources
                  </a>
                )}
              </div>
            </Reveal>
          </div>

          {post.heroImage && (
            <Reveal>
              <figure className="mt-10 overflow-hidden rounded-[8px] border border-black/10 bg-[rgba(251,251,248,0.72)] p-2 premium-card-shadow backdrop-blur md:mt-16">
                <div className="relative aspect-[16/9] overflow-hidden rounded-[6px] bg-[var(--surface-cool)]">
                  <Image
                    src={post.heroImage}
                    alt={post.altText || post.heroImageAlt || post.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 1180px"
                    className="object-cover"
                  />
                </div>
                {(post.imageCredit || post.imageLicense) && (
                  <figcaption className="px-2 py-3 text-[12px] leading-[1.5] text-[var(--muted)]">
                    {[post.imageCredit, post.imageLicense]
                      .filter(Boolean)
                      .join(" · ")}
                  </figcaption>
                )}
              </figure>
            </Reveal>
          )}

          <div className="mt-10 grid gap-8 md:mt-20 md:grid-cols-[0.32fr_1fr] md:gap-16">
            <aside className="md:sticky md:top-32 md:h-max">
              <Reveal>
                <div className="rounded-[8px] border border-black/10 bg-white/45 p-4 backdrop-blur">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    Reading map
                  </p>
                  <div className="grid gap-2 text-[0.9rem] leading-[1.5] text-[var(--muted-strong)]">
                    <p>{post.category}</p>
                    <p>{post.readingTime}</p>
                    <p>{post.tags.slice(0, 3).join(" · ")}</p>
                  </div>
                </div>
              </Reveal>
              {sectionHeadings.length > 2 && (
                <Reveal>
                  <nav className="mt-3 hidden rounded-[8px] border border-black/10 bg-white/35 p-4 backdrop-blur md:block">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                      Sections
                    </p>
                    <div className="grid gap-2 text-[0.88rem] leading-[1.45] text-[var(--muted-strong)]">
                      {sectionHeadings.map((heading) => (
                        <a
                          key={heading.text}
                          href={`#${sectionId(heading.text)}`}
                          className="transition hover:text-[var(--foreground)]"
                        >
                          {heading.text}
                        </a>
                      ))}
                    </div>
                  </nav>
                </Reveal>
              )}
            </aside>

            <div className="max-w-[780px]">
              {post.keyInsight && (
                <Reveal>
                  <section className="premium-card-shadow mb-5 rounded-[8px] border border-black/10 bg-[rgba(251,251,248,0.74)] p-4 backdrop-blur md:mb-9 md:p-6">
                    <h2 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                      Key insight
                    </h2>
                    <p className="mt-3 text-[1.1rem] leading-[1.58] text-[var(--foreground)] md:text-[1.28rem]">
                      {post.keyInsight}
                    </p>
                  </section>
                </Reveal>
              )}

              {takeaways.length > 0 && (
                <Reveal>
                  <section className="mb-7 rounded-[8px] border border-black/10 bg-white/45 p-4 backdrop-blur md:mb-9 md:p-6">
                    <h2 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                      Key takeaways
                    </h2>
                    <ul className="mt-4 grid gap-3">
                      {takeaways.map((takeaway) => (
                        <li
                          key={takeaway}
                          className="border-t border-black/10 pt-3 text-[0.95rem] leading-[1.6] text-[var(--muted-strong)]"
                        >
                          {takeaway}
                        </li>
                      ))}
                    </ul>
                  </section>
                </Reveal>
              )}

              <Reveal>
                <div className="grid gap-4 border-y border-black/10 py-7 md:gap-5 md:py-8">
                  {post.blocks.map(renderBlock)}
                </div>
              </Reveal>

              {post.sourceLinks.length > 0 && (
                <Reveal>
                  <section
                    id="sources"
                    className="mt-8 scroll-mt-28 rounded-[8px] border border-black/10 bg-white/45 p-4 backdrop-blur md:mt-10 md:p-6"
                  >
                    <h2 className="text-[1.2rem] font-semibold">
                      Sources / Further Reading
                    </h2>
                    <div className="mt-4 grid gap-3">
                      {post.sourceLinks.map((source) => (
                        <a
                          key={`${source.title}-${source.url}`}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group rounded-[8px] border border-black/10 bg-white/35 p-4 transition hover:bg-white/70"
                        >
                          <span className="block text-[0.98rem] font-medium text-[var(--foreground)]">
                            {source.title}
                          </span>
                          <span className="mt-1 block text-[0.86rem] leading-[1.5] text-[var(--muted)]">
                            {[source.publisher, source.datePublished]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </a>
                      ))}
                    </div>
                  </section>
                </Reveal>
              )}

              {hasLinkedInDraft && (
                <Reveal>
                <section className="mt-6 rounded-[8px] border border-black/10 bg-[rgba(251,251,248,0.72)] p-5 backdrop-blur md:p-6">
                  <h2 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    Short version for LinkedIn
                  </h2>
                  <p className="mt-3 text-[0.98rem] leading-[1.64] text-[var(--muted-strong)]">
                    This article can be adapted into a shorter LinkedIn post
                    with the main insight, 3-5 crisp points, and a link back to
                    the full analysis.
                  </p>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-[0.95rem] font-medium text-[var(--foreground)]"
                  >
                    Share article
                    <ArrowUpRight className="h-4 w-4 text-[var(--muted)]" />
                  </a>
                </section>
                </Reveal>
              )}

              {relatedPosts.length > 0 && (
                <Reveal>
                  <section className="mt-10 border-t border-black/10 pt-8">
                    <h2 className="text-[1.2rem] font-semibold">
                      Related posts
                    </h2>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {relatedPosts.map((related) => (
                        <Link
                          key={related.slug}
                          href={`/journal/${related.slug}`}
                          className="rounded-[8px] border border-black/10 bg-white/45 p-4 transition hover:bg-white/75"
                        >
                          <span className="text-[0.82rem] text-[var(--sage)]">
                            {related.category}
                          </span>
                          <span className="mt-2 block font-medium leading-[1.25]">
                            {related.title}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </section>
                </Reveal>
              )}
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
