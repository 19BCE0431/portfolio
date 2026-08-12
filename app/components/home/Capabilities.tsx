"use client";

import {
  BrainCircuit,
  Compass,
  Database,
  LineChart,
  PenTool,
  Terminal,
} from "lucide-react";
import { Reveal, Spotlight } from "../Kinetics";

const capabilities = [
  {
    title: "Product & growth",
    note: "From customer friction to a sharper value proposition.",
    items: ["Discovery", "Positioning", "User journeys", "Go-to-market"],
    icon: Compass,
  },
  {
    title: "Market intelligence",
    note: "Reading the category, the customer, and the competitive signal.",
    items: ["Pricing", "Consumer behaviour", "Competitor research", "Category mapping"],
    icon: LineChart,
  },
  {
    title: "AI product systems",
    note: "Applied AI only where it removes a meaningful unit of effort.",
    items: ["RAG", "Vision workflows", "Document intelligence", "Human review"],
    icon: BrainCircuit,
  },
  {
    title: "Data & decisions",
    note: "Turning uneven operational data into something a team can act on.",
    items: ["SQL", "Metrics", "Forecasting", "Decision dashboards"],
    icon: Database,
  },
  {
    title: "Engineering delivery",
    note: "Building the workflow end to end, not just proving the concept.",
    items: ["Python", "FastAPI", "Automation", "System design"],
    icon: Terminal,
  },
  {
    title: "Executive synthesis",
    note: "Making the recommendation carry as much weight as the analysis.",
    items: ["Strategy cases", "Research memos", "Data storytelling", "Narrative"],
    icon: PenTool,
  },
];

export function Capabilities() {
  return (
    <section className="section capability">
      <div className="shell">
        <div className="capability-intro">
          <div>
            <Reveal>
              <p className="eyebrow">03 — Capability system</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="h-display">
                From the market signal to the{" "}
                <span className="editorial lume">operating decision.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.16}>
            <p className="lead">
              A wider working range than a tools list: research, product
              judgment, AI systems, engineering, and the clarity to bring them
              together in one recommendation.
            </p>
          </Reveal>
        </div>

        <div className="capability-grid">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;
            return (
              <Reveal key={capability.title} delay={(index % 3) * 0.07}>
                <Spotlight as="article" className="panel capability-card">
                  <span className="capability-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="capability-icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <h3>{capability.title}</h3>
                  <p>{capability.note}</p>
                  <ul>
                    {capability.items.map((item) => (
                      <li className="tag" key={item}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Spotlight>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
