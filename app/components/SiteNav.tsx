"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useActiveSection } from "./ActiveSectionProvider";

const links = [
  { label: "Profile", href: "/#profile", id: "profile" },
  { label: "Selected work", href: "/#work", id: "work" },
  { label: "Experience", href: "/#resume", id: "resume" },
  { label: "Writing", href: "/#notes", id: "notes" },
];

export function SiteNav() {
  const { activeSection } = useActiveSection();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 50);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className={`atelier-nav-wrap ${scrolled ? "is-scrolled" : ""}`}>
      <nav className="atelier-nav" aria-label="Primary navigation">
        <Link href="/#intro" className="atelier-nav-brand" onClick={() => setOpen(false)}>
          <span>MSK</span>
          <strong>Mohit Sai Krishna</strong>
        </Link>

        <div className="atelier-nav-links">
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={activeSection === link.id ? "is-active" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link href="/#contact" className="atelier-nav-cta">
          Let&apos;s talk <ArrowUpRight aria-hidden="true" />
        </Link>

        <button
          type="button"
          className="atelier-nav-menu"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </nav>

      {open && (
        <div className="atelier-nav-drawer">
          {links.map((link) => (
            <Link key={link.id} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link href="/#contact" onClick={() => setOpen(false)}>
            Let&apos;s talk <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      )}
    </header>
  );
}
