import type { Metadata } from "next";
import { ArchiveExplorer } from "../components/ArchiveExplorer";
import { Footer } from "../components/Footer";
import { HeadingReveal } from "../components/HeadingReveal";
import { Reveal } from "../components/Reveal";
import { SectionLabel } from "../components/SectionLabel";
import { SiteNav } from "../components/SiteNav";
import { archiveProjects } from "../data/archive";

export const metadata: Metadata = {
  title: "Archive",
  description:
    "A structured archive of Applied AI, Data Science, automation, business intelligence, B.Tech projects, retail learning, and MBA case notes.",
};

export default function ArchivePage() {
  return (
    <>
      <SiteNav />
      <main className="relative overflow-hidden pt-24 md:pt-40">
        <div
          aria-hidden="true"
          className="premium-grid pointer-events-none absolute right-[-120px] top-28 h-[420px] w-[620px] opacity-[0.11] [mask-image:radial-gradient(circle,black,transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="orbital-line pointer-events-none left-[-180px] top-24 h-[320px] w-[520px] opacity-70"
        />
        <section className="section-shell pb-10 pt-5 md:pb-28 md:pt-8">
          <div className="grid gap-8 md:grid-cols-[0.78fr_1fr] md:items-end md:gap-16">
            <Reveal>
              <SectionLabel>Full archive</SectionLabel>
              <HeadingReveal
                as="h1"
                lines={["Applied work,", "organized by decision."]}
                mobileLines={[
                  "Applied work,",
                  "organized by",
                  "decision.",
                ]}
                className="max-w-[820px] text-[clamp(2rem,9.8vw,4.4rem)] font-semibold leading-[1.02] tracking-[0] md:text-[clamp(2.75rem,6.7vw,6.25rem)] md:leading-[0.94]"
              />
            </Reveal>
            <Reveal delay={0.08}>
              <p className="max-w-[700px] text-[clamp(0.98rem,4vw,1.24rem)] leading-[1.62] text-[var(--muted-strong)]">
                This archive is structured to grow over time. It includes
                Applied AI, Data Science, automation work, market
                intelligence, engineering projects, retail learning, and MBA
                case notes, with each item framed by the decision it supports.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="section-shell pb-16 md:pb-36">
          <ArchiveExplorer projects={archiveProjects} />
        </section>
      </main>
      <Footer />
    </>
  );
}
