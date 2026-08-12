"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { JournalPost } from "../../data/journal";
import { Reveal, Spotlight } from "../Kinetics";

function formatDate(date: string) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" }).format(parsed);
}

export function Writing({ posts }: { posts: JournalPost[] }) {
  return (
    <section id="notes" className="section writing">
      <div className="shell">
        <div className="writing-head">
          <div>
            <Reveal>
              <p className="eyebrow">05 — Field notes</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="h-display">
                Thinking, <span className="editorial lume">in public.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.16}>
            <Link href="/journal" className="link">
              View all writing <ArrowUpRight aria-hidden="true" />
            </Link>
          </Reveal>
        </div>

        <div className="writing-grid">
          {posts.map((post, index) => (
            <Reveal key={post.slug} delay={index * 0.08}>
              <Spotlight as="article" className="panel writing-card">
                <Link href={`/journal/${post.slug}`}>
                  <span className="writing-meta">
                    <em>{String(index + 1).padStart(2, "0")}</em>
                    {formatDate(post.date)}
                  </span>
                  <h3>{post.title}</h3>
                  <p>{post.summary}</p>
                  <span className="writing-more">
                    Read note <ArrowUpRight aria-hidden="true" />
                  </span>
                </Link>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
