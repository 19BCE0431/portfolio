"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navItems, profile } from "../data/portfolio";

export function SiteNav() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState("thesis");
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
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible?.target.id) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: "-34% 0px -58% 0px",
        threshold: 0.01,
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [pathname]);

  return (
    <motion.header
      className="fixed left-0 right-0 top-0 z-50 px-3 py-3 sm:px-5 md:px-7 md:py-4"
      initial={shouldReduceMotion ? false : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mx-auto w-full max-w-[1180px]">
        <nav
          aria-label="Primary navigation"
          className={`flex w-full items-center justify-between gap-3 rounded-[8px] border px-3 py-2 text-[13px] backdrop-blur-2xl transition-all duration-500 sm:px-4 ${
            hasScrolled
              ? "border-black/10 bg-[rgba(251,251,248,0.9)] shadow-[0_18px_70px_rgba(17,19,19,0.1)]"
              : "border-black/8 bg-[rgba(251,251,248,0.72)] shadow-[0_12px_45px_rgba(17,19,19,0.055)]"
          }`}
        >
          <Link
            href="/"
            aria-label={`${profile.name} home`}
            onClick={() => setMobileOpen(false)}
            className="group flex min-w-fit items-center gap-2 font-medium text-[var(--foreground)]"
          >
            <span className="relative h-1.5 w-1.5 rounded-full bg-[var(--sage)] transition-transform duration-300 group-hover:scale-125">
              <span className="absolute inset-[-5px] rounded-full border border-[rgba(105,121,107,0.24)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </span>
            <span className="sm:hidden">Mohit</span>
            <span className="hidden sm:inline lg:hidden">
              {profile.shortName}
            </span>
            <span className="hidden lg:inline">{profile.name}</span>
          </Link>

          <div className="hidden min-w-0 items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isArchive =
                item.href === "/archive" && pathname.startsWith("/archive");
              const isJournal =
                item.href === "/journal" && pathname.startsWith("/journal");
              const isHomeSection =
                pathname === "/" && item.sectionId === activeSection;
              const isActive = isArchive || isJournal || isHomeSection;

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
                      className="absolute inset-0 rounded-[7px] bg-black/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
                      transition={{
                        duration: 0.38,
                        ease: [0.16, 1, 0.3, 1],
                      }}
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

          <button
            type="button"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-controls="mobile-navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-[8px] border border-black/10 bg-white/45 text-[var(--foreground)] transition-colors duration-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-black/15 md:hidden"
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
                shouldReduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }
              }
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="mt-2 grid gap-1 rounded-[8px] border border-black/10 bg-[rgba(251,251,248,0.92)] p-2 shadow-[0_18px_58px_rgba(17,19,19,0.08)] backdrop-blur-2xl md:hidden"
            >
              {navItems.map((item) => {
                const isArchive =
                  item.href === "/archive" && pathname.startsWith("/archive");
                const isJournal =
                  item.href === "/journal" && pathname.startsWith("/journal");
                const isHomeSection =
                  pathname === "/" && item.sectionId === activeSection;
                const isActive = isArchive || isJournal || isHomeSection;

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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
