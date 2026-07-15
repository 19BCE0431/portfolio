import type { Metadata } from "next";
import { ArchiveExplorer } from "../components/ArchiveExplorer";
import { Footer } from "../components/Footer";
import { HeadingReveal } from "../components/HeadingReveal";
import { Reveal } from "../components/Reveal";
import { SectionLabel } from "../components/SectionLabel";
import { archiveProjects } from "../data/archive";

export const metadata: Metadata = {
  title: "Archive",
  description:
    "A project archive covering product thinking, Applied AI, automation, market intelligence, MBA work, and the lessons each project left behind.",
  alternates: {
    canonical: "/archive",
  },
  openGraph: {
    title: "Archive",
    description:
      "Applied AI, automation, market intelligence, MBA work, and product thinking from Mohit Sai Krishna.",
    url: "/archive",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Mohit Sai Krishna project archive preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Archive",
    description:
      "Applied AI, automation, market intelligence, MBA work, and product thinking from Mohit Sai Krishna.",
    images: ["/twitter-image"],
  },
};

export default function ArchivePage() {
  const buildingCount = archiveProjects.filter((project) =>
    /building|built|operational|shipped/i.test(project.status),
  ).length;

  return (
    <>
      <main className="relative overflow-hidden pt-24 md:pt-32">
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
                lines={["Work that shaped", "how I think."]}
                mobileLines={[
                  "Work that",
                  "shaped how",
                  "I think.",
                ]}
                className="max-w-[820px] text-[clamp(2rem,9.8vw,4.4rem)] font-semibold leading-[1.02] tracking-[0] md:text-[clamp(2.75rem,6.7vw,6.25rem)] md:leading-[0.94]"
              />
            </Reveal>
            <Reveal delay={0.08}>
              <p className="max-w-[700px] text-[clamp(0.98rem,4vw,1.24rem)] leading-[1.62] text-[var(--muted-strong)]">
                A working library of applied AI, automation, retail learning,
                MBA notes, and market observations. Each item is framed by the
                problem, the decision it supported, and the lesson I still carry
                from it.
              </p>
              <div className="mt-7 grid gap-2 sm:grid-cols-3">
                {[
                  ["Items", archiveProjects.length],
                  ["Applied / built", buildingCount],
                  ["Living system", "01"],
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
          <ArchiveExplorer projects={archiveProjects} />
        </section>
      </main>
      <Footer />
    </>
  );
}
