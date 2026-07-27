"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";

const premiumEase = [0.16, 1, 0.3, 1] as const;

export function SmartLink({
  href,
  children,
  className,
  ariaLabel,
}: {
  href: string;
  children: ReactNode;
  className: string;
  ariaLabel?: string;
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  const isExternal = href.startsWith("http");

  return (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

export function ActionLink({
  href,
  children,
  variant = "primary",
  icon,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  icon?: ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();
  const className =
    variant === "secondary"
      ? "premium-link group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-white/12 bg-white/[0.06] px-4 py-2.5 text-[13px] font-medium text-white/88 shadow-[0_18px_48px_rgba(0,0,0,0.3)] transition hover:border-white/22 hover:bg-white/[0.1] focus:outline-none focus:ring-2 focus:ring-white/20 sm:w-auto"
      : "premium-link group hover-light inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-[rgba(129,140,248,0.35)] bg-[linear-gradient(135deg,rgba(129,140,248,0.18),rgba(34,211,238,0.08))] px-4 py-2.5 text-[13px] font-medium text-[var(--foreground)] shadow-[0_18px_54px_rgba(129,140,248,0.18)] backdrop-blur transition hover:border-[rgba(129,140,248,0.55)] hover:bg-[linear-gradient(135deg,rgba(129,140,248,0.26),rgba(34,211,238,0.12))] focus:outline-none focus:ring-2 focus:ring-white/20 sm:w-auto";

  return (
    <motion.span
      className="inline-flex w-full sm:w-auto"
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.24, ease: premiumEase }}
    >
      <SmartLink href={href} className={className}>
        {icon}
        <span>{children}</span>
        <ArrowUpRight className="h-3.5 w-3.5 opacity-55 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </SmartLink>
    </motion.span>
  );
}
