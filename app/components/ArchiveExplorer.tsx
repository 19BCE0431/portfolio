"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { archiveFilters, type ArchiveFilter, type ArchiveProject } from "../data/archive";
import { ProjectCard } from "./ProjectCard";

export function ArchiveExplorer({ projects }: { projects: ArchiveProject[] }) {
  const [activeFilter, setActiveFilter] = useState<ArchiveFilter>("All");
  const shouldReduceMotion = useReducedMotion();

  const visibleProjects = useMemo(() => {
    if (activeFilter === "All") return projects;
    return projects.filter((project) => project.filter === activeFilter);
  }, [activeFilter, projects]);

  return (
    <div>
      <div className="sticky top-[74px] z-20 mb-8 py-2 md:top-[88px] md:mb-14">
        <div className="premium-panel fine-border flex min-w-0 flex-wrap items-center gap-1.5 p-1.5 sm:gap-2 sm:p-1">
          {archiveFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              aria-pressed={activeFilter === filter}
              className={`premium-link relative min-h-10 shrink-0 overflow-hidden rounded-[7px] px-3 py-2 text-center text-[11px] font-medium leading-[1.18] transition-all duration-300 sm:min-h-0 sm:whitespace-nowrap sm:px-3.5 sm:text-[12px] ${
                activeFilter === filter
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted)] hover:bg-black/[0.04] hover:text-[var(--foreground)]"
              }`}
            >
              {activeFilter === filter && !shouldReduceMotion && (
                <motion.span
                  layoutId="archive-filter-active"
                  className="absolute inset-0 rounded-[6px] bg-black/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.62)]"
                  transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
              {activeFilter === filter && shouldReduceMotion && (
                <span className="absolute inset-0 rounded-[6px] bg-black/[0.07]" />
              )}
              <span className="relative z-10">{filter}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-2 border-y border-black/10 py-4 text-[0.9rem] text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing {visibleProjects.length} of {projects.length} archive items
        </span>
        <span>Framed by context, what changed, and what I learned.</span>
      </div>

      <motion.div layout className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visibleProjects.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              priority={index < 3}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
