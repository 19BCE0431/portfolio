"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useActiveSection } from "./ActiveSectionProvider";
import { Magnetic } from "./Kinetics";

const links = [
  { label: "Profile", href: "/#profile", id: "profile" },
  { label: "Work", href: "/#work", id: "work" },
  { label: "Archive", href: "/archive", id: "archive" },
  { label: "Experience", href: "/#resume", id: "resume" },
  { label: "Writing", href: "/#notes", id: "notes" },
];

const menuLinks = [
  ...links,
  { label: "Tools", href: "/tools", id: "tools" },
  { label: "Life", href: "/life", id: "life" },
];

export function SiteNav() {
  const { activeSection } = useActiveSection();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let lastY = window.scrollY;

    const update = () => {
      const y = window.scrollY;
      setScrolled(y > 40);

      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? y / scrollable : 0);

      // Hide on downward travel once clear of the hero, show on any upward
      // travel. Gives the content the full viewport while still keeping
      // navigation one gesture away.
      setHidden(y > 420 && y > lastY + 4);
      lastY = y;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Close the overlay on navigation. Adjusting state during render when a
  // value changes is React's documented alternative to an effect here — it
  // avoids the extra commit an effect-driven reset would cause.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (id: string) =>
    pathname === "/" ? activeSection === id : pathname.startsWith(`/${id}`);

  return (
    <>
      <header
        className={`nav-shell${scrolled ? " is-scrolled" : ""}${
          hidden && !open ? " is-hidden" : ""
        }`}
      >
        <nav className="nav" aria-label="Primary">
          <Link href="/" className="nav-brand">
            <span className="nav-mark">
              <i />
              MSK
            </span>
            <span className="nav-name">
              <strong>Mohit Sai Krishna</strong>
              <small>Product · Strategy · Applied AI</small>
            </span>
          </Link>

          <div className="nav-links">
            {links.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={isActive(link.id) ? "is-active" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="nav-end">
            <Magnetic strength={0.24} className="nav-cta-wrap">
              <Link href="/#contact" className="btn btn-primary nav-cta">
                Let&apos;s talk <ArrowUpRight aria-hidden="true" />
              </Link>
            </Magnetic>

            <button
              type="button"
              className={`nav-burger${open ? " is-open" : ""}`}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              <i />
              <i />
            </button>
          </div>

          <span
            className="nav-progress"
            aria-hidden="true"
            style={{ transform: `scaleX(${progress})` }}
          />
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="nav-overlay"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="nav-overlay-inner">
              <p className="eyebrow">Navigate</p>
              <ul className="nav-overlay-links">
                {menuLinks.map((link, index) => (
                  <li key={link.id}>
                    <motion.span
                      initial={{ y: "110%" }}
                      animate={{ y: "0%" }}
                      exit={{ y: "110%", transition: { duration: 0.3 } }}
                      transition={{
                        duration: 0.75,
                        delay: 0.16 + index * 0.055,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <Link href={link.href}>
                        <em>{String(index + 1).padStart(2, "0")}</em>
                        {link.label}
                        <ArrowUpRight aria-hidden="true" />
                      </Link>
                    </motion.span>
                  </li>
                ))}
              </ul>
              <Link href="/#contact" className="btn btn-primary nav-overlay-cta">
                Let&apos;s talk <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
