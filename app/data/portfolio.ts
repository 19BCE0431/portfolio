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
      id: "hero",
      src: "/images/profile/profile-hero-01.jpg",
      label: "Hero portrait",
      note: "Primary campus portrait used in the hero.",
    },
    {
      id: "editorial",
      src: "/images/profile/profile-campus-01.jpg",
      label: "Editorial strip",
      note: "Secondary campus portrait for editorial use.",
    },
    {
      id: "personal",
      src: "/images/profile/personal-01.jpg",
      label: "Personal moment",
      note: "A badminton, travel, sketching, or photo-walk image can be added later.",
    },
  ],
};

export const navItems = [
  { label: "Intro", href: "/#intro", sectionId: "intro" },
  { label: "Direction", href: "/#direction", sectionId: "direction" },
  { label: "Work", href: "/#work", sectionId: "work" },
  { label: "System", href: "/#system", sectionId: "system" },
  { label: "Recognition", href: "/#recognition", sectionId: "recognition" },
  { label: "Journal", href: "/#journal", sectionId: "journal" },
  { label: "Personal", href: "/#personal", sectionId: "personal" },
  { label: "Contact", href: "/#contact", sectionId: "contact" },
];

export const heroMarkers = [
  { label: "Now", value: "MBA at IIM Sirmaur" },
  { label: "Lens", value: "Product, marketing, strategy" },
  { label: "Base", value: "CSE, Data Science, Applied AI" },
];

export const thesisPoints = [
  {
    label: "Customer first",
    text: "I am trying to begin with the person making the choice: what they notice, what they trust, what feels confusing, and what finally makes action feel worth it.",
  },
  {
    label: "Builder second",
    text: "My technical background helps me understand what can be built, automated, measured, or improved. The MBA is helping me ask whether it should be.",
  },
  {
    label: "Market always",
    text: "I like watching the quiet signals around products: pricing, habit, timing, messaging, friction, and the small reasons one option stays in someone's mind.",
  },
];

export const directionNotes = [
  {
    title: "Product",
    text: "I care about products that become easier to trust once someone actually uses them.",
    icon: Compass,
  },
  {
    title: "Marketing",
    text: "I like the messy middle between attention and choice: memory, comparison, proof, aspiration, and timing.",
    icon: Eye,
  },
  {
    title: "Strategy",
    text: "I am learning to separate a loud signal from a useful one, and to ask what a market is really telling us.",
    icon: LineChart,
  },
  {
    title: "AI workflows",
    text: "I am interested in AI where it quietly removes effort, improves a workflow, or helps someone make a clearer decision.",
    icon: BrainCircuit,
  },
];

export const backgroundCards = [
  {
    label: "Current education",
    value: "MBA at IIM Sirmaur",
    detail: "2025-2027. Product, marketing, strategy, consumer behavior, and the business side of building useful things.",
    icon: GraduationCap,
  },
  {
    label: "Lens",
    value: "Product / Marketing / Strategy",
    detail: "The direction I am actively growing into: customer choices, market signals, positioning, and decisions that travel beyond a prototype.",
    icon: Landmark,
  },
  {
    label: "Technical foundation",
    value: "CSE + Data Science + Applied AI",
    detail: "B.Tech CSE at VIT Vellore, plus hands-on work across search, prediction, RAG, dashboards, automation, and decision-support systems.",
    icon: BrainCircuit,
  },
  {
    label: "Professional chapter",
    value: "Data Science Engineer",
    detail: "Bangalore, Mar 2024-Mar 2025. Built and improved workflows around orders, content, logistics, pricing, and operational visibility.",
    icon: BriefcaseBusiness,
  },
  {
    label: "Internship chapter",
    value: "Data Science Intern",
    detail: "Sep 2023-Mar 2024. Learned how data work changes when it has to fit real teams, messy inputs, and urgent business questions.",
    icon: Wrench,
  },
  {
    label: "Personal learning lens",
    value: "Consumer behavior in the wild",
    detail: "I keep noticing how people compare brands, price, trust, store experience, and small cues before they decide.",
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
    text: "I set the taste, questions, structure, and final call.",
    icon: BadgeCheck,
  },
  {
    title: "AI-assisted drafts",
    text: "AI helps compress rough thinking into drafts, layouts, and first passes.",
    icon: Sparkles,
  },
  {
    title: "Archive + journal",
    text: "Projects, notes, and learning get organized into a system instead of disappearing.",
    icon: BookOpenText,
  },
  {
    title: "LinkedIn adaptation",
    text: "Longer notes can become shorter posts when they are actually worth sharing.",
    icon: FlameKindling,
  },
  {
    title: "Visual prompts",
    text: "Future visuals can support the idea without turning the site into decoration.",
    icon: Camera,
  },
  {
    title: "Analytics loop",
    text: "Performance notes help me learn what resonates and what needs sharper thinking.",
    icon: LineChart,
  },
];

export const readingShelf = [
  {
    title: "Shoe Dog",
    author: "Phil Knight",
    mode: "Business memoir",
    accent: "copper",
    note: "I like how messy and human the Nike story feels. It is less about perfect strategy and more about belief, timing, risk, and staying with the thing longer than is comfortable.",
  },
  {
    title: "Zero to One",
    author: "Peter Thiel with Blake Masters",
    mode: "Startups",
    accent: "steel",
    note: "This one pushes me to ask whether an idea is only an improvement, or whether it has a sharper point of view about the future.",
  },
  {
    title: "CEO Excellence",
    author: "Carolyn Dewar, Scott Keller, Vikram Malhotra",
    mode: "Leadership",
    accent: "sage",
    note: "I am reading it for the operating side of leadership: how people make decisions, set rhythm, choose trade-offs, and keep an organization honest.",
  },
  {
    title: "HBR Leader's Handbook",
    author: "Ron Ashkenas and Brook Manville",
    mode: "Management",
    accent: "ink",
    note: "Useful as a practical leadership shelf. I come back to it when I want structure without turning leadership into slogans.",
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    mode: "Reflective fiction",
    accent: "gold",
    note: "It is simple, but I like the reminder that direction can be quiet before it becomes obvious. Good for days when ambition needs patience.",
  },
  {
    title: "Half Girlfriend",
    author: "Chetan Bhagat",
    mode: "Contemporary fiction",
    accent: "rose",
    note: "I read it more for the emotion and easy pace than for analysis. Sometimes a lighter story is the right reset between heavier books.",
  },
  {
    title: "The Kite Runner",
    author: "Khaled Hosseini",
    mode: "Literary fiction",
    accent: "indigo",
    note: "A book that stays with you because it is about memory, guilt, friendship, and what people carry for years.",
  },
  {
    title: "Tuesdays with Morrie",
    author: "Mitch Albom",
    mode: "Reflective fiction",
    accent: "moss",
    note: "Short, warm, and grounding. I like books that pull ambition back toward the question of what kind of person you are becoming.",
  },
];

export const personalInterests = [
  {
    title: "Badminton",
    text: "My cleanest reset. When my head feels heavy, a game usually clears the noise before I can overthink it.",
    icon: Dumbbell,
    featured: true,
  },
  {
    title: "Chess",
    text: "Patience practice disguised as a board game. It keeps reminding me that one impatient move can ruin a good position.",
    icon: Puzzle,
  },
  {
    title: "Early morning runs",
    text: "A quiet way to start the day before everyone else's pace enters the room.",
    icon: CircleDot,
  },
  {
    title: "Photography",
    text: "Mostly noticing light, frames, and small scenes that would otherwise pass by.",
    icon: Camera,
  },
  {
    title: "Sketching",
    text: "A slower kind of attention. Useful when I need to stop rushing the first version.",
    icon: Pencil,
  },
  {
    title: "Cooking",
    text: "Process, timing, taste, and feedback. Honestly, a tiny product loop with better smells.",
    icon: ChefHat,
  },
  {
    title: "Technology + AI tools",
    text: "I keep trying tools to see what they actually change, not just what the demo promises.",
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
