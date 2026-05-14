import { ArrowUpRight, FileText, Link2, Mail, MapPin } from "lucide-react";
import { profile } from "../data/portfolio";
import { Reveal } from "./Reveal";
import { SectionLabel } from "./SectionLabel";

export function Footer() {
  return (
    <footer id="contact" className="section-shell scroll-mt-28 py-20 md:py-36">
      <Reveal className="grid gap-10 md:grid-cols-[1fr_0.72fr] md:items-end">
        <div>
          <SectionLabel>Contact</SectionLabel>
          <h2 className="max-w-[900px] break-words text-[clamp(2.05rem,9.2vw,4rem)] font-semibold leading-[1] tracking-[-0.01em] md:text-[clamp(2.45rem,6.2vw,6.2rem)] md:leading-[0.95]">
            {profile.name}
          </h2>
          <p className="mt-5 max-w-[720px] text-[clamp(1rem,4vw,1.12rem)] leading-[1.64] text-[var(--muted-strong)] md:mt-7 md:text-[clamp(1.04rem,1.65vw,1.22rem)]">
            MBA candidate at IIM Sirmaur, based in India. Building a portfolio
            across applied AI systems, product thinking, marketing, retail
            learning, consumer behavior, and business strategy.
          </p>
        </div>

        <div className="grid gap-3 rounded-[8px] border border-black/10 bg-[rgba(251,251,248,0.7)] p-4 shadow-[0_18px_58px_rgba(17,19,19,0.05)] backdrop-blur sm:p-5">
          <a
            className="group flex min-h-12 items-center justify-between gap-4 border-b border-black/10 pb-3 text-[0.95rem] font-medium text-[var(--foreground)] sm:text-[0.98rem]"
            href={`mailto:${profile.email}`}
          >
            <span className="inline-flex min-w-0 items-center gap-2 break-all">
              <Mail className="h-4 w-4 shrink-0 text-[var(--sage)]" />
              {profile.email}
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--muted)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          <a
            className="group flex min-h-12 items-center justify-between gap-4 border-b border-black/10 pb-3 text-[0.95rem] text-[var(--muted)] transition-colors duration-300 hover:text-[var(--foreground)]"
            href={profile.instagram}
          >
            <span className="inline-flex items-center gap-2">
              <Link2 className="h-4 w-4 text-[var(--steel)]" />
              Instagram
            </span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          <span className="flex min-h-12 items-center justify-between gap-4 border-b border-black/10 pb-3 text-[0.95rem] text-[var(--muted)]">
            <span className="inline-flex items-center gap-2">
              <Link2 className="h-4 w-4 text-[var(--clay)]" />
              LinkedIn
            </span>
            <span className="text-[12px]">Link to add</span>
          </span>
          <span className="flex min-h-12 items-center justify-between gap-4 border-b border-black/10 pb-3 text-[0.95rem] text-[var(--muted)]">
            <span className="inline-flex items-center gap-2">
              <FileText className="h-4 w-4 text-[var(--sage)]" />
              Resume
            </span>
            <span className="text-[12px]">Add `public/resume.pdf`</span>
          </span>
          <span className="flex min-h-12 items-center justify-between gap-4 text-[0.95rem] text-[var(--muted)]">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[var(--steel)]" />
              Location
            </span>
            <span>{profile.location}</span>
          </span>
        </div>
      </Reveal>
    </footer>
  );
}
