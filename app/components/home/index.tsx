import type { JournalPost } from "../../data/journal";
import { credibilityMarkers } from "../../data/portfolio";
import { Marquee } from "../Kinetics";
import { Capabilities } from "./Capabilities";
import { Hero } from "./Hero";
import { LifeStrip } from "./LifeStrip";
import { Statement } from "./Statement";
import { Timeline } from "./Timeline";
import { WorkScene } from "./WorkScene";
import { Writing } from "./Writing";

export function HomeExperience({ journalPosts }: { journalPosts: JournalPost[] }) {
  return (
    <main id="main-content" className="home">
      <Hero />
      {/* Velocity-reactive ticker: the first thing that visibly answers the
          user's scrolling, immediately after the hero. */}
      <Marquee items={credibilityMarkers} />
      <Statement />
      <WorkScene />
      <Capabilities />
      <Timeline />
      <Writing posts={journalPosts} />
      <LifeStrip />
    </main>
  );
}
