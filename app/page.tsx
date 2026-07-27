import { Footer } from "./components/Footer";
import { PremiumPortfolio } from "./components/PremiumPortfolio";
import { getRecentPublishedJournalPosts } from "./data/journal";

export default function Home() {
  return (
    <>
      <PremiumPortfolio journalPosts={getRecentPublishedJournalPosts(3)} />
      <Footer />
    </>
  );
}
