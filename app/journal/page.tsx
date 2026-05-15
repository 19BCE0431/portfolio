import type { Metadata } from "next";
import { Footer } from "../components/Footer";
import { HeadingReveal } from "../components/HeadingReveal";
import { JournalExplorer } from "../components/JournalExplorer";
import { Reveal } from "../components/Reveal";
import { SectionLabel } from "../components/SectionLabel";
import { SiteNav } from "../components/SiteNav";
import {
  getVisibleJournalPosts,
  journalCategories,
} from "../data/journal";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "A premium insight library for products, markets, AI, consumer behavior, marketing lessons, MBA learning notes, and business decisions.",
};

export default function JournalPage() {
  const posts = getVisibleJournalPosts();

  return (
    <>
      <SiteNav />
      <main className="relative overflow-hidden pt-22 md:pt-40">
        <div
          aria-hidden="true"
          className="premium-grid pointer-events-none absolute right-[-140px] top-24 h-[420px] w-[620px] opacity-[0.1] [mask-image:radial-gradient(circle,black,transparent_72%)]"
        />
        <section className="section-shell pb-9 pt-5 md:pb-24 md:pt-8">
          <div className="grid gap-8 md:grid-cols-[0.78fr_1fr] md:items-end md:gap-16">
            <Reveal>
              <SectionLabel>Journal</SectionLabel>
              <HeadingReveal
                as="h1"
                lines={["A sharper library", "for business thinking."]}
                mobileLines={["A sharper", "library for", "business", "thinking."]}
                className="max-w-[860px] text-[clamp(2rem,9vw,4.4rem)] font-semibold leading-[1.03] tracking-[0] md:text-[clamp(2.75rem,6.7vw,6.25rem)] md:leading-[0.94]"
              />
            </Reveal>
            <Reveal delay={0.08}>
              <p className="max-w-[700px] text-[clamp(0.96rem,3.7vw,1.24rem)] leading-[1.58] text-[var(--muted-strong)]">
                Notes on products, markets, AI, Indian consumer behavior,
                marketing lessons, MBA learning, and business decisions. This
                is a thinking-in-public space; drafts stay private until they
                are reviewed and worth publishing.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {journalCategories.slice(0, 5).map((category) => (
                  <span
                    key={category}
                    className="rounded-[8px] border border-black/10 bg-white/45 px-2.5 py-1 text-[12px] text-[var(--muted-strong)] backdrop-blur"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="section-shell pb-14 md:pb-28">
          <JournalExplorer posts={posts} categories={journalCategories} />
        </section>
      </main>
      <Footer />
    </>
  );
}
