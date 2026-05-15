import { Footer } from "./components/Footer";
import { HomePageClient } from "./components/HomePageClient";
import { getRecentPublishedJournalPosts } from "./data/journal";

export default function Home() {
  return (
    <>
      <HomePageClient journalPosts={getRecentPublishedJournalPosts(3)} />
      <Footer />
    </>
  );
}
