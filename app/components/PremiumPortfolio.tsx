"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Download,
  Mail,
  Quote,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getProjectBySlug, type ArchiveProject } from "../data/archive";
import type { JournalPost } from "../data/journal";
import { profile } from "../data/portfolio";

const projectSlugs = [
  "applied-image-search",
  "order-drop-detection",
  "document-intelligence-system",
] as const;

const projects = projectSlugs
  .map((slug) => getProjectBySlug(slug))
  .filter((project): project is ArchiveProject => Boolean(project));

const capabilities = [
  ["Product strategy", "Customer behaviour", "Market signals"],
  ["Applied AI", "RAG systems", "Decision support"],
  ["Python", "FastAPI", "Data workflows"],
];

const timeline = [
  ["Now", "MBA candidate", "IIM Sirmaur · Product, marketing, strategy, and consumer behaviour."],
  ["2024—25", "Data Science Engineer", "BigHaat Agro · Applied AI, search, operations, and automation."],
  ["2019—23", "Computer Science", "VIT Vellore · B.Tech CSE · 9.15/10 CGPA."],
];

function formatDate(date: string) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" }).format(parsed);
}

function Hero() {
  return (
    <section id="intro" className="atelier-hero">
      <div className="atelier-shell atelier-hero-grid">
        <div className="atelier-hero-copy">
          <p className="atelier-kicker atelier-kicker-light">MBA · Product strategy · Applied AI</p>
          <h1>Build clarity<br />from complexity.</h1>
          <p className="atelier-hero-lede">
            I connect technical depth, market context, and product judgment to
            make meaningful decisions easier to see and act on.
          </p>
          <div className="atelier-hero-actions">
            <Link href="#work" className="atelier-button atelier-button-primary">
              Explore selected work <ArrowDown aria-hidden="true" />
            </Link>
            <a href={profile.resume} target="_blank" rel="noreferrer" className="atelier-button atelier-button-ghost">
              Resume <Download aria-hidden="true" />
            </a>
          </div>
          <div className="atelier-hero-evidence">
            <span><b>Top 10%</b> academic excellence</span>
            <span><b>28%</b> order lift, shipped</span>
          </div>
        </div>

        <div className="atelier-hero-portrait">
          <div className="atelier-portrait-caption">
            <span>Mohit Sai Krishna</span>
            <small>Product systems · India</small>
          </div>
          <Image src={profile.portrait} alt={profile.portraitAlt} fill priority sizes="(max-width: 760px) 92vw, 42vw" />
          <div className="atelier-portrait-stamp">MSK<br /><i>01</i></div>
        </div>
      </div>
      <div className="atelier-hero-rule" aria-hidden="true"><span>Scroll to examine</span></div>
    </section>
  );
}

function Profile() {
  return (
    <section id="profile" className="atelier-profile atelier-section">
      <div className="atelier-shell atelier-profile-grid">
        <p className="atelier-section-number">01</p>
        <div>
          <p className="atelier-kicker">A business mind with technical roots</p>
          <h2>I am interested in the moment a complicated system becomes a clear choice.</h2>
        </div>
        <div className="atelier-profile-copy">
          <p>
            Computer Science and Data Science at VIT gave me the discipline to
            build. At BigHaat, live work in search, automation, pricing, and
            operations gave the work a customer and a consequence.
          </p>
          <p>
            My MBA is expanding that lens across product, markets, marketing,
            and strategy—so the question is not only <em>can we build it?</em>,
            but <em>what is worth building and why?</em>
          </p>
          <a href={`mailto:${profile.email}`} className="atelier-text-link">Write to me <Mail aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}

function WorkCarousel() {
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const move = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>(".atelier-work-card");
    rail.scrollBy({ left: direction * ((card?.offsetWidth ?? rail.clientWidth) + 24), behavior: "smooth" });
  };

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const syncActiveCard = () => {
      const cards = Array.from(rail.querySelectorAll<HTMLElement>(".atelier-work-card"));
      const nearest = cards.reduce(
        (closest, card, index) => Math.abs(card.offsetLeft - rail.scrollLeft) < Math.abs(cards[closest].offsetLeft - rail.scrollLeft) ? index : closest,
        0,
      );
      setActive(nearest);
    };
    rail.addEventListener("scroll", syncActiveCard, { passive: true });
    return () => rail.removeEventListener("scroll", syncActiveCard);
  }, []);

  return (
    <section id="work" className="atelier-work atelier-section">
      <div className="atelier-shell">
        <div className="atelier-work-head">
          <div>
            <p className="atelier-kicker atelier-kicker-light">Selected work</p>
            <h2>Made for the decision in front of the user.</h2>
          </div>
          <div className="atelier-carousel-controls">
            <span>{String(active + 1).padStart(2, "0")} <i /> {String(projects.length).padStart(2, "0")}</span>
            <button type="button" onClick={() => move(-1)} aria-label="Previous project"><ArrowLeft aria-hidden="true" /></button>
            <button type="button" onClick={() => move(1)} aria-label="Next project"><ArrowRight aria-hidden="true" /></button>
          </div>
        </div>
      </div>
      <div ref={railRef} className="atelier-work-rail" role="region" aria-label="Selected projects. Swipe or use controls to browse.">
        {projects.map((project, index) => {
          const visual = project.slug === "applied-image-search"
            ? { image: "/images/projects/image-led-discovery-editorial-v2.png", alt: "Editorial still life representing image-led product discovery" }
            : project.visual;
          return (
            <article className="atelier-work-card" key={project.slug}>
              <div className="atelier-work-image">
                {visual?.image && <Image src={visual.image} alt={visual.alt} fill sizes="(max-width: 760px) 84vw, 58vw" />}
                <span>0{index + 1}</span>
              </div>
              <div className="atelier-work-copy">
                <p>{project.category}</p>
                <h3>{project.title}</h3>
                <div className="atelier-work-copy-bottom">
                  <span>{project.shortDescription}</span>
                  <strong>{project.impact}</strong>
                </div>
                <Link href={`/archive/${project.slug}`}>Read case study <ArrowUpRight aria-hidden="true" /></Link>
              </div>
            </article>
          );
        })}
      </div>
      <div className="atelier-shell"><p className="atelier-swipe-hint">Swipe, trackpad-scroll, or use the arrows to examine each case.</p></div>
    </section>
  );
}

function Capability() {
  return (
    <section className="atelier-capability atelier-section">
      <div className="atelier-shell">
        <div className="atelier-capability-intro">
          <p className="atelier-section-number">02</p>
          <div><p className="atelier-kicker">The operating range</p><h2>Rigour, without losing the human question.</h2></div>
          <p>My work starts with the decision, then moves through the system, the evidence, and the practical next step.</p>
        </div>
        <div className="atelier-capability-grid">
          {capabilities.map(([title, ...items], index) => (
            <article key={title}>
              <span>0{index + 1}</span><h3>{title}</h3>
              <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Resume() {
  return (
    <section id="resume" className="atelier-resume atelier-section">
      <div className="atelier-shell atelier-resume-grid">
        <div>
          <p className="atelier-kicker atelier-kicker-light">Experience</p>
          <h2>A technical beginning.<br />A wider point of view.</h2>
          <a href={profile.resume} target="_blank" rel="noreferrer" className="atelier-button atelier-button-primary">Open full resume <Download aria-hidden="true" /></a>
        </div>
        <ol>
          {timeline.map(([period, role, detail]) => <li key={period}><span>{period}</span><div><h3>{role}</h3><p>{detail}</p></div></li>)}
        </ol>
      </div>
    </section>
  );
}

function Proof() {
  return (
    <section className="atelier-proof atelier-section">
      <div className="atelier-shell">
        <Quote aria-hidden="true" />
        <p>“Good judgment is not an alternative to technical depth. It is what directs it.”</p>
        <div><span>Top 10%</span><span>28% order lift</span><span>9.15 / 10 CGPA</span><span>500+ problems solved</span></div>
      </div>
    </section>
  );
}

function Notes({ posts }: { posts: JournalPost[] }) {
  return (
    <section id="notes" className="atelier-notes atelier-section">
      <div className="atelier-shell">
        <div className="atelier-notes-head"><div><p className="atelier-kicker">Field notes</p><h2>Thoughts in public.</h2></div><Link href="/journal">View all writing <ArrowUpRight aria-hidden="true" /></Link></div>
        <div className="atelier-notes-grid">
          {posts.map((post, index) => <Link href={`/journal/${post.slug}`} key={post.slug}><span>0{index + 1} · {formatDate(post.date)}</span><h3>{post.title}</h3><p>{post.summary}</p><ArrowUpRight aria-hidden="true" /></Link>)}
        </div>
      </div>
    </section>
  );
}

export function PremiumPortfolio({ journalPosts }: { journalPosts: JournalPost[] }) {
  return (
    <main id="main-content" className="atelier-home">
      <Hero />
      <Profile />
      <WorkCarousel />
      <Capability />
      <Resume />
      <Proof />
      <Notes posts={journalPosts} />
    </main>
  );
}
