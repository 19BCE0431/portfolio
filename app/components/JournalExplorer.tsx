"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, CalendarDays, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { JournalCategory, JournalPost } from "../data/journal";

export function JournalExplorer({
  posts,
  categories,
}: {
  posts: JournalPost[];
  categories: JournalCategory[];
}) {
  const [activeCategory, setActiveCategory] = useState<JournalCategory | "All">(
    "All",
  );
  const shouldReduceMotion = useReducedMotion();

  const visiblePosts = useMemo(() => {
    if (activeCategory === "All") return posts;
    return posts.filter((post) => post.category === activeCategory);
  }, [activeCategory, posts]);

  if (!posts.length) {
    return (
      <div className="editorial-panel relative overflow-hidden p-6 text-center md:p-10">
        <div className="signal-grid pointer-events-none absolute inset-0 opacity-[0.12]" />
        <p className="text-[1.25rem] font-semibold">
          Long-form notes will appear here once they are reviewed and published.
        </p>
        <p className="mx-auto mt-3 max-w-[560px] text-[0.98rem] leading-[1.62] text-[var(--muted)]">
          The journal is ready for weekly insight publishing. Drafts and review
          posts stay private until they are approved.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="sticky top-[74px] z-20 mb-6 py-2 md:top-[88px] md:mb-12">
        <div className="premium-card-shadow fine-border mobile-flow-rail min-w-0 rounded-[8px] border border-black/10 bg-[rgba(251,251,248,0.9)] p-1.5 backdrop-blur-2xl sm:mx-0 sm:flex sm:flex-wrap sm:overflow-visible sm:px-1 sm:gap-2 sm:p-1">
          {(["All", ...categories] as const).map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              aria-pressed={activeCategory === category}
              className={`premium-link relative min-h-10 shrink-0 overflow-hidden rounded-[7px] px-3 py-2 text-center text-[11px] font-medium leading-[1.18] transition-all duration-300 sm:min-h-0 sm:whitespace-nowrap sm:px-3.5 sm:text-[12px] ${
                activeCategory === category
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted)] hover:bg-black/[0.04] hover:text-[var(--foreground)]"
              }`}
            >
              {activeCategory === category && !shouldReduceMotion && (
                <motion.span
                  layoutId="journal-filter-active"
                  className="absolute inset-0 rounded-[6px] bg-black/[0.07]"
                  transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
              {activeCategory === category && shouldReduceMotion && (
                <span className="absolute inset-0 rounded-[6px] bg-black/[0.07]" />
              )}
              <span className="relative z-10">{category}</span>
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visiblePosts.map((post) => (
            <motion.article
              key={post.slug}
              layout
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
              whileHover={shouldReduceMotion ? undefined : { y: -4 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/journal/${post.slug}`}
                className="group editorial-panel motion-surface hover-light relative flex h-full min-h-[250px] flex-col justify-between overflow-hidden p-4 transition duration-500 hover:border-black/20 hover:bg-[rgba(251,251,248,0.96)] hover:shadow-[0_34px_94px_rgba(17,19,19,0.09)] focus:outline-none focus:ring-2 focus:ring-black/15 sm:min-h-[310px] sm:p-6"
              >
                <span className="pointer-events-none absolute inset-x-6 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-black/25 to-transparent transition-transform duration-500 group-hover:scale-x-100" />
                <div>
                  {post.heroImage && (
                    <div className="relative mb-4 aspect-[1.7] overflow-hidden rounded-[8px] border border-black/10 bg-[var(--surface-cool)] shadow-[inset_0_1px_0_rgba(255,255,255,0.58)] sm:mb-5">
                      <Image
                        src={post.heroImage}
                        alt={post.altText || post.heroImageAlt || post.title}
                        fill
                        sizes="(max-width: 768px) 92vw, (max-width: 1280px) 45vw, 32vw"
                        unoptimized={post.heroImage.endsWith(".svg")}
                        className={`transition duration-700 ease-[var(--ease)] group-hover:scale-[1.025] ${
                          post.heroImage.includes("trusted-employee-system-note")
                            ? "object-contain p-2"
                            : "object-cover"
                        }`}
                      />
                    </div>
                  )}
                  <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-6">
                    <span className="rounded-[8px] border border-black/10 bg-white/45 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--sage)]">
                      {post.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-[var(--muted)]">
                      <Clock className="h-3.5 w-3.5" />
                      {post.readingTime}
                    </span>
                  </div>
                  <h2 className="text-[clamp(1.18rem,5.3vw,2rem)] font-semibold leading-[1.12] tracking-[0]">
                    {post.title}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-[0.92rem] leading-[1.56] text-[var(--muted)] sm:mt-4 sm:line-clamp-none sm:text-[0.95rem] sm:leading-[1.62]">
                    {post.summary}
                  </p>
                  {post.keyInsight && (
                    <p className="journal-row-insight mt-4 line-clamp-3 text-[0.84rem] leading-[1.52] text-[var(--muted-strong)]">
                      {post.keyInsight}
                    </p>
                  )}
                </div>

                <div className="mt-5 border-t border-black/10 pt-4 sm:mt-7">
                  <div className="mb-3 flex items-center gap-2 text-[12px] text-[var(--muted)] sm:mb-4">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(post.date)}
                  </div>
                  <div className="flex items-center justify-between gap-4 text-[0.9rem] font-medium text-[var(--foreground)]">
                    <span>Read the full note</span>
                    <ArrowUpRight className="h-4 w-4 text-[var(--muted)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
