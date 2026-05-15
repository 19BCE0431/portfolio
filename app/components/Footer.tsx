import { ArrowUpRight, FileText, Link2, Mail, MapPin } from "lucide-react";
import { existsSync } from "node:fs";
import path from "node:path";
import { profile } from "../data/portfolio";
import { Reveal } from "./Reveal";

const linkBase =
  "group flex min-h-11 items-center justify-between gap-3 rounded-[8px] border border-white/10 bg-white/[0.035] px-3.5 py-2.5 text-[0.92rem] transition-colors duration-300 hover:border-white/18 hover:bg-white/[0.06] sm:min-h-12 sm:px-4 sm:py-3 sm:text-[0.98rem]";

export function Footer() {
  const year = new Date().getFullYear();
  const resumeExists = existsSync(
    path.join(process.cwd(), "public", "resume.pdf"),
  );

  return (
    <footer
      id="contact"
      className="relative scroll-mt-28 overflow-hidden bg-[var(--deep)] py-14 text-[var(--surface)] md:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(246,246,243,0.18),transparent)]"
      />
      <div
        aria-hidden="true"
        className="premium-grid pointer-events-none absolute right-[-160px] top-16 h-[520px] w-[680px] opacity-[0.08] [mask-image:radial-gradient(circle,black,transparent_70%)]"
      />
      <div className="section-shell">
        <Reveal className="grid gap-8 md:grid-cols-[1fr_0.78fr] md:items-start lg:gap-20">
          <div>
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/38">
              Contact
            </p>
            <h2 className="max-w-[880px] break-words text-[clamp(1.95rem,9vw,4.2rem)] font-semibold leading-[1.04] tracking-[0] text-white/92 md:text-[clamp(2.8rem,6vw,6rem)] md:leading-[0.95]">
              Let’s connect.
            </h2>
            <p className="mt-5 max-w-[680px] text-[clamp(1rem,4vw,1.14rem)] leading-[1.64] text-white/58 md:mt-7">
              Especially around product management, marketing, strategy,
              consumer behavior, Applied AI, and Data Science-informed
              decision-making.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.16em] text-white/38 md:mt-10 md:text-[12px] md:tracking-[0.18em]">
              <span>Built as a living portfolio</span>
              <span>India</span>
            </div>
          </div>

          <div className="rounded-[8px] border border-white/10 bg-white/[0.035] p-2.5 shadow-[0_28px_90px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-4">
            <div className="grid gap-3">
              <a
                className={`${linkBase} font-medium text-white/90`}
                href={`mailto:${profile.email}`}
              >
                <span className="inline-flex min-w-0 items-center gap-2 break-all">
                  <Mail className="h-4 w-4 shrink-0 text-white/62" />
                  {profile.email}
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-white/45 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>

              {profile.linkedIn ? (
                <a
                  className={`${linkBase} font-medium text-white/86`}
                  href={profile.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="inline-flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-white/58" />
                    {profile.linkedInLabel}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-white/45 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              ) : (
                <span className={`${linkBase} font-medium text-white/78`}>
                  <span className="inline-flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-white/52" />
                    {profile.linkedInLabel}
                  </span>
                  <span className="text-[12px] text-white/38">Link to add</span>
                </span>
              )}

              {resumeExists ? (
                <a
                  className={`${linkBase} text-white/72`}
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="inline-flex items-center gap-2">
                    <FileText className="h-4 w-4 text-white/48" />
                    Resume
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-white/38 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              ) : (
                <span className={`${linkBase} text-white/58`}>
                  <span className="inline-flex items-center gap-2">
                    <FileText className="h-4 w-4 text-white/48" />
                    Resume
                  </span>
                  <span className="text-[12px] text-white/36">Coming soon</span>
                </span>
              )}

              <div className="mt-2 grid gap-2.5 border-t border-white/10 pt-3 sm:grid-cols-2 sm:gap-3">
                <a
                  className={`${linkBase} text-white/58`}
                  href={profile.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="inline-flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-white/44" />
                    Instagram
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-white/38 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
                <a
                  className={`${linkBase} text-white/58`}
                  href={profile.whatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="inline-flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-white/44" />
                    WhatsApp
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-white/38 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </div>

              <span className="flex min-h-12 items-center justify-between gap-4 px-2 text-[0.9rem] text-white/44">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-white/36" />
                  Location
                </span>
                <span>{profile.location}</span>
              </span>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-5 text-[12px] text-white/34 sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} {profile.shortName}. All rights reserved.</span>
          <span>Built as a living portfolio.</span>
        </div>
      </div>
    </footer>
  );
}
