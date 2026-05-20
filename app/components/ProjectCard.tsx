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
import { ProjectVisual } from "./ProjectVisual";

export function ProjectCard({
  project,
  compact = false,
  priority = false,
  headingAs = "h3",
}: {
  project: ArchiveProject;
  compact?: boolean;
  priority?: boolean;
  headingAs?: "h2" | "h3" | "p";
}) {
  const shouldReduceMotion = useReducedMotion();
  const arrowX = useMotionValue(0);
  const arrowY = useMotionValue(0);
  const smoothArrowX = useSpring(arrowX, { stiffness: 220, damping: 24 });
  const smoothArrowY = useSpring(arrowY, { stiffness: 220, damping: 24 });
  const featured = project.slug === "living-ai-portfolio-system";
  const HeadingTag = headingAs;

  const handlePointerMove = (event: MouseEvent<HTMLAnchorElement>) => {
    if (shouldReduceMotion) return;

    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--x",
      `${((event.clientX - rect.left) / rect.width) * 100}%`,
    );
    event.currentTarget.style.setProperty(
      "--y",
      `${((event.clientY - rect.top) / rect.height) * 100}%`,
    );
    arrowX.set((event.clientX - rect.left - rect.width / 2) * 0.02);
    arrowY.set((event.clientY - rect.top - rect.height / 2) * 0.02);
  };

  const resetPointer = () => {
    arrowX.set(0);
    arrowY.set(0);
  };

  return (
    <motion.article
      layout
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      whileHover={
        shouldReduceMotion
          ? undefined
          : { y: -8, scale: 1.01, rotateX: 1.1, rotateY: featured ? -0.4 : 0.55 }
      }
      whileTap={shouldReduceMotion ? undefined : { scale: 0.996 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformPerspective: 1200 }}
    >
      <Link
        href={`/archive/${project.slug}`}
        onMouseMove={handlePointerMove}
        onMouseLeave={resetPointer}
        className={`project-card-premium group motion-surface hover-light relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[8px] border p-3 backdrop-blur transition duration-500 focus:outline-none focus:ring-2 focus:ring-black/15 sm:p-4 ${
          featured
            ? "border-black/15 bg-[rgba(16,18,18,0.93)] text-white shadow-[0_36px_110px_rgba(16,18,18,0.16)] hover:border-black/20"
            : "premium-card-shadow border-black/10 bg-[rgba(255,253,248,0.76)] hover:border-black/20 hover:bg-[rgba(255,253,248,0.96)] hover:shadow-[0_34px_94px_rgba(16,18,18,0.09)]"
        } ${compact ? "min-h-[300px] sm:min-h-[352px]" : "min-h-[368px] sm:min-h-[458px]"}`}
      >
        <span className="pointer-events-none absolute inset-x-6 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-30 transition-transform duration-500 group-hover:scale-x-100" />
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
            featured
              ? "bg-[radial-gradient(circle_at_var(--x,20%)_var(--y,0%),rgba(104,121,109,0.2),transparent_38%)]"
              : "bg-[radial-gradient(circle_at_var(--x,20%)_var(--y,0%),rgba(104,121,109,0.11),transparent_38%)]"
          }`}
        />

        <ProjectVisual
          project={project}
          compact={compact}
          dark={featured}
          priority={priority}
        />

        <div className="relative z-10 flex flex-1 flex-col justify-between p-2 pt-5 sm:p-3 sm:pt-6">
          <div>
            <div className="mb-4 flex items-start justify-between gap-3 sm:mb-5 sm:gap-4">
              <span
                className={`max-w-[230px] text-[10.5px] font-semibold uppercase leading-[1.45] tracking-[0.16em] sm:text-[11px] sm:tracking-[0.18em] ${
                  featured ? "text-white/46" : "text-[var(--muted)]"
                }`}
              >
                {project.category}
              </span>
              <span
                className={`shrink-0 rounded-[8px] border px-2.5 py-1 text-[11px] font-medium ${
                  featured
                    ? "border-white/12 text-white/66"
                    : "border-black/10 text-[var(--sage)]"
                }`}
              >
                {project.status}
              </span>
            </div>

            <HeadingTag
              className={`text-[clamp(1.34rem,5.7vw,2rem)] font-semibold leading-[1.08] tracking-[0] md:text-[clamp(1.35rem,2.1vw,2.1rem)] ${
                featured ? "text-white/92" : "text-[var(--foreground)]"
              }`}
            >
              {project.title}
            </HeadingTag>
            <p
              className={`mt-3 text-[0.92rem] leading-[1.55] sm:mt-4 sm:text-[0.94rem] sm:leading-[1.58] ${
                featured ? "text-white/58" : "text-[var(--muted)]"
              }`}
            >
              {project.shortDescription}
            </p>

            <div
              className={`mt-4 grid gap-3 border-t pt-4 ${
                featured ? "border-white/10" : "border-black/10"
              }`}
            >
              <div>
                <p
                  className={`text-[10.5px] font-semibold uppercase tracking-[0.16em] ${
                    featured ? "text-white/38" : "text-[var(--muted)]"
                  }`}
                >
                  Changed
                </p>
                <p
                  className={`mt-2 line-clamp-2 text-[0.88rem] leading-[1.5] ${
                    featured ? "text-white/66" : "text-[var(--muted-strong)]"
                  }`}
                >
                  {project.impact}
                </p>
              </div>
              {!compact && (
                <div className="hidden sm:block">
                  <p
                    className={`text-[10.5px] font-semibold uppercase tracking-[0.16em] ${
                      featured ? "text-white/38" : "text-[var(--muted)]"
                    }`}
                  >
                    Took away
                  </p>
                  <p
                    className={`mt-2 text-[0.88rem] leading-[1.5] ${
                      featured ? "text-white/66" : "text-[var(--muted-strong)]"
                    }`}
                  >
                    {project.learning}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div
            className={`mt-5 flex items-end justify-between gap-4 border-t pt-4 ${
              featured ? "border-white/10" : "border-black/10"
            }`}
          >
            <span
              className={`min-w-0 break-words text-[12px] leading-[1.45] ${
                featured ? "text-white/46" : "text-[var(--muted)]"
              }`}
            >
              {project.tools.slice(0, 3).join(" · ")}
            </span>
            <motion.span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${
                featured
                  ? "border-white/12 bg-white/[0.06] text-white/62 group-hover:bg-white/[0.1]"
                  : "border-black/10 bg-white/45 text-[var(--muted)] group-hover:bg-white"
              }`}
              style={
                shouldReduceMotion
                  ? undefined
                  : { x: smoothArrowX, y: smoothArrowY }
              }
            >
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </motion.span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
