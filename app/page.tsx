import { Footer } from "./components/Footer";
import { HomeExperience } from "./components/home";
import { getRecentPublishedJournalPosts } from "./data/journal";

export default function Home() {
  return (
    <>
      <HomeExperience journalPosts={getRecentPublishedJournalPosts(3)} />
      <Footer />
    </>
  );
}
