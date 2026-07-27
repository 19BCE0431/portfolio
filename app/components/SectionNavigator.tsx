"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

  if (pathname !== "/") {
    return null;
  }

  const jumpToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    const top = element.getBoundingClientRect().top + window.scrollY - 92;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });

    window.history.replaceState(null, "", `#${sectionId}`);
    setActiveSection(sectionId);
  };

  return (
    <nav
      aria-label="Homepage section navigation"
      className="fixed right-4 z-40 hidden xl:block"
      style={{ top: "50svh", transform: "translateY(-50%)" }}
    >
      <div className="relative grid gap-1.5 rounded-[8px] border border-white/12 bg-[rgba(9,11,13,0.72)] p-1.5 shadow-[0_18px_62px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-3 h-[calc(100%-24px)] w-px bg-white/[0.09]"
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
              className={`group relative grid h-8 w-8 place-items-center rounded-[7px] transition-colors duration-300 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-white/20 ${
                isActive ? "bg-white/[0.09]" : ""
              }`}
            >
              {isActive && !shouldReduceMotion && (
                <motion.span
                  layoutId="section-dock-active"
                  className="absolute inset-0 rounded-[7px] border border-white/14 bg-white/[0.06] shadow-[0_8px_24px_rgba(129,140,248,0.2)]"
                  transition={{ duration: 0.32, ease }}
                />
              )}
              <span
                className={`relative z-10 rounded-full transition-all duration-300 ${
                  isActive
                    ? "h-2.5 w-2.5 bg-[var(--cyan)] shadow-[0_0_10px_rgba(34,211,238,0.7)]"
                    : "h-1.5 w-1.5 bg-[var(--muted)] opacity-45 group-hover:opacity-80"
                }`}
              />
              <span
                className="pointer-events-none absolute right-10 whitespace-nowrap rounded-[7px] border border-white/12 bg-[rgba(9,11,13,0.96)] px-2.5 py-1 text-[11px] font-medium text-[var(--foreground)] opacity-0 shadow-[0_12px_36px_rgba(0,0,0,0.5)] transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                style={{ top: "50%", transform: "translateY(-50%)" }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
