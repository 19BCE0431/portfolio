"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Download } from "lucide-react";
import { useRef } from "react";
import { profile } from "../../data/portfolio";
import { Magnetic, Reveal } from "../Kinetics";

const entries = [
  {
    period: "2025 — 2027",
    role: "MBA candidate",
    org: "IIM Sirmaur",
    detail:
      "Product, marketing, strategy, and consumer behaviour. Academic Excellence in the top 10% of the 2025-26 batch year.",
    tags: ["Strategy", "Marketing", "Consumer behaviour"],
  },
  {
    period: "2024 — 2025",
    role: "Data Science Engineer",
    org: "BigHaat Agro",
    detail:
      "Applied AI across search, pricing intelligence, document automation, anomaly detection, and logistics visibility — shipped into live agri-commerce operations.",
    tags: ["Applied AI", "RAG", "Automation", "Python"],
  },
  {
    period: "2023 — 2024",
    role: "Data Science Intern",
    org: "BigHaat Agro",
    detail:
      "First proof that data work changes shape when inputs are live, teams move fast, and the output has to help somebody act today.",
    tags: ["Forecasting", "Pipelines", "SQL"],
  },
  {
    period: "2019 — 2023",
    role: "B.Tech, Computer Science",
    org: "VIT Vellore",
    detail:
      "CGPA 9.15/10 with a Data Science specialisation. 500+ algorithmic problems solved alongside coursework.",
    tags: ["CSE", "Data Science", "Algorithms"],
  },
];

export function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // The rail draws itself as the list scrolls past, so the line is a progress
  // indicator rather than decoration.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.72", "end 0.62"],
  });
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section id="resume" className="section timeline-section">
      <div className="shell">
        <div className="timeline-head">
          <div>
            <Reveal>
              <p className="eyebrow">04 — Experience</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="h-display">
                A technical beginning.
                <br />A <span className="editorial lume">wider</span> point of view.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.16}>
            <Magnetic strength={0.26}>
              <a
                href={profile.resume}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
              >
                Open full resume <Download aria-hidden="true" />
              </a>
            </Magnetic>
          </Reveal>
        </div>

        <div className="timeline" ref={ref}>
          <span className="timeline-rail" aria-hidden="true">
            <motion.i style={shouldReduceMotion ? { scaleY: 1 } : { scaleY }} />
          </span>

          <ol>
            {entries.map((entry, index) => (
              <Reveal as="li" key={entry.period} delay={index * 0.06}>
                <span className="timeline-node" aria-hidden="true" />
                <div className="timeline-period">{entry.period}</div>
                <div className="timeline-body">
                  <h3>
                    {entry.role}
                    <em>{entry.org}</em>
                  </h3>
                  <p>{entry.detail}</p>
                  <ul>
                    {entry.tags.map((tag) => (
                      <li className="tag" key={tag}>
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
