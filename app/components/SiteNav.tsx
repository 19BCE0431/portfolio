"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { navItems, profile } from "../data/portfolio";

const sectionLinks = [
  { label: "Profile", href: "/#profile" },
  { label: "Work", href: "/#work" },
  { label: "Resume", href: "/#resume" },
  { label: "Notes", href: "/#notes" },
];

const routeLinks = [
  { label: "Archive", href: "/archive" },
  { label: "Journal", href: "/journal" },
  { label: "Tools", href: "/tools" },
  { label: "Life", href: "/life" },
];

export function SiteNav() {
  const shouldReduceMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("intro");

  useEffect(() => {
    const update = () => setHasScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  useEffect(() => {
    const sectionIds = navItems.map((item) => item.sectionId).filter(Boolean);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      {
        rootMargin: "-32% 0px -52% 0px",
        threshold: [0.02, 0.2, 0.5],
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="lux-nav-wrap">
      <nav
        className={`lux-nav ${hasScrolled ? "lux-nav-scrolled" : ""}`}
        aria-label="Primary navigation"
      >
        <Link
          href="/#intro"
          className="lux-nav-brand"
          aria-label={`${profile.name} home`}
        >
          <span>MSK</span>
          <strong>Mohit Sai Krishna</strong>
        </Link>

        <div className="lux-nav-center" aria-label="Homepage sections">
          {sectionLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={item.href.endsWith(`#${activeSection}`) ? "is-active" : ""}
              aria-current={item.href.endsWith(`#${activeSection}`) ? "location" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Link href="/#contact" className="lux-nav-contact">
          Connect
          <ArrowUpRight aria-hidden="true" />
        </Link>

        <span className="lux-nav-current">
          {navItems.find((item) => item.sectionId === activeSection)?.label ?? "Intro"}
        </span>

        <button
          type="button"
          className="lux-nav-menu"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-controls="lux-mobile-navigation"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="lux-mobile-navigation"
            className="lux-mobile-nav"
            initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.24 }}
          >
            <div>
              {navItems
                .filter((item) => item.sectionId !== "intro")
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={item.sectionId === activeSection ? "location" : undefined}
                    className={item.sectionId === activeSection ? "is-active" : ""}
                  >
                    {item.label}
                  </Link>
                ))}
            </div>
            <div className="lux-mobile-routes">
              {routeLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
