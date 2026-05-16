"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  Boxes,
  FileText,
  ImageIcon,
  Network,
  Search,
  Sparkles,
  Store,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { ArchiveProject } from "../data/archive";

const motifIcons = {
  system: Network,
  search: Search,
  chart: BarChart3,
  automation: Boxes,
  document: FileText,
  vision: ImageIcon,
  retail: Store,
  case: Sparkles,
} as const;

type ProjectVisualMotif = NonNullable<ArchiveProject["visual"]>["motif"];

function getMotif(slug: string, motif?: ProjectVisualMotif) {
  if (motif) return motif;
  if (/search|discovery/i.test(slug)) return "search";
  if (/price|prediction|sense|risk/i.test(slug)) return "chart";
  if (/document|invoice|pdf/i.test(slug)) return "document";
  if (/retail/i.test(slug)) return "retail";
  if (/case|mba/i.test(slug)) return "case";
  if (/defect|image|crop/i.test(slug)) return "vision";
  if (/portfolio|system|diagram/i.test(slug)) return "system";
  return "automation";
}

export function ProjectVisual({
  project,
  compact = false,
  dark = false,
}: {
  project: ArchiveProject;
  compact?: boolean;
  dark?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [imageMissing, setImageMissing] = useState(false);
  const motif = getMotif(project.slug, project.visual?.motif);
  const Icon = motifIcons[motif];
  const primaryImage = project.visual?.images?.find(
    (image) => image.placement === "cover",
  ) ?? project.visual?.images?.[0];
  const imageSrc = primaryImage?.src ?? project.visual?.image;
  const imageAlt = primaryImage?.alt ?? project.visual?.alt ?? `${project.title} visual`;
  const imageCaption = primaryImage?.caption ?? project.visual?.caption;
  const isSvg = imageSrc?.endsWith(".svg");
  const hash = useMemo(
    () =>
      project.slug.split("").reduce((total, character) => {
        return total + character.charCodeAt(0);
      }, 0),
    [project.slug],
  );

  const lineOne = `${18 + (hash % 38)}%`;
  const lineTwo = `${42 + (hash % 24)}%`;
  const lineThree = `${62 + (hash % 18)}%`;

  return (
    <div
      className={`relative overflow-hidden rounded-[8px] border ${
        dark
          ? "border-white/10 bg-white/[0.035]"
          : "border-black/10 bg-[rgba(255,253,248,0.62)]"
      } ${compact ? "aspect-[1.55]" : "aspect-[1.45]"}`}
    >
      {!imageMissing && imageSrc ? (
        <>
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes={
              compact
                ? "(max-width: 768px) 92vw, 25vw"
                : "(max-width: 768px) 92vw, 42vw"
            }
            unoptimized={isSvg}
            onError={() => setImageMissing(true)}
            className="object-cover transition-transform duration-[900ms] ease-[var(--ease)] group-hover:scale-[1.04]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(16,18,18,0)_38%,rgba(16,18,18,0.58))] opacity-80"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-5 top-0 h-px origin-left scale-x-0 bg-white/55 transition-transform duration-700 group-hover:scale-x-100"
          />
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
            <span className="rounded-[7px] border border-white/14 bg-black/20 px-2.5 py-1 text-[11px] font-medium text-white/76 shadow-[0_12px_28px_rgba(0,0,0,0.16)] backdrop-blur">
              {project.visual?.label ?? "Project visual"}
            </span>
            {imageCaption && (
              <span className="hidden max-w-[62%] text-right text-[11px] leading-[1.35] text-white/62 sm:block">
                {imageCaption}
              </span>
            )}
          </div>
        </>
      ) : (
        <motion.div
          aria-label={project.visual?.alt ?? `${project.title} visual placeholder`}
          role="img"
          className={`relative h-full w-full overflow-hidden ${
            dark
              ? "bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(104,121,109,0.12))]"
              : "bg-[linear-gradient(135deg,#fbf8f0,#eef1ed_54%,#f7f1ea)]"
          }`}
          whileHover={shouldReduceMotion ? undefined : { scale: 1.018 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            aria-hidden="true"
            className={`absolute inset-0 ${
              dark ? "opacity-[0.16]" : "opacity-[0.2]"
            }`}
            style={{
              backgroundImage:
                "linear-gradient(rgba(16,18,18,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(16,18,18,0.06) 1px, transparent 1px)",
              backgroundSize: "38px 38px",
            }}
          />
          <div
            aria-hidden="true"
            className={`absolute left-[12%] top-[18%] h-px w-[76%] ${
              dark ? "bg-white/14" : "bg-black/10"
            }`}
          />
          <div
            aria-hidden="true"
            className={`absolute left-[16%] top-[52%] h-px w-[58%] ${
              dark ? "bg-white/14" : "bg-black/10"
            }`}
          />
          <div
            aria-hidden="true"
            className={`absolute bottom-[18%] left-[28%] h-px w-[52%] ${
              dark ? "bg-white/14" : "bg-black/10"
            }`}
          />
          <div
            aria-hidden="true"
            className={`absolute rounded-full border ${
              dark ? "border-white/14" : "border-black/10"
            }`}
            style={{
              left: lineOne,
              top: "20%",
              width: compact ? 42 : 56,
              height: compact ? 42 : 56,
            }}
          />
          <div
            aria-hidden="true"
            className={`absolute rounded-full border ${
              dark ? "border-white/14 bg-white/[0.035]" : "border-black/10 bg-white/40"
            }`}
            style={{
              left: lineTwo,
              top: "44%",
              width: compact ? 54 : 72,
              height: compact ? 54 : 72,
            }}
          />
          <div
            aria-hidden="true"
            className={`absolute rounded-full border ${
              dark ? "border-white/14" : "border-black/10"
            }`}
            style={{
              left: lineThree,
              bottom: "16%",
              width: compact ? 34 : 48,
              height: compact ? 34 : 48,
            }}
          />
          <div className="absolute inset-0 grid place-items-center">
            <div
              className={`grid h-14 w-14 place-items-center rounded-[8px] border backdrop-blur md:h-16 md:w-16 ${
                dark
                  ? "border-white/12 bg-white/[0.05] text-white/72"
                  : "border-black/10 bg-[rgba(255,253,248,0.68)] text-[var(--sage)]"
              }`}
            >
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
            <span
              className={`rounded-[7px] border px-2.5 py-1 text-[11px] font-medium ${
                dark
                  ? "border-white/10 bg-white/[0.05] text-white/58"
                  : "border-black/10 bg-white/50 text-[var(--muted)]"
              }`}
            >
              {project.visual?.label ?? "Visual slot"}
            </span>
            <span
              className={`hidden text-[11px] ${
                dark ? "text-white/38" : "text-[var(--muted)]"
              } sm:inline`}
            >
              {imageCaption ?? "Add screenshot later"}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
