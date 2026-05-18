import {
  BadgeCheck,
  BookOpenText,
  BrainCircuit,
  BriefcaseBusiness,
  Camera,
  ChefHat,
  CircleDot,
  Compass,
  Dumbbell,
  Eye,
  FlameKindling,
  GraduationCap,
  Landmark,
  LineChart,
  Pencil,
  Puzzle,
  Sparkles,
  Store,
  Wrench,
} from "lucide-react";

export const profile = {
  name: "Mohit Sai Krishna Peddakotla",
  shortName: "Mohit Sai Krishna",
  email: "cm.mohhithh@gmail.com",
  location: "India",
  portrait: "/images/profile/profile-hero-01.jpg",
  portraitAlt:
    "Professional portrait of Mohit Sai Krishna Peddakotla, MBA candidate at IIM Sirmaur",
  resume: "/resume.pdf",
  instagram:
    "https://www.instagram.com/ms_krishna9?igsh=MW16emtlZ254cjd2cg%3D%3D&utm_source=qr",
  linkedIn: "https://www.linkedin.com/in/mohit-sai-krishna-peddakotla/",
  linkedInLabel: "LinkedIn",
  whatsApp:
    "https://wa.me/917680030135?text=Hi%20Mohit%2C%20I%20came%20across%20your%20portfolio%20and%20would%20like%20to%20connect.",
  photoSlots: [
    {
      id: "editorial",
      src: "/images/mba-life/iim-campus-rain-01.jpg",
      label: "Campus weather",
      note: "Rain, hills, and the slower rhythm of the current chapter.",
    },
    {
      id: "personal",
      src: "/images/gallery/life-mountain-portrait-01.jpg",
      label: "Off-script",
      note: "A travel frame from the part of life that keeps work lighter.",
    },
  ],
};

export const navItems = [
  { label: "Intro", href: "/#intro", sectionId: "intro" },
  { label: "Direction", href: "/#direction", sectionId: "direction" },
  { label: "Work", href: "/#work", sectionId: "work" },
  { label: "Recognition", href: "/#recognition", sectionId: "recognition" },
  { label: "MBA Life", href: "/#mba-life", sectionId: "mba-life" },
  { label: "Journal", href: "/#journal", sectionId: "journal" },
  { label: "Personal", href: "/#personal", sectionId: "personal" },
  { label: "Gallery", href: "/#gallery", sectionId: "gallery" },
  { label: "Contact", href: "/#contact", sectionId: "contact" },
];

export const sectionNavItems = [
  { label: "Intro", shortLabel: "Intro", href: "#intro", sectionId: "intro" },
  { label: "Direction", shortLabel: "Lens", href: "#direction", sectionId: "direction" },
  { label: "Work", shortLabel: "Work", href: "#work", sectionId: "work" },
  { label: "Recognition", shortLabel: "Signal", href: "#recognition", sectionId: "recognition" },
  { label: "MBA Life", shortLabel: "MBA", href: "#mba-life", sectionId: "mba-life" },
  { label: "Journal", shortLabel: "Notes", href: "#journal", sectionId: "journal" },
  { label: "Personal", shortLabel: "Shelf", href: "#personal", sectionId: "personal" },
  { label: "Gallery", shortLabel: "Life", href: "#gallery", sectionId: "gallery" },
  { label: "Contact", shortLabel: "Hello", href: "#contact", sectionId: "contact" },
];

export const heroMarkers = [
  { label: "Now", value: "MBA at IIM Sirmaur" },
  { label: "Lens", value: "Product, markets, behavior" },
  { label: "Proof", value: "BigHaat automation and AI systems" },
];

export const thesisPoints = [
  {
    label: "Human choice first",
    text: "I like beginning with the person deciding: what they notice, what they trust, where they hesitate, and what finally makes action feel safe.",
  },
  {
    label: "Builder memory",
    text: "Computer Science and Data Science taught me how systems behave. BigHaat taught me how messy those systems become when they meet real teams, orders, prices, PDFs, and customers.",
  },
  {
    label: "Market instinct",
    text: "The MBA is widening the frame: product, marketing, strategy, and consumer behavior are now the questions around the code, not separate from it.",
  },
];

export const directionNotes = [
  {
    title: "Product",
    text: "I care about products that feel clearer after the first use, not after a long explanation.",
    icon: Compass,
  },
  {
    title: "Marketing",
    text: "I watch the space between attention and choice: proof, memory, comparison, aspiration, and timing.",
    icon: Eye,
  },
  {
    title: "Strategy",
    text: "I am learning to separate loud data from useful signals, and to ask what a market is quietly teaching.",
    icon: LineChart,
  },
  {
    title: "AI workflows",
    text: "I like AI when it removes invisible effort: lookup, extraction, alerts, matching, review, and follow-up.",
    icon: BrainCircuit,
  },
];

export const backgroundCards = [
  {
    label: "Current chapter",
    value: "MBA at IIM Sirmaur",
    detail: "2025-2027. Product, marketing, strategy, consumer behavior, and the business questions that decide whether useful systems matter.",
    icon: GraduationCap,
  },
  {
    label: "Business lens",
    value: "Product, Markets, Behavior",
    detail: "I am learning to read customers, categories, pricing, positioning, and the small frictions that shape a decision.",
    icon: Landmark,
  },
  {
    label: "Builder base",
    value: "CSE, Data Science, Applied AI",
    detail: "B.Tech CSE at VIT Vellore, then work across search, prediction, RAG, crawling, dashboards, alerts, and data pipelines.",
    icon: BrainCircuit,
  },
  {
    label: "BigHaat chapter",
    value: "Data Science Engineer",
    detail: "PDF extraction, competitor price intelligence, anomaly detection, logistics visibility, and production workflows that earned CEO recognition.",
    icon: BriefcaseBusiness,
  },
  {
    label: "First proof",
    value: "Data Science Intern",
    detail: "Learned that data work changes when inputs are messy, teams are busy, and the output has to help someone act today.",
    icon: Wrench,
  },
  {
    label: "Family retail lens",
    value: "CM Silks",
    detail: "A family saree business that keeps teaching me trust, aspiration, local positioning, price perception, and customer education.",
    icon: Store,
  },
];

export const credibilityMarkers = [
  "MBA candidate at IIM Sirmaur",
  "B.Tech CSE, VIT Vellore · CGPA 9.15/10",
  "Data Science Engineer · Mar 2024-Mar 2025",
  "Data Science Intern · Sep 2023-Mar 2024",
  "500+ LeetCode problems solved",
  "JEE Mains 97.9 percentile",
  "TS EAMCET rank 1143 out of 2.42 lakh candidates",
];

export const workingModes = [
  "Product thinking",
  "Marketing curiosity",
  "Strategy cases",
  "Consumer behavior",
  "Business analysis",
  "AI-enabled workflows",
  "Decision support",
  "Data storytelling",
  "Python",
  "Next.js",
  "FastAPI",
  "PostgreSQL",
  "LLMs / RAG",
  "Dashboards",
];

export const skills = [
  "Python",
  "Java",
  "C++",
  "JavaScript",
  "HTML/CSS",
  "LLMs",
  "Chainlit",
  "Streamlit",
  "FastAPI",
  "Git",
  "Selenium",
  "Scrapy",
  "Node",
  "Express",
  "React",
  "Trino/PrestoSQL",
  "MySQL",
  "PostgreSQL",
  "MongoDB",
];

export const systemNodes = [
  {
    title: "Human direction",
    text: "I set the question, taste, structure, and final publishing call.",
    icon: BadgeCheck,
  },
  {
    title: "AI-assisted drafts",
    text: "AI helps move from rough idea to first version without skipping review.",
    icon: Sparkles,
  },
  {
    title: "Archive + journal",
    text: "Projects, MBA notes, market observations, and learnings stay findable.",
    icon: BookOpenText,
  },
  {
    title: "LinkedIn adaptation",
    text: "Longer notes become shorter posts only when the idea survives editing.",
    icon: FlameKindling,
  },
  {
    title: "Visual prompts",
    text: "Visuals support the argument instead of becoming decoration.",
    icon: Camera,
  },
  {
    title: "Analytics loop",
    text: "Analytics help me see what people explore and where the story needs sharper proof.",
    icon: LineChart,
  },
];

export const readingShelf = [
  {
    title: "Shoe Dog",
    author: "Phil Knight",
    mode: "Business",
    accent: "copper",
    coverSrc: "/images/books/shoe-dog.jpg",
    note: "Brand-building as endurance: messy, personal, and held together by belief before the market agrees.",
  },
  {
    title: "Zero to One",
    author: "Peter Thiel",
    mode: "Business",
    accent: "steel",
    coverSrc: "/images/books/zero-to-one.jpg",
    note: "A useful reset when I want to ask what is genuinely different, not just better phrased.",
  },
  {
    title: "CEO Excellence",
    author: "Carolyn Dewar, Scott Keller, Vikram Malhotra",
    mode: "Leadership",
    accent: "sage",
    coverSrc: "/images/books/ceo-excellence.jpg",
    note: "The operating side of leadership: rhythm, trade-offs, people, and decisions that cannot be outsourced.",
  },
  {
    title: "Harvard Business Review Leader's Handbook",
    author: "Harvard Business Review",
    mode: "Leadership",
    accent: "ink",
    coverSrc: "/images/books/hbr-leaders-handbook.jpg",
    note: "For days when leadership needs structure, not dramatic quotes.",
  },
  {
    title: "The 22 Immutable Laws of Marketing",
    author: "Al Ries and Jack Trout",
    mode: "Marketing",
    accent: "moss",
    coverSrc: "/images/books/immutable-laws-marketing.jpg",
    note: "Simple and opinionated. Useful when a market feels noisy and positioning needs discipline.",
  },
  {
    title: "The Subtle Art of Not Giving a F*ck",
    author: "Mark Manson",
    mode: "Reflection",
    accent: "crimson",
    coverSrc: "/images/books/subtle-art.jpg",
    note: "A blunt reset for choosing what deserves energy and what only looks urgent for a moment.",
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    mode: "Reflection",
    accent: "gold",
    coverSrc: "/images/books/alchemist.jpg",
    note: "A reminder that direction can be quiet before it becomes obvious.",
  },
  {
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    author: "Gabrielle Zevin",
    mode: "Fiction",
    accent: "indigo",
    coverSrc: "/images/books/tomorrow-tomorrow-tomorrow.jpg",
    note: "A creative friendship story that makes building things feel emotional, strange, and human.",
  },
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    mode: "Reflection",
    accent: "violet",
    coverSrc: "/images/books/midnight-library.jpg",
    note: "A fiction pick about possibility, regret, and the weight of small choices.",
  },
  {
    title: "Half Girlfriend",
    author: "Chetan Bhagat",
    mode: "Fiction",
    accent: "rose",
    coverSrc: "/images/books/half-girlfriend.jpg",
    note: "A lighter reset between heavier books. Sometimes an easy pace is exactly the point.",
  },
];

export const personalInterests = [
  {
    title: "Badminton",
    text: "My cleanest reset. A few rallies usually clear the noise before I can over-explain it.",
    icon: Dumbbell,
    featured: true,
  },
  {
    title: "Chess",
    text: "Patience practice in a small square world. One impatient move can undo a good position.",
    icon: Puzzle,
  },
  {
    title: "Early morning runs",
    text: "A quiet start before everyone else's pace enters the room.",
    icon: CircleDot,
  },
  {
    title: "Photography",
    text: "Mostly a habit of noticing: light, edges, pauses, and small scenes that would pass by.",
    icon: Camera,
  },
  {
    title: "Sketching",
    text: "A slower kind of attention. It helps when I need to stop rushing the first version.",
    icon: Pencil,
  },
  {
    title: "Cooking",
    text: "Process, timing, taste, and feedback. A tiny product loop with better smells.",
    icon: ChefHat,
  },
  {
    title: "Technology + AI tools",
    text: "I try tools to see what they actually change, not what the demo promises.",
    icon: BrainCircuit,
  },
  {
    title: "Brands and markets",
    text: "I notice packaging, pricing, store layouts, offers, and why people pause before choosing.",
    icon: Eye,
  },
];

export const journalItems = [
  {
    label: "Drafting",
    title: "Product and market notes from an MBA lens",
    description:
      "Short reflections on products, market signals, adoption, and the choices behind them.",
  },
  {
    label: "Collecting",
    title: "Consumer behavior observations",
    description:
      "Notes on trust, category understanding, pricing cues, and how everyday purchase decisions form.",
  },
  {
    label: "Drafting",
    title: "AI workflows that make work lighter",
    description:
      "Practical notes from search, RAG, OCR, scraping, prediction, dashboards, and alerts.",
  },
  {
    label: "Coming soon",
    title: "MBA case notes",
    description:
      "Product, marketing, strategy, and consumer behavior notes from the IIM Sirmaur chapter.",
  },
];
