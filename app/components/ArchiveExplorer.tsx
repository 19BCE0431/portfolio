"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import type { ArchiveFilter, ArchiveProject } from "../data/archive";
import { archiveFilters } from "../data/archive";
import { ProjectCard } from "./ProjectCard";

export function ArchiveExplorer({
  projects,
}: {
  projects: ArchiveProject[];
}) {
  const [activeFilter, setActiveFilter] = useState<ArchiveFilter>("All");
  const shouldReduceMotion = useReducedMotion();

  const visibleProjects = useMemo(() => {
    if (activeFilter === "All") {
      return projects;
    }

    return projects.filter((project) => project.filter === activeFilter);
  }, [activeFilter, projects]);

  return (
    <div>
      <div className="sticky top-[76px] z-20 -mx-1 mb-8 px-1 py-2 md:top-[88px] md:mb-12">
        <div className="grid w-full grid-cols-2 gap-1.5 rounded-[8px] border border-black/10 bg-[rgba(251,251,248,0.88)] p-1.5 shadow-[0_12px_42px_rgba(17,19,19,0.06)] backdrop-blur-2xl min-[430px]:grid-cols-3 sm:flex sm:w-max sm:flex-nowrap sm:gap-2 sm:p-1">
          {archiveFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              aria-pressed={activeFilter === filter}
              className={`relative min-h-10 w-full overflow-hidden rounded-[7px] px-3 py-2 text-center text-[11.5px] font-medium leading-[1.15] transition-colors duration-300 sm:min-h-0 sm:w-auto sm:whitespace-nowrap sm:px-3.5 sm:text-[12px] ${
                activeFilter === filter
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted)] hover:bg-black/[0.04] hover:text-[var(--foreground)]"
              }`}
            >
              {activeFilter === filter && !shouldReduceMotion && (
                <motion.span
                  layoutId="archive-filter-active"
                  className="absolute inset-0 rounded-[6px] bg-black/[0.07]"
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

      <motion.div layout className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
