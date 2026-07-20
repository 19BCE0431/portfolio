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
      label: "Current chapter",
      note: "Hills, rain, case rooms, and the slower rhythm of learning business properly.",
    },
    {
      id: "personal",
      src: "/images/gallery/life-mountain-portrait-01.jpg",
      label: "Outside the resume",
      note: "A travel frame from the part of life that keeps the work human.",
    },
  ],
};

export const navItems = [
  { label: "Intro", href: "/#intro", sectionId: "intro" },
  { label: "Story", href: "/#story", sectionId: "story" },
  { label: "Work", href: "/#work", sectionId: "work" },
  { label: "Resume", href: "/#resume", sectionId: "resume" },
  { label: "Tools", href: "/#tools", sectionId: "tools" },
  { label: "Journal", href: "/#journal", sectionId: "journal" },
  { label: "Life", href: "/#life", sectionId: "life" },
  { label: "Contact", href: "/#contact", sectionId: "contact" },
];

export const sectionNavItems = [
  { label: "Intro", shortLabel: "Intro", href: "#intro", sectionId: "intro" },
  { label: "Story", shortLabel: "Story", href: "#story", sectionId: "story" },
  { label: "Work", shortLabel: "Work", href: "#work", sectionId: "work" },
  { label: "Resume", shortLabel: "CV", href: "#resume", sectionId: "resume" },
  { label: "MBA Tools Desk", shortLabel: "Tools", href: "#tools", sectionId: "tools" },
  { label: "Journal", shortLabel: "Notes", href: "#journal", sectionId: "journal" },
  { label: "Life", shortLabel: "Life", href: "#life", sectionId: "life" },
  { label: "Contact", shortLabel: "Hello", href: "#contact", sectionId: "contact" },
];

export const heroMarkers = [
  { label: "Now", value: "MBA at IIM Sirmaur · Batch 2025-27" },
  { label: "Signal", value: "Academic Excellence · Top 10%" },
  { label: "Experience", value: "Applied AI, automation, and agri-commerce systems" },
];

export const thesisPoints = [
  {
    label: "Begin with the decision",
    text: "I like starting where the user, customer, team, or retailer has to choose: what they notice, what they trust, where they hesitate, and what finally makes action feel safe.",
  },
  {
    label: "Stay close to context",
    text: "Computer Science and Data Science gave me structure. BigHaat gave me live agri-commerce context: product discovery, prices, order signals, logistics updates, dashboards, and workflows built around real use.",
  },
  {
    label: "Translate into business judgment",
    text: "The MBA is widening the frame. Product, marketing, strategy, consumer behavior, and AI-enabled workflows are no longer separate interests; they are the business questions around the system.",
  },
];

export const directionNotes = [
  {
    title: "Product",
    text: "I care about products that become clearer through use: fewer doubts, cleaner next steps, and less work hidden inside the interface.",
    icon: Compass,
  },
  {
    title: "Marketing",
    text: "I watch the space between attention and choice: proof, memory, comparison, aspiration, category cues, and timing.",
    icon: Eye,
  },
  {
    title: "Strategy",
    text: "I am learning to separate loud data from useful signals, then ask what a category, competitor, or customer behavior is quietly teaching.",
    icon: LineChart,
  },
  {
    title: "AI workflows",
    text: "I like AI when it removes invisible effort: lookup, extraction, matching, alerts, review, follow-up, and the repeated steps nobody misses.",
    icon: BrainCircuit,
  },
];

export const backgroundCards = [
  {
    label: "Current chapter",
    value: "MBA at IIM Sirmaur",
    detail: "Batch 2025-27. Product, marketing, strategy, consumer behavior, and the business questions that decide whether useful systems matter.",
    icon: GraduationCap,
  },
  {
    label: "Academic signal",
    value: "Top 10% of Batch",
    detail: "Academic Excellence in the 2025-26 batch year, while moving from technical execution into business judgment and case-led thinking.",
    icon: BadgeCheck,
  },
  {
    label: "Decision lens",
    value: "Product, Markets, Behavior",
    detail: "Customers, categories, pricing, positioning, trust, adoption, and the small signals that shape a decision.",
    icon: Landmark,
  },
  {
    label: "Technical base",
    value: "CSE, Data Science, Applied AI",
    detail: "B.Tech CSE at VIT Vellore, then applied work across search, prediction, RAG, crawling, dashboards, alerts, and data pipelines.",
    icon: BrainCircuit,
  },
  {
    label: "BigHaat chapter",
    value: "Data Science Engineer",
    detail: "Document automation, competitor price intelligence, anomaly detection, image-led discovery, logistics visibility, and applied AI workflows.",
    icon: BriefcaseBusiness,
  },
  {
    label: "First proof",
    value: "Data Science Intern",
    detail: "Learned that data work changes when inputs are live, teams are moving fast, and the output has to help someone act today.",
    icon: Wrench,
  },
  {
    label: "Family retail lens",
    value: "CM Silks",
    detail: "A saree retail context that keeps teaching me trust, aspiration, customer education, price perception, and local brand memory.",
    icon: Store,
  },
];

export const credibilityMarkers = [
  "MBA candidate at IIM Sirmaur · Batch 2025-27",
  "Academic Excellence · Top 10% of Batch 2025-26",
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
    title: "Human direction first",
    text: "The question, taste, structure, and final publishing call stay with me.",
    icon: BadgeCheck,
  },
  {
    title: "AI as a sharper first draft",
    text: "AI helps move rough ideas into structure without skipping judgment or review.",
    icon: Sparkles,
  },
  {
    title: "Archive as evidence",
    text: "Projects, MBA notes, market observations, and learning trails stay findable.",
    icon: BookOpenText,
  },
  {
    title: "LinkedIn as a signal layer",
    text: "Longer notes become shorter posts only when the idea survives editing.",
    icon: FlameKindling,
  },
  {
    title: "Visuals with a job",
    text: "Images, cards, and prompts support the argument instead of filling space.",
    icon: Camera,
  },
  {
    title: "Analytics for sharper storytelling",
    text: "Visitor behavior helps me see what earns attention and where proof needs clarity.",
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
    note: "Brand-building as endurance: personal, uncertain, and held together by belief before the market agrees.",
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
    text: "My cleanest reset. A few rallies usually clear the noise before I can overthink it.",
    icon: Dumbbell,
    featured: true,
  },
  {
    title: "Chess",
    text: "A quiet patience lab. One impatient move can undo a good position.",
    icon: Puzzle,
  },
  {
    title: "Early morning runs",
    text: "A quiet start before everyone else's pace enters the day.",
    icon: CircleDot,
  },
  {
    title: "Photography",
    text: "A habit of noticing: light, edges, pauses, and small scenes that would otherwise pass by.",
    icon: Camera,
  },
  {
    title: "Sketching",
    text: "A slower kind of attention. It reminds me not to rush the first version.",
    icon: Pencil,
  },
  {
    title: "Cooking",
    text: "Process, timing, taste, feedback. A tiny product loop with better smells.",
    icon: ChefHat,
  },
  {
    title: "Technology + AI tools",
    text: "I try tools to see what they actually change, not what the demo promises.",
    icon: BrainCircuit,
  },
  {
    title: "Brands and markets",
    text: "Packaging, pricing, store layouts, offers, and the quiet pause before someone chooses.",
    icon: Eye,
  },
];

export const journalItems = [
  {
    label: "Thinking in public",
    title: "Product and market notes from an MBA lens",
    description:
      "Short reflections that begin with a specific market behavior and end with a clearer business question.",
  },
  {
    label: "Observing",
    title: "Consumer behavior observations",
    description:
      "Notes on trust, category understanding, pricing cues, retail influence, and how everyday purchase decisions form.",
  },
  {
    label: "Building",
    title: "AI workflows that make work lighter",
    description:
      "Practical notes from search, RAG, OCR, scraping, prediction, dashboards, and alert systems that remove repeated effort.",
  },
  {
    label: "Emerging",
    title: "MBA case notes",
    description:
      "Product, marketing, strategy, and consumer behavior notes from the IIM Sirmaur chapter, published only when the insight is strong enough.",
  },
];
