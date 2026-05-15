export type JournalStatus = "draft" | "published";

export type JournalSection = {
  heading: string;
  body: string[];
};

export type JournalPost = {
  title: string;
  slug: string;
  date: string;
  status: JournalStatus;
  tags: string[];
  summary: string;
  readingTime: string;
  intro: string;
  sections: JournalSection[];
  takeaways: string[];
  linkedInNote: string;
};

export const journalPosts: JournalPost[] = [
  {
    title: "Product Teardown Notes",
    slug: "product-teardown-notes",
    date: "2026-05-15",
    status: "published",
    tags: ["Product", "User Experience", "MBA"],
    summary:
      "A lightweight template for studying products through user need, adoption, friction, and business value.",
    readingTime: "3 min read",
    intro:
      "This is a working note format for future product teardowns. The goal is not to sound like a product expert, but to build a repeatable way of observing how products create value.",
    sections: [
      {
        heading: "What I Want To Notice",
        body: [
          "A useful teardown should begin with the user problem before it jumps into features. I want to observe who the product serves, what behavior it makes easier, and where friction still remains.",
          "For my portfolio, this format should connect product thinking with my Data Science background: what signals matter, what decisions the product supports, and how the experience could be measured.",
        ],
      },
      {
        heading: "A Simple Structure",
        body: [
          "The future teardown format will cover context, target user, core job-to-be-done, onboarding, activation moment, retention loop, business model, and one practical improvement idea.",
          "Each post should stay short enough to skim. The point is to show judgment and curiosity, not to over-explain a product from the outside.",
        ],
      },
      {
        heading: "How This Helps",
        body: [
          "Writing these notes will help me practice moving from technical execution to product and business judgment. It also creates material that can later be adapted into sharper LinkedIn posts.",
        ],
      },
    ],
    takeaways: [
      "Start with the user problem, not the feature list.",
      "Separate observation from recommendation.",
      "Use metrics as decision signals, not decoration.",
    ],
    linkedInNote:
      "Can become a short LinkedIn carousel or text post: product, user friction, insight, one recommendation.",
  },
  {
    title: "AI and Business Systems",
    slug: "ai-and-business-systems",
    date: "2026-05-15",
    status: "draft",
    tags: ["Applied AI", "Business Intelligence", "Decision Support"],
    summary:
      "A draft space for reflecting on when AI workflows actually improve business decisions.",
    readingTime: "4 min read",
    intro:
      "A placeholder for future notes on Applied AI work, automation, retrieval, alerts, and decision support.",
    sections: [
      {
        heading: "Draft Direction",
        body: [
          "This note should grow from real examples where AI reduced manual work, improved information access, or helped teams respond faster.",
        ],
      },
    ],
    takeaways: [
      "AI work should be tied to a clear decision or workflow.",
      "Automation is useful when it reduces repeated effort or delay.",
    ],
    linkedInNote:
      "Can become a practical LinkedIn post on the difference between impressive AI demos and useful operating workflows.",
  },
  {
    title: "Indian Consumer Behavior Observations",
    slug: "indian-consumer-behavior-observations",
    date: "2026-05-15",
    status: "draft",
    tags: ["Consumer Behavior", "Marketing", "India"],
    summary:
      "A draft collection of grounded observations about trust, price perception, aspiration, and category education.",
    readingTime: "4 min read",
    intro:
      "A placeholder for observations from coursework, retail exposure, and market examples.",
    sections: [
      {
        heading: "Draft Direction",
        body: [
          "This note should avoid broad claims about India and instead focus on specific buying situations, trade-offs, and customer language.",
        ],
      },
    ],
    takeaways: [
      "Consumer behavior should be observed in context.",
      "Price, trust, and aspiration often interact rather than move separately.",
    ],
    linkedInNote:
      "Can become a concise LinkedIn reflection on one consumer behavior pattern and one business implication.",
  },
  {
    title: "MBA Reflections",
    slug: "mba-reflections",
    date: "2026-05-15",
    status: "draft",
    tags: ["MBA", "Strategy", "Learning"],
    summary:
      "A future home for reflections from cases, classes, group work, and the shift from engineering to management thinking.",
    readingTime: "3 min read",
    intro:
      "A placeholder for short, grounded reflections from the IIM Sirmaur MBA chapter.",
    sections: [
      {
        heading: "Draft Direction",
        body: [
          "This should focus on what changed in my thinking after a case, class, or project, not generic MBA lessons.",
        ],
      },
    ],
    takeaways: [
      "Good reflection should point to a specific change in judgment.",
      "Cases become useful when connected to real decisions.",
    ],
    linkedInNote:
      "Can become a short LinkedIn post on one MBA learning moment and how it changed my approach.",
  },
  {
    title: "Retail Learning Notes",
    slug: "retail-learning-notes",
    date: "2026-05-15",
    status: "draft",
    tags: ["Retail", "Customer Behavior", "Marketing"],
    summary:
      "A subtle space for retail and customer-behavior observations without making retail the main career identity.",
    readingTime: "3 min read",
    intro:
      "A placeholder for practical notes on local retail, category education, trust, and purchase behavior.",
    sections: [
      {
        heading: "Draft Direction",
        body: [
          "This should stay observational and specific: how customers compare options, what creates confidence, and where content can help.",
        ],
      },
    ],
    takeaways: [
      "Retail learning is most useful when it reveals customer decision patterns.",
      "Trust and education can matter as much as visibility.",
    ],
    linkedInNote:
      "Can become a grounded LinkedIn note about one retail observation and what it suggests for marketing.",
  },
];

export const publishedJournalPosts = journalPosts.filter(
  (post) => post.status === "published",
);

export const draftJournalPosts = journalPosts.filter(
  (post) => post.status === "draft",
);

export function getPublishedJournalPost(slug: string) {
  return publishedJournalPosts.find((post) => post.slug === slug);
}
