"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navItems, profile } from "../data/portfolio";

const ease = [0.16, 1, 0.3, 1] as const;

function getActiveItem(pathname: string, activeSection: string) {
  if (pathname.startsWith("/archive")) return "work";
  if (pathname.startsWith("/journal")) return "journal";
  if (pathname.startsWith("/life")) return "personal";
  return activeSection;
}

export function SiteNav() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState("intro");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setHasScrolled(window.scrollY > 18);

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    const sections = navItems
      .map((item) =>
        item.sectionId ? document.getElementById(item.sectionId) : null,
      )
      .filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: "-38% 0px -48% 0px",
        threshold: [0.02, 0.18, 0.36, 0.6],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [pathname]);

  const activeItem = getActiveItem(pathname, activeSection);

  return (
    <>
      <motion.header
        className="fixed left-0 right-0 top-0 z-50 px-3 py-3 sm:px-5 md:px-7 md:py-4"
        initial={shouldReduceMotion ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease }}
      >
        <div className="mx-auto w-full max-w-[1220px]">
          <nav
            aria-label="Primary navigation"
            className={`grid w-full grid-cols-[1fr_auto] items-center gap-3 rounded-[8px] border px-3 py-2 text-[13px] backdrop-blur-2xl transition-all duration-500 lg:grid-cols-[1fr_auto_1fr] ${
              hasScrolled
                ? "border-black/10 bg-[rgba(251,251,248,0.92)] shadow-[0_18px_70px_rgba(17,19,19,0.1)]"
                : "border-black/8 bg-[rgba(251,251,248,0.74)] shadow-[0_12px_45px_rgba(17,19,19,0.055)]"
            }`}
          >
            <Link
              href="/#intro"
              aria-label={`${profile.name} home`}
              onClick={() => setMobileOpen(false)}
              className="group flex min-w-0 items-center gap-2 font-medium text-[var(--foreground)]"
            >
              <span className="relative h-2 w-2 shrink-0 rounded-full bg-[var(--sage)] transition-transform duration-300 group-hover:scale-125">
                <span className="absolute inset-[-6px] rounded-full border border-[rgba(105,121,107,0.24)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </span>
              <span className="truncate sm:hidden">Mohit</span>
              <span className="hidden truncate sm:inline lg:hidden">
                {profile.shortName}
              </span>
              <span className="hidden truncate lg:inline">{profile.name}</span>
            </Link>

            <div className="hidden min-w-0 items-center gap-1 lg:flex">
              {navItems.map((item) => {
                const isActive = item.sectionId === activeItem;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative overflow-hidden rounded-[8px] px-3 py-2 text-[12px] font-medium transition-colors duration-300 hover:bg-black/[0.04] hover:text-[var(--foreground)] ${
                      isActive
                        ? "text-[var(--foreground)]"
                        : "text-[var(--muted)]"
                    }`}
                  >
                    {isActive && !shouldReduceMotion && (
                      <motion.span
                        layoutId="site-nav-active"
                        className="absolute inset-0 rounded-[7px] bg-black/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.58)]"
                        transition={{ duration: 0.38, ease }}
                      />
                    )}
                    {isActive && shouldReduceMotion && (
                      <span className="absolute inset-0 rounded-[7px] bg-black/[0.055]" />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="hidden justify-self-end md:flex">
              <Link
                href="/archive"
                className="group inline-flex min-h-10 items-center gap-2 rounded-[8px] border border-black/10 bg-white/50 px-3.5 py-2 text-[12px] font-medium text-[var(--foreground)] shadow-[0_10px_32px_rgba(16,18,18,0.05)] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-black/15"
              >
                Full archive
                <ArrowUpRight className="h-3.5 w-3.5 text-[var(--muted)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>

            <button
              type="button"
              aria-label={
                mobileOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-controls="mobile-navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
              className="grid h-10 w-10 place-items-center justify-self-end rounded-[8px] border border-black/10 bg-white/52 text-[var(--foreground)] transition-colors duration-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-black/15 lg:hidden"
            >
              {mobileOpen ? (
                <X className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Menu className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </nav>

          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                id="mobile-navigation"
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, y: -8, scale: 0.98 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={
                  shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }
                }
                transition={{ duration: 0.28, ease }}
                className="mt-2 grid gap-1 rounded-[8px] border border-black/10 bg-[rgba(251,251,248,0.95)] p-2 shadow-[0_18px_58px_rgba(17,19,19,0.08)] backdrop-blur-2xl lg:hidden"
              >
                {navItems.map((item) => {
                  const isActive = item.sectionId === activeItem;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex min-h-11 items-center justify-between rounded-[7px] px-3 text-[13px] font-medium transition-colors duration-300 ${
                        isActive
                          ? "bg-black/[0.055] text-[var(--foreground)]"
                          : "text-[var(--muted)] hover:bg-black/[0.04] hover:text-[var(--foreground)]"
                      }`}
                    >
                      {item.label}
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-35" />
                    </Link>
                  );
                })}
                <Link
                  href="/archive"
                  onClick={() => setMobileOpen(false)}
                  className="mt-1 flex min-h-11 items-center justify-between rounded-[7px] border border-black/10 bg-white/50 px-3 text-[13px] font-medium text-[var(--foreground)]"
                >
                  Full archive
                  <ArrowUpRight className="h-4 w-4 text-[var(--muted)]" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      <aside
        aria-label="Section dock"
        className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
      >
        <div className="grid gap-1 rounded-[8px] border border-black/10 bg-[rgba(251,251,248,0.72)] p-1.5 shadow-[0_18px_62px_rgba(17,19,19,0.09)] backdrop-blur-2xl">
          {navItems.map((item) => {
            const isActive = item.sectionId === activeItem;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={`Jump to ${item.label}`}
                className={`group relative grid h-8 w-8 place-items-center rounded-[7px] transition-colors duration-300 hover:bg-black/[0.055] ${
                  isActive ? "bg-black/[0.07]" : ""
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? "scale-125 bg-[var(--foreground)]"
                      : "bg-[var(--muted)] opacity-45 group-hover:opacity-80"
                  }`}
                />
                <span className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-[7px] border border-black/10 bg-[rgba(251,251,248,0.96)] px-2.5 py-1 text-[11px] font-medium text-[var(--foreground)] opacity-0 shadow-[0_12px_36px_rgba(17,19,19,0.09)] transition duration-200 group-hover:opacity-100">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}
