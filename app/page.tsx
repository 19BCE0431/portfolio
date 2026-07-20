import { Footer } from "./components/Footer";
import { PortfolioExperience } from "./components/PortfolioExperience";
import { getRecentPublishedJournalPosts } from "./data/journal";

export default function Home() {
  return (
    <>
      <PortfolioExperience journalPosts={getRecentPublishedJournalPosts(3)} />
      <Footer />
    </>
  );
}
