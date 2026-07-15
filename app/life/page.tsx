import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Footer } from "../components/Footer";
import { HeadingReveal } from "../components/HeadingReveal";
import { LifeGallery } from "../components/LifeGallery";
import { Reveal } from "../components/Reveal";
import { SectionLabel } from "../components/SectionLabel";
import { galleryClusters, lifeGalleryImages } from "../data/media";

export const metadata: Metadata = {
  title: "Life, Lightly Documented",
  description:
    "A small optional gallery of personal frames from campus, trips, hills, friends, and quieter moments.",
  alternates: {
    canonical: "/life",
  },
  openGraph: {
    title: "Life, Lightly Documented",
    description:
      "A small edited gallery of campus, travel, hills, friends, and quieter personal frames.",
    url: "/life",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Mohit Sai Krishna life gallery preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Life, Lightly Documented",
    description:
      "A small edited gallery of campus, travel, hills, friends, and quieter personal frames.",
    images: ["/twitter-image"],
  },
};

const auditedImageCount = 48;
const curatedImageCount = 16;
const archivedImageCount = auditedImageCount - curatedImageCount;

export default function LifePage() {
  return (
    <>
      <main className="relative overflow-hidden pt-24 md:pt-32">
        <div
          aria-hidden="true"
          className="premium-grid pointer-events-none absolute right-[-120px] top-28 h-[420px] w-[620px] opacity-[0.1] [mask-image:radial-gradient(circle,black,transparent_72%)]"
        />
        <section className="section-shell pb-10 pt-5 md:pb-20 md:pt-8">
          <Reveal>
            <Link
              href="/#personal"
              className="premium-link mb-8 inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[13px] font-medium text-[var(--foreground)] shadow-[0_10px_32px_rgba(0,0,0,0.3)] backdrop-blur transition hover:border-white/18 hover:bg-white/[0.08] md:mb-10 md:min-h-0"
            >
              <ArrowLeft className="h-4 w-4 text-[var(--muted)]" />
              Back to portfolio
            </Link>
          </Reveal>

          <div className="grid gap-8 md:grid-cols-[0.78fr_1fr] md:items-end md:gap-16">
            <Reveal>
              <SectionLabel>Life, lightly documented</SectionLabel>
              <HeadingReveal
                as="h1"
                lines={["A few frames", "from outside", "the resume."]}
                mobileLines={["A few frames", "from outside", "the resume."]}
                className="max-w-[840px] text-[clamp(2.1rem,9.6vw,4.6rem)] font-semibold leading-[1.03] tracking-[0] md:text-[clamp(2.75rem,6.7vw,6.25rem)] md:leading-[0.94]"
              />
            </Reveal>
            <Reveal delay={0.08}>
              <div className="grid gap-6">
                <div>
                  <p className="max-w-[700px] text-[clamp(0.98rem,3.7vw,1.24rem)] leading-[1.62] text-[var(--muted-strong)]">
                    A small edited gallery, not a photo dump. These frames add
                    warmth, rhythm, and context to the professional story while
                    keeping the private parts private.
                  </p>
                  <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                    {[
                      ["Audited", auditedImageCount],
                      ["Curated", curatedImageCount],
                      ["Held back", archivedImageCount],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="motion-surface rounded-[8px] border border-white/10 bg-white/[0.04] px-2 py-3"
                      >
                        <p className="text-[1.15rem] font-semibold leading-none">
                          {value}
                        </p>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/#contact"
                    className="interactive-underline mt-6 inline-flex items-center gap-2 text-[0.95rem] font-medium text-[var(--foreground)]"
                  >
                    Start a conversation
                    <ArrowUpRight className="h-4 w-4 text-[var(--muted)]" />
                  </Link>
                </div>
                <figure className="editorial-panel motion-surface overflow-hidden p-2">
                  <div className="relative aspect-[1.55] overflow-hidden rounded-[6px] bg-[var(--surface-cool)]">
                    <Image
                      src={lifeGalleryImages[0].src}
                      alt={lifeGalleryImages[0].alt}
                      fill
                      priority
                      sizes="(max-width: 768px) 92vw, 42vw"
                      className="media-lift object-cover"
                    />
                  </div>
                  <figcaption className="px-1 py-3 text-[0.86rem] leading-[1.5] text-[var(--muted)]">
                    {lifeGalleryImages[0].caption}
                  </figcaption>
                </figure>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="section-shell pb-16 md:pb-32">
          <LifeGallery
            clusters={galleryClusters}
            archivedCount={archivedImageCount}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
