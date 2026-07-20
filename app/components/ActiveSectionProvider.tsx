"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { navItems } from "../data/portfolio";

type ActiveSectionContextValue = {
  activeSection: string;
};

const ActiveSectionContext = createContext<ActiveSectionContextValue>({
  activeSection: "intro",
});

export function ActiveSectionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("intro");

  useEffect(() => {
    if (pathname !== "/") return;

    const elements = navItems
      .map((item) => document.getElementById(item.sectionId))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (first, second) =>
              second.intersectionRatio - first.intersectionRatio,
          )[0];

        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      {
        rootMargin: "-34% 0px -50% 0px",
        threshold: [0.02, 0.2, 0.45],
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);

  const value = useMemo(() => ({ activeSection }), [activeSection]);

  return (
    <ActiveSectionContext.Provider value={value}>
      {children}
    </ActiveSectionContext.Provider>
  );
}

export function useActiveSection() {
  return useContext(ActiveSectionContext);
}
