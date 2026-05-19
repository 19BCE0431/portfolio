"use client";

import {
  ArrowUpRight,
  FileText,
  Mail,
  MapPin,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";
import { profile } from "../data/portfolio";
import { Reveal } from "./Reveal";

const linkBase =
  "premium-link group relative flex min-h-16 items-center justify-between gap-3 overflow-hidden rounded-[8px] border px-4 py-3.5 text-[0.96rem] transition duration-500 focus:outline-none focus:ring-2 focus:ring-white/20";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M7.2 9.2v8.1M7.2 6.7v.1M11 17.3v-4.8c0-2.1 1.2-3.4 3-3.4 1.7 0 2.8 1.1 2.8 3.4v4.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M5.5 3.8h13A1.7 1.7 0 0 1 20.2 5.5v13a1.7 1.7 0 0 1-1.7 1.7h-13a1.7 1.7 0 0 1-1.7-1.7v-13a1.7 1.7 0 0 1 1.7-1.7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M7.2 3.8h9.6a3.4 3.4 0 0 1 3.4 3.4v9.6a3.4 3.4 0 0 1-3.4 3.4H7.2a3.4 3.4 0 0 1-3.4-3.4V7.2a3.4 3.4 0 0 1 3.4-3.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M15.4 11.4a3.4 3.4 0 1 1-6.7 1.2 3.4 3.4 0 0 1 6.7-1.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M17.3 6.8h.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M5.4 18.9 6.6 16A7.4 7.4 0 1 1 9 18.1l-3.6.8Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M9.2 8.6c.2-.5.4-.6.8-.6h.6c.2 0 .4.1.5.4l.7 1.6c.1.3.1.5-.1.7l-.4.5c.6 1.1 1.4 1.9 2.5 2.5l.6-.4c.2-.2.4-.2.7-.1l1.6.7c.3.1.4.3.4.6v.6c0 .4-.2.7-.6.8-.8.2-1.7.2-2.6-.1-2.4-.8-4.2-2.6-5-5-.3-.9-.3-1.8-.1-2.6Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.55"
      />
    </svg>
  );
}

const primaryLinks = [
  {
    label: "Email",
    detail: profile.email,
    href: `mailto:${profile.email}`,
    icon: Mail,
  },
  {
    label: profile.linkedInLabel,
    detail: profile.linkedIn ? "Professional profile" : "Link to add",
    href: profile.linkedIn,
    icon: LinkedInIcon,
  },
  {
    label: "Resume",
    detail: profile.resume ? "PDF profile" : "Coming soon",
    href: profile.resume,
    icon: FileText,
  },
];

const secondaryLinks = [
  {
    label: "Instagram",
    detail: "Photos and lighter notes",
    href: profile.instagram,
    icon: InstagramIcon,
  },
  {
    label: "WhatsApp",
    detail: "Quick hello",
    href: profile.whatsApp,
    icon: WhatsAppIcon,
  },
];

function FooterLink({
  href,
  children,
  primary = false,
}: {
  href?: string;
  children: ReactNode;
  primary?: boolean;
}) {
  const className = `${linkBase} ${
    primary
      ? "border-white/12 bg-white/[0.065] text-white/88 hover:border-white/24 hover:bg-white/[0.1]"
      : "border-white/10 bg-white/[0.035] text-white/62 hover:border-white/18 hover:bg-white/[0.06]"
  }`;

  if (!href) {
    return <span className={className}>{children}</span>;
  }

  const isExternal = href.startsWith("http");

  return (
    <a
      className={className}
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const shouldReduceMotion = useReducedMotion();

  return (
    <footer
      id="contact"
      className="relative scroll-mt-28 overflow-hidden bg-[var(--deep)] py-12 text-[var(--surface)] md:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(245,243,238,0.16),transparent)]"
      />
      <div
        aria-hidden="true"
        className="premium-grid pointer-events-none absolute right-[-180px] top-14 h-[560px] w-[760px] opacity-[0.09] [mask-image:radial-gradient(circle,black,transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="orbital-line pointer-events-none bottom-20 right-[8vw] hidden h-[220px] w-[360px] border-white/10 md:block"
      />

      <div className="section-shell relative z-10">
        <Reveal>
          <div className="border-b border-white/10 pb-7 md:pb-12">
            <motion.h2
              className="max-w-[1120px] break-words text-[clamp(3rem,12vw,9.5rem)] font-semibold leading-[0.9] tracking-[0] text-white/92"
              initial={
                shouldReduceMotion ? false : { opacity: 0, y: 34, scale: 0.92 }
              }
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            >
              Let&apos;s connect.
            </motion.h2>
            <p className="mt-5 max-w-[720px] text-[clamp(1rem,4vw,1.18rem)] leading-[1.62] text-white/62 md:mt-7">
              Email is the cleanest place to start. I am open to product,
              marketing, strategy, Applied AI, retail, and business
              conversations with real context.
            </p>
          </div>
        </Reveal>

        <div className="mt-7 grid gap-7 lg:grid-cols-[0.68fr_1fr] lg:gap-16">
          <Reveal>
            <div>
              <p className="text-[1.25rem] leading-[1.42] text-white/82 md:text-[1.65rem]">
                If a project, market question, or operating problem here made you
                curious, send a note. I read it properly.
              </p>
              <div className="mt-6 grid gap-3 text-[11px] uppercase tracking-[0.16em] text-white/36 md:mt-8 md:text-[12px] md:tracking-[0.18em]">
                <span>Living portfolio, reviewed before it ships</span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.location}
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="grid gap-3">
              {primaryLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <FooterLink key={item.label} href={item.href} primary>
                    <span className="relative z-10 inline-flex min-w-0 items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] border border-white/10 bg-white/[0.045] text-white/62 transition group-hover:border-white/20 group-hover:text-white/82">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block font-medium">{item.label}</span>
                        <span className="mt-0.5 block break-all text-[12px] text-white/38">
                          {item.detail}
                        </span>
                      </span>
                    </span>
                    <ArrowUpRight className="relative z-10 h-4 w-4 shrink-0 text-white/42 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    <span className="pointer-events-none absolute inset-0 translate-y-full bg-white/[0.055] transition-transform duration-500 group-hover:translate-y-0" />
                    <span className="pointer-events-none absolute inset-x-4 top-0 h-px origin-left scale-x-0 bg-white/38 transition-transform duration-500 group-hover:scale-x-100" />
                  </FooterLink>
                );
              })}

              <div className="mt-2 grid gap-3 border-t border-white/10 pt-3 sm:grid-cols-2">
                {secondaryLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <FooterLink key={item.label} href={item.href}>
                      <span className="relative z-10 inline-flex min-w-0 items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] border border-white/8 bg-white/[0.03] text-white/42 transition group-hover:text-white/64">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block">{item.label}</span>
                          <span className="mt-0.5 block text-[12px] text-white/34">
                            {item.detail}
                          </span>
                        </span>
                      </span>
                      <ArrowUpRight className="relative z-10 h-4 w-4 shrink-0 text-white/34 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      <span className="pointer-events-none absolute inset-x-4 top-0 h-px origin-left scale-x-0 bg-white/22 transition-transform duration-500 group-hover:scale-x-100" />
                    </FooterLink>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-5 text-[12px] text-white/34 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} {profile.shortName}. All rights reserved.
          </span>
          <span>MBA · Product · Marketing · Strategy · AI workflows</span>
        </div>
      </div>
    </footer>
  );
}
