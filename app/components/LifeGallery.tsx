"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Archive, ArrowLeft, ArrowRight, Layers2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent, UIEvent } from "react";
import type { GalleryCluster } from "../data/media";

const ease = [0.16, 1, 0.3, 1] as const;

export function LifeGallery({
  clusters,
  archivedCount,
}: {
  clusters: GalleryCluster[];
  archivedCount: number;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
  });
  const shouldReduceMotion = useReducedMotion();
  const [activeClusterId, setActiveClusterId] = useState(clusters[0]?.id);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeCluster =
    clusters.find((cluster) => cluster.id === activeClusterId) ?? clusters[0];

  if (!activeCluster) {
    return null;
  }

  const scrollBy = (direction: "previous" | "next") => {
    const rail = railRef.current;
    if (!rail) return;

    rail.scrollBy({
      left:
        direction === "next" ? rail.clientWidth * 0.86 : -rail.clientWidth * 0.86,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  };

  const selectCluster = (clusterId: GalleryCluster["id"]) => {
    setActiveClusterId(clusterId);
    setActiveImageIndex(0);
    railRef.current?.scrollTo({ left: 0, behavior: "auto" });
  };

  const scrollToImage = (index: number) => {
    const rail = railRef.current;
    const target = rail?.children[index] as HTMLElement | undefined;
    if (!rail || !target) return;

    setActiveImageIndex(index);
    rail.scrollTo({
      left: target.offsetLeft - rail.offsetLeft,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  };

  const handleRailScroll = (event: UIEvent<HTMLDivElement>) => {
    const rail = event.currentTarget;
    const items = Array.from(rail.children) as HTMLElement[];
    const nextIndex = items.reduce(
      (closest, item, index) => {
        const distance = Math.abs(item.offsetLeft - rail.scrollLeft);

        return distance < closest.distance ? { index, distance } : closest;
      },
      { index: 0, distance: Number.POSITIVE_INFINITY },
    ).index;

    setActiveImageIndex(nextIndex);
  };

  const handleRailKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollBy("next");
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollBy("previous");
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const rail = railRef.current;
    if (!rail) return;

    dragState.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: rail.scrollLeft,
    };
    rail.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;
    const rail = railRef.current;
    if (!rail) return;

    const delta = event.clientX - dragState.current.startX;
    rail.scrollLeft = dragState.current.scrollLeft - delta;
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    dragState.current.active = false;
    if (rail?.hasPointerCapture(event.pointerId)) {
      rail.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className="grid gap-8">
      <div className="grid gap-4 lg:grid-cols-[0.78fr_1fr] lg:items-end lg:gap-12">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--sage)]">
            <Layers2 className="h-3.5 w-3.5" />
            Curated clusters
          </p>
          <h2 className="mt-4 max-w-[720px] text-[clamp(2rem,8vw,4.6rem)] font-semibold leading-[1] tracking-[0]">
            Browse one mood at a time.
          </h2>
        </div>
        <p className="max-w-[680px] text-[clamp(0.98rem,1.5vw,1.16rem)] leading-[1.68] text-[var(--muted-strong)]">
          The full folder was audited, but this page only exposes edited
          clusters. Pick a layer, swipe through a few frames, and leave the rest
          quietly archived.
        </p>
      </div>

      <div className="mobile-flow-rail pb-1 sm:mx-0 sm:flex sm:flex-wrap sm:overflow-visible sm:px-0">
        {clusters.map((cluster) => {
          const isActive = cluster.id === activeCluster.id;

          return (
            <button
              key={cluster.id}
              type="button"
              onClick={() => selectCluster(cluster.id)}
              aria-pressed={isActive}
              className={`premium-link group relative min-h-11 shrink-0 overflow-hidden rounded-[8px] border px-3.5 py-2 text-left transition duration-300 focus:outline-none focus:ring-2 focus:ring-black/15 ${
                isActive
                  ? "border-black/18 bg-[rgba(16,18,18,0.92)] text-white shadow-[0_18px_62px_rgba(16,18,18,0.14)]"
                  : "border-black/10 bg-[rgba(255,253,248,0.68)] text-[var(--foreground)] hover:bg-white"
              }`}
            >
              <span className="relative z-10 block text-[0.86rem] font-medium">
                {cluster.label}
              </span>
              <span
                className={`relative z-10 mt-1 block text-[11px] ${
                  isActive ? "text-white/52" : "text-[var(--muted)]"
                }`}
              >
                {cluster.images.length} frames
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCluster.id}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.34, ease }}
          className="life-gallery-stage motion-surface overflow-hidden rounded-[8px] border border-black/10 bg-[rgba(255,253,248,0.58)] p-3 shadow-[0_34px_120px_rgba(16,18,18,0.08)] backdrop-blur md:p-4"
        >
          <div className="mb-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--sage)]">
                {activeCluster.intent}
              </p>
              <h3 className="mt-2 max-w-[760px] text-[clamp(1.45rem,5.8vw,2.65rem)] font-semibold leading-[1.08] tracking-[0]">
                {activeCluster.title}
              </h3>
              <p className="mt-3 max-w-[720px] text-[0.98rem] leading-[1.62] text-[var(--muted)]">
                {activeCluster.description}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => scrollBy("previous")}
                aria-label={`Show previous ${activeCluster.label} image`}
                className="grid h-10 w-10 place-items-center rounded-[8px] border border-black/10 bg-white/55 text-[var(--foreground)] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-black/15"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollBy("next")}
                aria-label={`Show next ${activeCluster.label} image`}
                className="grid h-10 w-10 place-items-center rounded-[8px] border border-black/10 bg-white/55 text-[var(--foreground)] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-black/15"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-4 right-0 top-0 z-10 w-12 bg-gradient-to-l from-[rgba(251,251,248,0.92)] to-transparent"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-4 left-0 top-0 z-10 w-6 bg-gradient-to-r from-[rgba(251,251,248,0.9)] to-transparent"
            />
            <div
              ref={railRef}
              className="flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto pb-4 pr-8 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              tabIndex={0}
              aria-label={`${activeCluster.label} image carousel`}
              onScroll={handleRailScroll}
              onKeyDown={handleRailKeyDown}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onPointerLeave={(event) => {
                if (dragState.current.active) endDrag(event);
              }}
            >
              {activeCluster.images.map((image, index) => (
                <motion.figure
                  key={image.src}
                  className={`gallery-frame-card motion-surface group min-w-[82%] snap-start overflow-hidden rounded-[8px] border border-black/10 bg-[rgba(255,253,248,0.78)] p-2 shadow-[0_26px_82px_rgba(16,18,18,0.08)] backdrop-blur sm:min-w-[420px] ${
                    image.orientation === "portrait"
                      ? "md:min-w-[350px]"
                      : "md:min-w-[560px]"
                  }`}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  whileHover={shouldReduceMotion ? undefined : { y: -5 }}
                  transition={{ duration: 0.45, delay: index * 0.035, ease }}
                >
                  <div
                    className={`relative overflow-hidden rounded-[6px] bg-[var(--surface-cool)] ${
                      image.orientation === "portrait"
                        ? "aspect-[4/5]"
                        : "aspect-[1.45]"
                    }`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes={
                        image.orientation === "portrait"
                          ? "(max-width: 768px) 82vw, 350px"
                          : "(max-width: 768px) 82vw, 560px"
                      }
                      className="media-lift object-cover transition-transform duration-[900ms] ease-[var(--ease)] group-hover:scale-[1.035]"
                    />
                  </div>
                  <figcaption className="grid gap-2 px-1 py-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--sage)]">
                      {activeCluster.label} {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[0.95rem] leading-[1.55] text-[var(--muted-strong)]">
                      {image.caption}
                    </span>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-4">
              <div
                className="flex items-center gap-1.5"
                aria-label={`${activeCluster.label} carousel position`}
              >
                {activeCluster.images.map((image, index) => (
                  <button
                    key={image.src}
                    type="button"
                    aria-label={`Show image ${index + 1} of ${activeCluster.images.length}`}
                    aria-current={activeImageIndex === index ? true : undefined}
                    onClick={() => scrollToImage(index)}
                    className="grid h-7 min-w-7 place-items-center rounded-full focus:outline-none focus:ring-2 focus:ring-black/15"
                  >
                    <span
                      className={`block h-1.5 rounded-full transition-all ${
                        activeImageIndex === index
                          ? "w-6 bg-[var(--foreground)]"
                          : "w-1.5 bg-black/20 hover:bg-black/36"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-[11px] font-medium text-[var(--muted)]">
                {String(activeImageIndex + 1).padStart(2, "0")} /{" "}
                {String(activeCluster.images.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="grid gap-3 rounded-[8px] border border-black/10 bg-[rgba(16,18,18,0.92)] p-5 text-white shadow-[0_30px_100px_rgba(16,18,18,0.12)] md:grid-cols-[auto_1fr_auto] md:items-center md:p-6">
        <div className="grid h-11 w-11 place-items-center rounded-[8px] border border-white/10 bg-white/[0.06]">
          <Archive className="h-5 w-5 text-white/70" />
        </div>
        <div>
          <p className="text-[0.98rem] font-medium">What stayed off the site</p>
          <p className="mt-1 max-w-[760px] text-[0.9rem] leading-[1.55] text-white/56">
            Blurry frames, duplicates, ID-card photos, overly casual selfies,
            and private-looking moments are documented in the audit but not
            displayed here.
          </p>
        </div>
        <span className="rounded-[8px] border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[12px] text-white/68">
          {archivedCount} held back
        </span>
      </div>
    </div>
  );
}
