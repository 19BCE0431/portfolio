"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, List } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { sectionNavItems } from "../data/portfolio";

const ease = [0.16, 1, 0.3, 1] as const;

function getCurrentActiveSection() {
  const targetLine = window.innerHeight * 0.38;
  let closest = sectionNavItems[0]?.sectionId ?? "intro";
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const item of sectionNavItems) {
    const element = document.getElementById(item.sectionId);
    if (!element) continue;

    const rect = element.getBoundingClientRect();
    const containsTarget = rect.top <= targetLine && rect.bottom >= targetLine;
    if (containsTarget) {
      return item.sectionId;
    }

    const distance = Math.abs(rect.top - targetLine);
    if (distance < closestDistance) {
      closest = item.sectionId;
      closestDistance = distance;
    }
  }

  return closest;
}

export function SectionNavigator() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState("intro");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setActiveSection(getCurrentActiveSection());
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("hashchange", update);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("hashchange", update);
    };
  }, [pathname]);

  const activeItem = useMemo(
    () =>
      sectionNavItems.find((item) => item.sectionId === activeSection) ??
      sectionNavItems[0],
    [activeSection],
  );

  if (pathname !== "/") {
    return null;
  }

  const jumpToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    setOpen(false);
    const top = element.getBoundingClientRect().top + window.scrollY - 92;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });

    window.history.replaceState(null, "", `#${sectionId}`);
    setActiveSection(sectionId);
  };

  return (
    <>
      <nav
        aria-label="Homepage section navigation"
        className="fixed right-4 z-40 hidden xl:block"
        style={{ top: "50svh", transform: "translateY(-50%)" }}
      >
        <div className="relative grid gap-1.5 rounded-[8px] border border-black/10 bg-[rgba(251,251,248,0.76)] p-1.5 shadow-[0_18px_62px_rgba(17,19,19,0.09)] backdrop-blur-2xl">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-3 h-[calc(100%-24px)] w-px bg-black/[0.055]"
            style={{ left: "50%", transform: "translateX(-50%)" }}
          />
          {sectionNavItems.map((item) => {
            const isActive = item.sectionId === activeSection;

            return (
              <button
                key={item.sectionId}
                type="button"
                aria-label={`Jump to ${item.label}`}
                aria-current={isActive ? "location" : undefined}
                onClick={() => jumpToSection(item.sectionId)}
                className={`group relative grid h-8 w-8 place-items-center rounded-[7px] transition-colors duration-300 hover:bg-black/[0.055] focus:outline-none focus:ring-2 focus:ring-black/15 ${
                  isActive ? "bg-black/[0.07]" : ""
                }`}
              >
                {isActive && !shouldReduceMotion && (
                  <motion.span
                    layoutId="section-dock-active"
                    className="absolute inset-0 rounded-[7px] border border-black/10 bg-white/52 shadow-[0_8px_24px_rgba(16,18,18,0.08)]"
                    transition={{ duration: 0.32, ease }}
                  />
                )}
                <span
                  className={`relative z-10 rounded-full transition-all duration-300 ${
                    isActive
                      ? "h-2.5 w-2.5 bg-[var(--foreground)]"
                      : "h-1.5 w-1.5 bg-[var(--muted)] opacity-45 group-hover:opacity-80"
                  }`}
                />
                <span
                  className="pointer-events-none absolute right-10 whitespace-nowrap rounded-[7px] border border-black/10 bg-[rgba(251,251,248,0.96)] px-2.5 py-1 text-[11px] font-medium text-[var(--foreground)] opacity-0 shadow-[0_12px_36px_rgba(17,19,19,0.09)] transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                  style={{ top: "50%", transform: "translateY(-50%)" }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <div
        className="fixed z-40 xl:hidden"
        style={{
          left: "12px",
          right: "12px",
          top: "calc(100svh - 12px)",
          transform: "translateY(-100%)",
        }}
      >
        <div className="mx-auto max-w-[430px] rounded-[8px] border border-black/10 bg-[rgba(251,251,248,0.9)] p-1.5 shadow-[0_18px_62px_rgba(17,19,19,0.1)] backdrop-blur-2xl">
          <button
            type="button"
            aria-label="Open section navigation"
            aria-expanded={open}
            aria-controls="mobile-section-navigation"
            onClick={() => setOpen((value) => !value)}
            className="flex min-h-11 w-full items-center justify-between gap-3 rounded-[7px] px-3 text-left text-[13px] font-medium text-[var(--foreground)] transition hover:bg-black/[0.04] focus:outline-none focus:ring-2 focus:ring-black/15"
          >
            <span className="inline-flex min-w-0 items-center gap-2">
              <List className="h-4 w-4 shrink-0 text-[var(--sage)]" />
              <span className="text-[var(--muted)]">Section</span>
              <span className="truncate">{activeItem?.shortLabel}</span>
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-[var(--muted)] transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                id="mobile-section-navigation"
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, y: 10, scale: 0.98 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={
                  shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }
                }
                transition={{ duration: 0.24, ease }}
                className="grid grid-cols-3 gap-1.5 border-t border-black/10 p-2"
              >
                {sectionNavItems.map((item) => {
                  const isActive = item.sectionId === activeSection;

                  return (
                    <button
                      key={item.sectionId}
                      type="button"
                      aria-current={isActive ? "location" : undefined}
                      onClick={() => jumpToSection(item.sectionId)}
                      className={`min-h-10 rounded-[7px] border px-2 text-[12px] font-medium transition focus:outline-none focus:ring-2 focus:ring-black/15 ${
                        isActive
                          ? "border-black/12 bg-black/[0.07] text-[var(--foreground)]"
                          : "border-black/8 bg-white/40 text-[var(--muted)] hover:bg-white"
                      }`}
                    >
                      {item.shortLabel}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
