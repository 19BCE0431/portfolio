"use client";

import { track } from "@vercel/analytics";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

type AnalyticsValue = string | number | boolean | null;
type AnalyticsProperties = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      parameters?: AnalyticsProperties,
    ) => void;
  }
}

const sectionSelector = [
  "section[id]",
  "main[id]",
  "article[id]",
  "[data-analytics-section]",
].join(",");

function sendAnalyticsEvent(name: string, properties: AnalyticsProperties) {
  window.gtag?.("event", name, properties);
  track(name, properties);
}

function getLinkProperties(anchor: HTMLAnchorElement): AnalyticsProperties | null {
  const rawHref = anchor.getAttribute("href");

  if (!rawHref || rawHref.startsWith("#")) {
    return null;
  }

  if (rawHref.startsWith("mailto:")) {
    return {
      link_type: "email",
      link_target: "mailto",
      link_text: getSafeText(anchor),
    };
  }

  if (rawHref.startsWith("tel:")) {
    return {
      link_type: "phone",
      link_target: "tel",
      link_text: getSafeText(anchor),
    };
  }

  try {
    const url = new URL(rawHref, window.location.href);
    const isInternal = url.origin === window.location.origin;

    return {
      link_type: isInternal ? "internal" : "external",
      link_target: isInternal ? url.pathname : url.hostname,
      link_text: getSafeText(anchor),
    };
  } catch {
    return null;
  }
}

function getSafeText(element: HTMLElement) {
  return (element.innerText || element.getAttribute("aria-label") || "link")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function getSectionName(element: Element) {
  return (
    element.getAttribute("data-analytics-section") ||
    element.id ||
    element.getAttribute("aria-label") ||
    element.tagName.toLowerCase()
  )
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 80);
}

export function AnalyticsEvents() {
  const pathname = usePathname();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a");

      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      const properties = getLinkProperties(anchor);

      if (!properties) {
        return;
      }

      sendAnalyticsEvent("portfolio_link_click", {
        page_path: window.location.pathname,
        ...properties,
      });
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const seenSections = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.45) {
            continue;
          }

          const sectionName = getSectionName(entry.target);
          const eventKey = `${pathname}:${sectionName}`;

          if (seenSections.has(eventKey)) {
            continue;
          }

          seenSections.add(eventKey);
          sendAnalyticsEvent("portfolio_section_view", {
            page_path: pathname,
            section_name: sectionName,
          });
        }
      },
      {
        rootMargin: "0px 0px -20% 0px",
        threshold: [0.45, 0.7],
      },
    );

    const sections = Array.from(document.querySelectorAll(sectionSelector));

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
