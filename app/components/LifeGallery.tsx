"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import type { StoryImage } from "../data/media";

export function LifeGallery({ images }: { images: StoryImage[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const scrollBy = (direction: "previous" | "next") => {
    const rail = railRef.current;
    if (!rail) return;

    rail.scrollBy({
      left: direction === "next" ? rail.clientWidth * 0.86 : -rail.clientWidth * 0.86,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-[0.95rem] leading-[1.6] text-[var(--muted)]">
          A short, edited set. Not a photo dump.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollBy("previous")}
            aria-label="Show previous life gallery image"
            className="grid h-10 w-10 place-items-center rounded-[8px] border border-black/10 bg-white/55 text-[var(--foreground)] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-black/15"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy("next")}
            aria-label="Show next life gallery image"
            className="grid h-10 w-10 place-items-center rounded-[8px] border border-black/10 bg-white/55 text-[var(--foreground)] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-black/15"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        className="flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]"
        tabIndex={0}
        aria-label="Life gallery carousel"
      >
        {images.map((image, index) => (
          <motion.figure
            key={image.src}
            className={`group min-w-[78vw] snap-start overflow-hidden rounded-[8px] border border-black/10 bg-[rgba(255,253,248,0.72)] p-2 shadow-[0_30px_90px_rgba(16,18,18,0.08)] backdrop-blur sm:min-w-[420px] ${
              image.orientation === "portrait" ? "md:min-w-[360px]" : "md:min-w-[560px]"
            }`}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            whileHover={shouldReduceMotion ? undefined : { y: -5 }}
            transition={{ duration: 0.45, delay: index * 0.035, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className={`relative overflow-hidden rounded-[6px] bg-[var(--surface-cool)] ${
                image.orientation === "portrait" ? "aspect-[4/5]" : "aspect-[1.45]"
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={
                  image.orientation === "portrait"
                    ? "(max-width: 768px) 78vw, 360px"
                    : "(max-width: 768px) 78vw, 560px"
                }
                className="object-cover transition-transform duration-[900ms] ease-[var(--ease)] group-hover:scale-[1.035]"
              />
            </div>
            <figcaption className="grid gap-2 px-1 py-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--sage)]">
                Frame {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-[0.95rem] leading-[1.55] text-[var(--muted-strong)]">
                {image.caption}
              </span>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </div>
  );
}
