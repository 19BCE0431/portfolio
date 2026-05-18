"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { navItems, profile } from "../data/portfolio";

const ease = [0.16, 1, 0.3, 1] as const;

const routeLinks = [
  { label: "Archive", href: "/archive", match: "/archive" },
  { label: "Journal", href: "/journal", match: "/journal" },
  { label: "Life", href: "/life", match: "/life" },
];

function getActiveItem(pathname: string, activeSection: string) {
  if (pathname.startsWith("/archive")) return "work";
  if (pathname.startsWith("/journal")) return "journal";
  if (pathname.startsWith("/life")) return "gallery";
  return activeSection;
}

export function SiteNav() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState("intro");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const updateScrollState = () => {
      setHasScrolled(window.scrollY > 18);
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

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
  const activeLabel = useMemo(() => {
    if (pathname.startsWith("/archive")) return "Archive";
    if (pathname.startsWith("/journal")) return "Journal";
    if (pathname.startsWith("/life")) return "Life";

    return (
      navItems.find((item) => item.sectionId === activeItem)?.label ?? "Intro"
    );
  }, [activeItem, pathname]);

  return (
    <>
      <motion.header
        className="fixed left-0 right-0 top-0 z-50 px-3 pt-[calc(env(safe-area-inset-top)+0.65rem)] sm:px-5 md:px-7 md:pt-4"
        initial={shouldReduceMotion ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease }}
      >
        <div className="mx-auto w-full max-w-[1180px]">
          <nav
            aria-label="Primary navigation"
            className={`fine-border relative grid min-h-12 w-full grid-cols-[1fr_auto] items-center gap-2 overflow-hidden rounded-[8px] border px-2.5 py-1.5 text-[13px] backdrop-blur-2xl transition-all duration-500 xl:grid-cols-[1fr_auto_1fr] ${
              hasScrolled
                ? "border-black/10 bg-[rgba(251,251,248,0.9)] shadow-[0_18px_60px_rgba(17,19,19,0.09)]"
                : "border-black/8 bg-[rgba(251,251,248,0.68)] shadow-[0_10px_36px_rgba(17,19,19,0.045)]"
            }`}
          >
            <Link
              href="/#intro"
              aria-label={`${profile.name} home`}
              onClick={() => setMobileOpen(false)}
              className="group flex min-w-0 items-center gap-2 rounded-[7px] px-1.5 py-1.5 font-medium text-[var(--foreground)] transition hover:bg-black/[0.035] focus:outline-none focus:ring-2 focus:ring-black/15"
            >
              <span className="relative h-2 w-2 shrink-0 rounded-full bg-[var(--sage)] transition-transform duration-300 group-hover:scale-125">
                <span className="absolute inset-[-6px] rounded-full border border-[rgba(105,121,107,0.24)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </span>
              <span className="truncate sm:hidden">Mohit</span>
              <span className="hidden truncate sm:inline">
                {profile.shortName}
              </span>
            </Link>

            <div className="hidden min-w-0 items-center rounded-[8px] border border-black/[0.06] bg-white/[0.28] p-1 xl:flex">
              {navItems.map((item) => {
                const isActive = item.sectionId === activeItem;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative overflow-hidden rounded-[7px] px-2.5 py-1.5 text-[12px] font-medium transition-colors duration-300 hover:text-[var(--foreground)] ${
                      isActive
                        ? "text-[var(--foreground)]"
                        : "text-[var(--muted)]"
                    }`}
                  >
                    {isActive && !shouldReduceMotion && (
                      <motion.span
                        layoutId="site-nav-active"
                        className="absolute inset-0 rounded-[6px] bg-black/[0.065] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                        transition={{ duration: 0.38, ease }}
                      />
                    )}
                    {isActive && shouldReduceMotion && (
                      <span className="absolute inset-0 rounded-[6px] bg-black/[0.06]" />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="hidden items-center justify-self-end md:flex">
              <div className="hidden items-center gap-1 lg:flex">
                {routeLinks.map((item) => {
                  const isActive = pathname.startsWith(item.match);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`premium-link rounded-[7px] px-2.5 py-1.5 text-[12px] font-medium transition hover:bg-black/[0.04] focus:outline-none focus:ring-2 focus:ring-black/15 ${
                        isActive
                          ? "text-[var(--foreground)]"
                          : "text-[var(--muted)]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
              <Link
                href="/#contact"
                className="premium-link group ml-1 inline-flex min-h-9 items-center gap-2 rounded-[8px] border border-black/10 bg-white/48 px-3 py-1.5 text-[12px] font-medium text-[var(--foreground)] shadow-[0_10px_30px_rgba(16,18,18,0.045)] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-black/15"
              >
                Connect
                <ArrowUpRight className="h-3.5 w-3.5 text-[var(--muted)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>

            <span className="mr-1 hidden max-w-[110px] truncate rounded-full border border-black/8 bg-white/38 px-2.5 py-1 text-[11px] font-medium text-[var(--muted)] sm:inline-flex md:hidden">
              {activeLabel}
            </span>
            <button
              type="button"
              aria-label={
                mobileOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-controls="mobile-navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
              className="grid h-9 w-9 place-items-center justify-self-end rounded-[8px] border border-black/10 bg-white/52 text-[var(--foreground)] transition-colors duration-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-black/15 xl:hidden"
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
                className="fine-border mt-2 overflow-hidden rounded-[8px] border border-black/10 bg-[rgba(251,251,248,0.96)] p-2 shadow-[0_18px_58px_rgba(17,19,19,0.09)] backdrop-blur-2xl xl:hidden"
              >
                <div className="grid grid-cols-3 gap-1.5 border-b border-black/10 pb-2">
                  {routeLinks.map((item) => {
                    const isActive = pathname.startsWith(item.match);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={`premium-link min-h-10 rounded-[7px] px-2.5 py-2 text-center text-[12px] font-medium transition focus:outline-none focus:ring-2 focus:ring-black/15 ${
                          isActive
                            ? "bg-black/[0.07] text-[var(--foreground)]"
                            : "text-[var(--muted)] hover:bg-black/[0.04] hover:text-[var(--foreground)]"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  {navItems.map((item) => {
                    const isActive = item.sectionId === activeItem;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={`premium-link relative min-h-10 rounded-[7px] px-2 py-2 text-center text-[12px] font-medium transition focus:outline-none focus:ring-2 focus:ring-black/15 ${
                          isActive
                            ? "bg-black/[0.06] text-[var(--foreground)]"
                            : "text-[var(--muted)] hover:bg-black/[0.04] hover:text-[var(--foreground)]"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>
    </>
  );
}
