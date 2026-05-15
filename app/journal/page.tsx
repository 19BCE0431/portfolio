import { ArrowUpRight, Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "../components/Footer";
import { HeadingReveal } from "../components/HeadingReveal";
import { Reveal } from "../components/Reveal";
import { SectionLabel } from "../components/SectionLabel";
import { SiteNav } from "../components/SiteNav";
import {
  draftJournalPosts,
  publishedJournalPosts,
  type JournalPost,
} from "../data/journal";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Research notes, product teardowns, MBA reflections, AI and business insights, and market observations.",
};

function PostCard({ post }: { post: JournalPost }) {
  const isPublished = post.status === "published";
  const content = (
    <article className="group premium-card-shadow relative flex h-full min-h-[260px] flex-col justify-between overflow-hidden rounded-[8px] border border-black/10 bg-[rgba(251,251,248,0.76)] p-5 backdrop-blur transition duration-500 hover:border-black/20 hover:bg-[rgba(251,251,248,0.96)] sm:p-6">
      <span className="pointer-events-none absolute inset-x-6 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-black/25 to-transparent transition-transform duration-500 group-hover:scale-x-100" />
      <div>
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="rounded-[8px] border border-black/10 bg-white/45 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--sage)]">
            {post.status}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[12px] text-[var(--muted)]">
            <Clock className="h-3.5 w-3.5" />
            {post.readingTime}
          </span>
        </div>
        <h2 className="text-[clamp(1.35rem,6vw,2rem)] font-semibold leading-[1.08] tracking-[0]">
          {post.title}
        </h2>
        <p className="mt-4 text-[0.95rem] leading-[1.62] text-[var(--muted)]">
          {post.summary}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
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
      <div className="mt-7 flex items-center justify-between border-t border-black/10 pt-4 text-[0.9rem] font-medium text-[var(--foreground)]">
        <span>{isPublished ? "Read note" : "Draft queue"}</span>
        <ArrowUpRight className="h-4 w-4 text-[var(--muted)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
    </article>
  );

  if (!isPublished) {
    return <div aria-disabled="true">{content}</div>;
  }

  return (
    <Link href={`/journal/${post.slug}`} className="block h-full">
      {content}
    </Link>
  );
}

export default function JournalPage() {
  return (
    <>
      <SiteNav />
      <main className="relative overflow-hidden pt-24 md:pt-40">
        <div
          aria-hidden="true"
          className="premium-grid pointer-events-none absolute right-[-140px] top-24 h-[420px] w-[620px] opacity-[0.1] [mask-image:radial-gradient(circle,black,transparent_72%)]"
        />
        <section className="section-shell pb-12 pt-5 md:pb-24 md:pt-8">
          <div className="grid gap-8 md:grid-cols-[0.78fr_1fr] md:items-end md:gap-16">
            <Reveal>
              <SectionLabel>Journal</SectionLabel>
              <HeadingReveal
                as="h1"
                lines={["Notes for product,", "AI, markets, and MBA work."]}
                mobileLines={["Notes for", "product, AI,", "markets, and", "MBA work."]}
                className="max-w-[860px] text-[clamp(2rem,9.8vw,4.4rem)] font-semibold leading-[1.02] tracking-[0] md:text-[clamp(2.75rem,6.7vw,6.25rem)] md:leading-[0.94]"
              />
            </Reveal>
            <Reveal delay={0.08}>
              <p className="max-w-[700px] text-[clamp(0.98rem,4vw,1.24rem)] leading-[1.62] text-[var(--muted-strong)]">
                A future-ready space for research notes, product teardowns, MBA
                reflections, AI and business insights, market observations, and
                LinkedIn-ready thinking. Drafts are intentionally labeled until
                they are ready to publish.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="section-shell pb-16 md:pb-28">
          <Reveal>
            <div className="mb-5 flex items-end justify-between gap-4">
              <h2 className="text-[1.2rem] font-semibold">Published notes</h2>
              <span className="text-[12px] uppercase tracking-[0.16em] text-[var(--muted)]">
                Public
              </span>
            </div>
          </Reveal>
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            {publishedJournalPosts.map((post) => (
              <Reveal key={post.slug}>
                <PostCard post={post} />
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mb-5 mt-12 flex items-end justify-between gap-4 border-t border-black/10 pt-8">
              <h2 className="text-[1.2rem] font-semibold">Draft queue</h2>
              <span className="text-[12px] uppercase tracking-[0.16em] text-[var(--muted)]">
                Not public posts yet
              </span>
            </div>
          </Reveal>
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
            {draftJournalPosts.map((post) => (
              <Reveal key={post.slug}>
                <PostCard post={post} />
              </Reveal>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
