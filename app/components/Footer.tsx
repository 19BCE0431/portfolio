"use client";

import {
  ArrowUpRight,
  FileText,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";
import { profile } from "../data/portfolio";
import { Reveal } from "./Reveal";

const linkBase =
  "group relative flex min-h-16 items-center justify-between gap-3 overflow-hidden rounded-[8px] border px-4 py-3.5 text-[0.96rem] transition duration-500 focus:outline-none focus:ring-2 focus:ring-white/20";

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
    icon: Link2,
  },
  {
    label: "Resume",
    detail: "PDF profile",
    href: profile.resume,
    icon: FileText,
  },
];

const secondaryLinks = [
  {
    label: "Instagram",
    detail: "Secondary social",
    href: profile.instagram,
    icon: Link2,
  },
  {
    label: "WhatsApp",
    detail: "Secondary contact",
    href: profile.whatsApp,
    icon: MessageCircle,
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
  const marqueeItems = [
    "Product",
    "Strategy",
    "Marketing",
    "Consumer behavior",
    "Applied AI",
    "Market signals",
    "MBA notes",
  ];

  return (
    <footer
      id="contact"
      className="relative scroll-mt-28 overflow-hidden bg-[var(--deep)] py-16 text-[var(--surface)] md:py-28"
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
        <div className="mb-8 overflow-hidden border-y border-white/10 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/32 md:mb-12">
          <div className="footer-marquee gap-8 pr-8">
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <span key={`${item}-${index}`} className="inline-flex items-center gap-8">
                {item}
                <span className="h-1 w-1 rounded-full bg-white/24" />
              </span>
            ))}
          </div>
        </div>

        <Reveal>
          <div className="border-b border-white/10 pb-8 md:pb-12">
            <p className="editorial-kicker text-white/38">Contact</p>
            <motion.h2
              className="mt-5 max-w-[1180px] break-words text-[clamp(3.2rem,14.8vw,11.5rem)] font-semibold leading-[0.86] tracking-[0] text-white/92"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 34, scale: 0.92 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            >
              Open to thoughtful work.
            </motion.h2>
            <p className="mt-7 max-w-[780px] text-[clamp(1.02rem,4vw,1.28rem)] leading-[1.68] text-white/62">
              I am interested in product, strategy, marketing, consumer
              behavior, Applied AI, and the decisions that sit between a good
              idea and a real market.
            </p>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.72fr_1fr] lg:gap-16">
          <Reveal>
            <div>
              <p className="text-[1.35rem] leading-[1.35] text-white/82 md:text-[1.8rem]">
                If a project, role, idea, or conversation feels aligned, email
                is the cleanest place to start.
              </p>
              <div className="mt-8 grid gap-3 text-[11px] uppercase tracking-[0.16em] text-white/36 md:text-[12px] md:tracking-[0.18em]">
                <span>Built as a living portfolio</span>
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
                      <Icon className="h-4 w-4 shrink-0 text-white/58" />
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
                      <span className="relative z-10 inline-flex items-center gap-3">
                        <Icon className="h-4 w-4 text-white/44" />
                        <span>
                          <span className="block">{item.label}</span>
                          <span className="mt-0.5 block text-[12px] text-white/34">
                            {item.detail}
                          </span>
                        </span>
                      </span>
                      <ArrowUpRight className="relative z-10 h-4 w-4 text-white/34 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      <span className="pointer-events-none absolute inset-x-4 top-0 h-px origin-left scale-x-0 bg-white/22 transition-transform duration-500 group-hover:scale-x-100" />
                    </FooterLink>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-5 text-[12px] text-white/34 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} {profile.shortName}. All rights reserved.
          </span>
          <span>Living portfolio, reviewed before it ships.</span>
        </div>
      </div>
    </footer>
  );
}
