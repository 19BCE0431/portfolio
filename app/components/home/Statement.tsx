"use client";

import { Mail } from "lucide-react";
import Image from "next/image";
import { profile } from "../../data/portfolio";
import { CountUp, Parallax, Reveal, ScrollCopy, Spotlight } from "../Kinetics";

const signals = [
  { value: 10, suffix: "%", prefix: "Top ", label: "Academic standing", note: "IIM Sirmaur, Batch 2025-26" },
  { value: 9.15, decimals: 2, suffix: " / 10", label: "Computer Science CGPA", note: "VIT Vellore, B.Tech CSE" },
  { value: 500, suffix: "+", label: "LeetCode problems solved", note: "Algorithmic practice, sustained" },
  { value: 97.9, decimals: 1, suffix: "th", label: "JEE Mains percentile", note: "EAMCET rank 1143 of 2.42 lakh" },
];

export function Statement() {
  return (
    <section id="profile" className="section statement">
      <div className="shell">
        <div className="statement-grid">
          <div className="statement-lead">
            <Reveal>
              <p className="eyebrow">01 — A business mind with technical roots</p>
            </Reveal>

            {/* Scroll-linked: the sentence resolves word by word as it crosses
                the viewport, which slows the reader down on the one claim the
                whole page rests on. */}
            <ScrollCopy
              className="scroll-copy statement-copy"
              text="I am interested in the moment a complicated system finally becomes a clear choice."
            />
          </div>

          <div className="statement-body">
            <Reveal delay={0.1}>
              <p>
                Computer Science and Data Science at VIT gave me the discipline
                to build. At BigHaat, live work in search, automation, pricing,
                and operations gave that build a customer and a consequence.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <p>
                My MBA is widening the lens across product, markets, marketing,
                and strategy — so the question is no longer only{" "}
                <em className="editorial">can we build it?</em> but{" "}
                <em className="editorial">what is worth building, and why?</em>
              </p>
            </Reveal>
            <Reveal delay={0.26}>
              <a href={`mailto:${profile.email}`} className="link">
                Write to me <Mail aria-hidden="true" />
              </a>
            </Reveal>
          </div>

          <Parallax className="statement-media" distance={46}>
            <div className="statement-media-frame">
              <Image
                src={profile.photoSlots[0].src}
                alt="IIM Sirmaur campus in the rain"
                width={720}
                height={900}
                sizes="(max-width: 980px) 90vw, 32vw"
              />
              <span>{profile.photoSlots[0].label}</span>
            </div>
          </Parallax>
        </div>

        <div className="signals">
          {signals.map((signal, index) => (
            <Reveal key={signal.label} delay={index * 0.08}>
              <Spotlight className="panel signal">
                <strong>
                  <CountUp
                    to={signal.value}
                    decimals={signal.decimals ?? 0}
                    prefix={signal.prefix ?? ""}
                    suffix={signal.suffix ?? ""}
                  />
                </strong>
                <span>{signal.label}</span>
                <small>{signal.note}</small>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
