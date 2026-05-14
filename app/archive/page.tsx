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
    "A structured archive of applied AI systems, automation, business intelligence, B.Tech projects, retail learning, and MBA case notes.",
};

export default function ArchivePage() {
  return (
    <>
      <SiteNav />
      <main className="pt-28 md:pt-40">
        <section className="section-shell pb-14 pt-6 md:pb-28 md:pt-8">
          <div className="grid gap-8 md:grid-cols-[0.78fr_1fr] md:items-end md:gap-16">
            <Reveal>
              <SectionLabel>Full archive</SectionLabel>
              <HeadingReveal
                as="h1"
                lines={["Applied systems,", "organized by problem."]}
                mobileLines={[
                  "Applied",
                  "systems,",
                  "organized by",
                  "problem.",
                ]}
                className="max-w-[820px] text-[clamp(2.35rem,10.4vw,4.4rem)] font-semibold leading-[1] tracking-[-0.01em] md:text-[clamp(2.75rem,6.7vw,6.25rem)] md:leading-[0.94]"
              />
            </Reveal>
            <Reveal delay={0.08}>
              <p className="max-w-[700px] text-[clamp(1.04rem,1.72vw,1.24rem)] leading-[1.64] text-[var(--muted-strong)]">
                This archive is structured to grow over time. It includes
                applied AI and data systems, automation work, market
                intelligence, engineering projects, retail learning, and MBA
                case notes.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="section-shell pb-20 md:pb-36">
          <ArchiveExplorer projects={archiveProjects} />
        </section>
      </main>
      <Footer />
    </>
  );
}
