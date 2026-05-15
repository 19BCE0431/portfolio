"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { MouseEvent } from "react";
import type { ArchiveProject } from "../data/archive";

export function ProjectCard({
  project,
  compact = false,
}: {
  project: ArchiveProject;
  compact?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();
  const arrowX = useMotionValue(0);
  const arrowY = useMotionValue(0);
  const smoothArrowX = useSpring(arrowX, { stiffness: 220, damping: 24 });
  const smoothArrowY = useSpring(arrowY, { stiffness: 220, damping: 24 });

  const handlePointerMove = (event: MouseEvent<HTMLAnchorElement>) => {
    if (shouldReduceMotion) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    arrowX.set((event.clientX - rect.left - rect.width / 2) * 0.018);
    arrowY.set((event.clientY - rect.top - rect.height / 2) * 0.018);
  };

  const resetPointer = () => {
    arrowX.set(0);
    arrowY.set(0);
  };

  return (
    <motion.article
      layout
      initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      whileHover={shouldReduceMotion ? undefined : { y: -6 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/archive/${project.slug}`}
        onMouseMove={handlePointerMove}
        onMouseLeave={resetPointer}
        className={`group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-[8px] border border-black/10 bg-[rgba(251,251,248,0.74)] p-4 premium-card-shadow backdrop-blur transition duration-500 hover:border-black/20 hover:bg-[rgba(251,251,248,0.96)] hover:shadow-[0_34px_94px_rgba(17,19,19,0.09)] focus:outline-none focus:ring-2 focus:ring-black/15 sm:p-6 ${
          compact ? "min-h-[250px] sm:min-h-[340px] xl:min-h-[360px]" : "min-h-[286px] sm:min-h-[390px] xl:min-h-[430px]"
        }`}
      >
        <span className="pointer-events-none absolute inset-x-6 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-black/25 to-transparent transition-transform duration-500 group-hover:scale-x-100" />
        <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <span className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(105,121,107,0.44),transparent)]" />
          <span className="absolute inset-y-8 right-0 w-px bg-[linear-gradient(180deg,transparent,rgba(105,119,137,0.32),transparent)]" />
        </span>
        <div>
          <div className="mb-5 flex items-start justify-between gap-3 sm:mb-8 sm:gap-4">
            <span className="max-w-[190px] text-[10.5px] font-semibold uppercase leading-[1.45] tracking-[0.16em] text-[var(--muted)] sm:text-[11px] sm:tracking-[0.18em]">
              {project.category}
            </span>
            <span className="shrink-0 rounded-[8px] border border-black/10 px-2.5 py-1 text-[11px] font-medium text-[var(--sage)]">
              {project.status}
            </span>
          </div>

          <h3 className="text-[clamp(1.22rem,5.7vw,1.75rem)] font-semibold leading-[1.1] tracking-[0] md:text-[clamp(1.45rem,2vw,2.05rem)] md:leading-[1.04]">
            {project.title}
          </h3>
          <p className="mt-4 text-[0.92rem] leading-[1.58] text-[var(--muted)] sm:mt-6 sm:text-[0.98rem]">
            {project.shortDescription}
          </p>

          {!compact && (
            <div className="mt-5 border-t border-black/10 pt-4 sm:mt-7 sm:pt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Learning
              </p>
              <p className="mt-3 text-[0.88rem] leading-[1.5] text-[var(--muted-strong)]">
                {project.learning}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-black/10 pt-4 sm:mt-10 sm:pt-5">
          <span className="min-w-0 break-words text-[12px] leading-[1.45] text-[var(--muted)]">
            {project.tools.slice(0, 3).join(" · ")}
          </span>
          <motion.span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-black/10 bg-white/40 transition-colors duration-300 group-hover:bg-white"
            style={
              shouldReduceMotion ? undefined : { x: smoothArrowX, y: smoothArrowY }
            }
          >
            <ArrowUpRight className="h-4 w-4 text-[var(--muted)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </motion.span>
        </div>
      </Link>
    </motion.article>
  );
}
