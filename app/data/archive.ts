export type ArchiveFilter =
  | "All"
  | "AI-Assisted"
  | "Applied AI"
  | "Automation"
  | "Business Intelligence"
  | "B.Tech"
  | "Retail"
  | "MBA";

export type ArchiveCategory =
  | "AI-Assisted Product Building"
  | "AI + DATA SCIENCE"
  | "Automation & Operations"
  | "Business Intelligence"
  | "B.Tech Projects"
  | "Retail Learning"
  | "MBA Case Notes";

export type ProjectScreenshot = {
  src: string;
  alt: string;
  caption?: string;
  placement?: "cover" | "detail" | "gallery";
};

export type ArchiveProject = {
  slug: string;
  title: string;
  category: ArchiveCategory;
  filter: Exclude<ArchiveFilter, "All">;
  status: string;
  shortDescription: string;
  context: string;
  problem: string;
  contribution: string;
  tools: string[];
  impact: string;
  learning: string;
  futureDirection: string;
  visual?: {
    image?: string;
    alt: string;
    caption?: string;
    label?: string;
    motif?: "system" | "search" | "chart" | "automation" | "document" | "vision" | "retail" | "case";
    images?: ProjectScreenshot[];
  };
  sections?: {
    title: string;
    body: string[];
  }[];
};

export const archiveFilters: ArchiveFilter[] = [
  "All",
  "AI-Assisted",
  "Applied AI",
  "Automation",
  "Business Intelligence",
  "B.Tech",
  "Retail",
  "MBA",
];

export const archiveProjects: ArchiveProject[] = [
  {
    slug: "living-ai-portfolio-system",
    title: "Living AI Portfolio System",
    category: "AI-Assisted Product Building",
    filter: "AI-Assisted",
    status: "Building",
    shortDescription:
      "A reviewed, AI-assisted portfolio system that keeps proof, MBA notes, analytics, and public writing in one living loop.",
    context:
      "Designed as a portfolio that can evolve with my MBA journey, applied work, writing, analytics, and professional direction.",
    problem:
      "Most portfolios freeze into a polished page and then slowly lose truth. I wanted a system that could keep showing how my thinking, proof, and direction are changing.",
    contribution:
      "Directed the product vision, content strategy, positioning, archive model, journal foundation, visual tone, analytics layer, and automation roadmap while using AI tools to accelerate implementation and iteration.",
    tools: [
      "Product direction",
      "Content strategy",
      "Next.js",
      "GitHub Actions",
      "AI-assisted development",
    ],
    impact:
      "Created a maintainable portfolio system with project archiving, journal foundations, analytics reporting, LinkedIn adaptation, and approval-first automation.",
    learning:
      "AI is useful when the human direction is clear. Taste, review, and positioning still decide whether anything feels credible.",
    futureDirection:
      "Evolve the system into weekly AI, product, business, and market insight posts with source-backed writing, LinkedIn adaptations, visual prompts, and human-reviewed publishing.",
    visual: {
      image: "/images/projects/living-system-map.svg",
      alt: "Abstract system map for the living AI portfolio workflow",
      caption: "AI drafts, human review, journal notes, analytics, LinkedIn drafts, and visual prompts in one loop.",
      label: "Living system map",
      motif: "system",
    },
    sections: [
      {
        title: "What it is",
        body: [
          "This portfolio is not meant to sit still. It is a place where MBA work, project proof, notes, experiments, analytics, and public writing can keep becoming more useful over time.",
        ],
      },
      {
        title: "Why I built it",
        body: [
          "A normal portfolio can turn into a neat page that slowly goes stale. I wanted something closer to a personal operating system: a home for work I have done, ideas I am testing, and the direction I am growing into.",
          "The goal is not to publish everything. The goal is to keep a reviewed trail of what is worth showing and remove anything that only adds noise.",
        ],
      },
      {
        title: "My role",
        body: [
          "I shaped the product direction, content structure, visual tone, archive model, automation roadmap, and review loop.",
          "AI helped with speed: implementation, exploration, drafts, and iteration. The decisions, taste, and final publishing judgment stayed with me.",
        ],
      },
      {
        title: "What the system includes",
        body: [
          "It brings together the homepage, archive, journal, weekly insight scripts, LinkedIn draft flow, future visual prompts, analytics notes, and a review-first publishing rule.",
        ],
      },
      {
        title: "Product thinking",
        body: [
          "The product logic is simple: make the site easy to update, easy to scan, credible to a recruiter, and still personal enough that it does not feel like a generated profile.",
          "New MBA projects, market notes, AI workflow experiments, and case reflections should fit without redesigning the whole thing each time.",
        ],
      },
      {
        title: "AI and automation angle",
        body: [
          "This is an experiment in AI-assisted execution, not AI-authored identity. AI can reduce friction between idea and first version, but quality still comes from review.",
          "The publishing workflow is intentionally approval-first. Drafts can be generated; publishing still needs a human yes.",
        ],
      },
      {
        title: "What I learned",
        body: [
          "Prompting is not the point. Direction is. AI becomes much better when the person using it knows what good should feel like.",
          "I also learned that automation needs a reason to exist. A draft is helpful only if the review process makes it sharper.",
        ],
      },
      {
        title: "Future direction",
        body: [
          "The next version will support weekly AI, product, business, and market insight articles, shorter LinkedIn adaptations, AI-generated visual prompts where appropriate, source-backed writing, and gradual additions from MBA, marketing, strategy, and product work.",
        ],
      },
    ],
  },
  {
    slug: "applied-image-search",
    title: "Image-Led Product Discovery",
    category: "AI + DATA SCIENCE",
    filter: "Applied AI",
    status: "Shipped",
    shortDescription:
      "Image-led product discovery flow for an agri-commerce context, helping shoppers move from visual intent to product language.",
    context:
      "Built in BigHaat's agri-commerce setting, where search quality can influence discovery, confidence, and purchase intent.",
    problem:
      "Users may recognize what they need visually before they can describe it clearly. That creates a gap between intent and searchable language.",
    contribution:
      "Built an image-led discovery workflow using OpenAI, FastAPI, and image processing to connect uploaded visuals with relevant product and content signals.",
    tools: ["OpenAI", "FastAPI", "Image processing"],
    impact: "Improved product discovery in an agri-commerce setting.",
    learning:
      "Applied AI becomes valuable when it removes effort at a specific moment in the purchase journey.",
    futureDirection:
      "Expand the case into a deeper product study around search behavior, visual intent, and assisted discovery.",
    visual: {
      image: "/images/projects/image-led-product-discovery.svg",
      alt: "Product discovery visual showing an image search workflow",
      caption: "A visual search path for moments when the user knows the look before the name.",
      label: "Image-led search",
      motif: "search",
    },
  },
  {
    slug: "order-drop-detection",
    title: "Order Drop Early Warning",
    category: "Automation & Operations",
    filter: "Automation",
    status: "Operational",
    shortDescription:
      "Hourly anomaly layer for BigHaat order movement, designed to surface unusual shifts earlier in the day.",
    context:
      "Order movement can change quickly across channels and categories. Teams need early signals when something unusual starts happening.",
    problem:
      "When order movement shifts across channels or categories, teams need a clear signal that helps them investigate sooner.",
    contribution:
      "Built hourly anomaly detection with Python, dashboards, and alerting logic so teams could spot drops and investigate sooner.",
    tools: ["Python", "Anomaly detection", "Dashboards", "Alerts"],
    impact:
      "Created a faster signal layer for operational response instead of waiting for end-of-day diagnosis.",
    learning:
      "Decision support matters most when it connects signals to urgency and clear follow-up decisions.",
    futureDirection:
      "Extend the case with alert examples, diagnosis workflows, and how teams can prioritize causes.",
    visual: {
      image: "/images/projects/operations-signal.svg",
      alt: "Operational alert timeline for order drop detection",
      caption: "Hourly signals designed to make unusual order movement easier to notice early.",
      label: "Signal timeline",
      motif: "automation",
    },
  },
  {
    slug: "document-intelligence-system",
    title: "Faster Product Lookup with RAG",
    category: "AI + DATA SCIENCE",
    filter: "Applied AI",
    status: "Built",
    shortDescription:
      "RAG-style lookup for product and internal PDFs so repeated document questions did not keep becoming manual work.",
    context:
      "Product and operational information often sits inside PDFs and internal documents that are slow to search manually.",
    problem:
      "Manual document lookup creates repeated effort, slower answers, and avoidable dependency on people who already know where information lives.",
    contribution:
      "Built an LLM-based RAG workflow to query documents, retrieve relevant context, and make product information easier to reach.",
    tools: ["LLMs", "RAG", "Python"],
    impact:
      "Reduced manual search effort and improved speed of internal information access.",
    learning:
      "Retrieval work is useful when it makes internal knowledge easier to reach at the moment of need and still keeps trust visible.",
    futureDirection:
      "Develop this into a clearer internal-knowledge case study with retrieval quality, UX, and trust considerations.",
    visual: {
      image: "/images/projects/rag-product-lookup.svg",
      alt: "Document intelligence interface placeholder",
      caption: "A RAG flow for turning scattered PDFs and internal documents into faster lookup.",
      label: "Retrieval flow",
      motif: "document",
    },
  },
  {
    slug: "invoice-pdf-automation",
    title: "Invoice Data Extraction Automation",
    category: "Automation & Operations",
    filter: "Automation",
    status: "Built",
    shortDescription:
      "OCR and parsing workflow that turned repeated invoice and PDF extraction into a structured review task.",
    context:
      "Invoices and PDFs often require repetitive extraction, validation, and entry work before the actual operational decision can happen.",
    problem:
      "Images and PDFs often need careful extraction and validation before the data becomes useful for operations.",
    contribution:
      "Automated invoice image and PDF data extraction using EasyOCR, pdfbuilder, and Python regex, with attention to exceptions and review flow.",
    tools: ["EasyOCR", "pdfbuilder", "Python regex"],
    impact: "Reduced repeated manual data-entry and validation effort.",
    learning:
      "Practical automation becomes valuable when it removes repeated effort without hiding the places where human review still matters.",
    futureDirection:
      "Add structured examples around extraction accuracy, exception handling, and validation flow.",
    visual: {
      image: "/images/projects/document-extraction.svg",
      alt: "Invoice extraction workflow placeholder",
      caption: "OCR, parsing, and validation stitched into a cleaner extraction flow.",
      label: "Extraction flow",
      motif: "document",
    },
  },
  {
    slug: "competitor-price-intelligence",
    title: "Competitor Pricing Intelligence",
    category: "Business Intelligence",
    filter: "Business Intelligence",
    status: "Built",
    shortDescription:
      "Crawled 9 competitor sites, matched products fuzzily, and surfaced price movement as a business signal.",
    context:
      "Pricing signals can reveal market movement, competitor behavior, and tactical pressure.",
    problem:
      "Competitor prices were spread across multiple sites, making comparison and monitoring difficult.",
    contribution:
      "Crawled 9 competitor sites and built PostgreSQL pipelines with fuzzy search and dashboards for price movement tracking.",
    tools: ["Selenium", "Scrapy", "PostgreSQL", "Fuzzy search", "Dashboards"],
    impact: "Identified competitor price changes mirroring ours by 65%.",
    learning:
      "Pricing is not only a technical tracking problem. It is a market signal with timing, imitation, and competitive pressure inside it.",
    futureDirection:
      "Turn this into a market-intelligence case with pricing patterns, signal quality, and business interpretation.",
    visual: {
      image: "/images/projects/pricing-intelligence.svg",
      alt: "Competitor pricing dashboard placeholder",
      caption: "Pricing movement framed as a market signal, not just a scraped number.",
      label: "Pricing signals",
      motif: "chart",
    },
  },
  {
    slug: "logistics-status-automation",
    title: "Logistics Visibility Automation",
    category: "Automation & Operations",
    filter: "Automation",
    status: "Built",
    shortDescription:
      "Logistics scraping workflow that turned fragmented partner status updates into clearer customer communication triggers.",
    context:
      "Customer communication depends on operational visibility across logistics partners.",
    problem:
      "When order status updates are delayed or fragmented, customers receive less timely communication.",
    contribution:
      "Scraped logistics partner sites for real-time order status updates and connected those updates to automated user notifications.",
    tools: ["Web scraping", "Automation workflows"],
    impact:
      "Improved status visibility and supported more timely customer communication.",
    learning:
      "Customer communication improves when operational visibility improves first.",
    futureDirection:
      "Document the workflow as a customer-experience operations case.",
    visual: {
      image: "/images/projects/logistics-visibility.svg",
      alt: "Logistics status automation placeholder",
      caption: "A status loop for turning partner updates into clearer customer communication.",
      label: "Status flow",
      motif: "automation",
    },
  },
  {
    slug: "content-automation-system",
    title: "Content Operations Automation",
    category: "Automation & Operations",
    filter: "Automation",
    status: "Shipped",
    shortDescription:
      "Automated content collection workflow that made publishing more consistent and useful for a farming audience.",
    context:
      "Regular content operations need both relevance and consistency.",
    problem:
      "Manual content collection can slow down cadence and make publishing less consistent.",
    contribution:
      "Automated content collection from Krishi Jagran and Krishak Jagat for Kisan Sandesh.",
    tools: ["Web scraping", "Automation"],
    impact: "Increased engagement by 144%.",
    learning:
      "Content operations need both relevance and cadence; one without the other fades quickly.",
    futureDirection:
      "Expand this into a content-operations note around cadence, selection, and audience usefulness.",
    visual: {
      image: "/images/projects/content-automation.svg",
      alt: "Content operations automation placeholder",
      caption: "A simple collect, select, and publish rhythm for more consistent content operations.",
      label: "Content cadence",
      motif: "automation",
    },
  },
  {
    slug: "crop-advisory-enhancement",
    title: "Crop Advisory Model Improvement",
    category: "AI + DATA SCIENCE",
    filter: "Applied AI",
    status: "Improved",
    shortDescription:
      "LLM and image-processing work aimed at making a crop advisory workflow more useful in high-context farm decisions.",
    context:
      "Agricultural advisory tools need useful outputs in practical, high-context situations.",
    problem:
      "Image-led advisory workflows need stronger reliability before they can support confident decisions.",
    contribution:
      "Worked on improving Crop Doctor model accuracy through LLM integration and better image processing.",
    tools: ["LLMs", "Image processing"],
    impact:
      "Improved the practical usefulness of an advisory workflow; exact public metrics are not shown here.",
    learning:
      "AI in agriculture needs reliability, context, and practical usefulness before it deserves trust.",
    futureDirection:
      "Develop this into a case about AI reliability, domain context, and decision support.",
    visual: {
      image: "/images/projects/crop-advisory.svg",
      alt: "Crop advisory model improvement placeholder",
      caption: "Image context and model reliability as the useful part of an advisory workflow.",
      label: "Advisory loop",
      motif: "vision",
    },
  },
  {
    slug: "cancellation-prediction",
    title: "Cancellation Risk Prediction",
    category: "AI + DATA SCIENCE",
    filter: "Applied AI",
    status: "Built",
    shortDescription:
      "Prediction model for identifying likely order cancellations earlier, so follow-up could happen with better timing.",
    context:
      "Order confirmation workflows can be delayed when teams manually identify cancellation risk.",
    problem:
      "Order confirmation workflows need early risk signals so teams can prioritize follow-up with more confidence.",
    contribution:
      "Built an order cancellation prediction model to reduce manual confirmation delay.",
    tools: ["Machine learning", "Python"],
    impact: "Reduced manual confirmation delay by 1-2 days.",
    learning:
      "Predictive work matters when it improves timing, reduces uncertainty, and gives teams a clearer next action.",
    futureDirection:
      "Add clearer model framing around signals, workflow usage, and decision thresholds.",
    visual: {
      image: "/images/projects/operations-signal.svg",
      alt: "Cancellation risk prediction placeholder",
      caption: "A prediction signal meant to shorten manual confirmation lag.",
      label: "Prediction signal",
      motif: "chart",
    },
  },
  {
    slug: "runtime-optimization",
    title: "Production Workflow Optimization",
    category: "Automation & Operations",
    filter: "Automation",
    status: "Improved",
    shortDescription:
      "Production Python improvements that reduced runtime, made failure modes more visible, and strengthened operational reliability.",
    context:
      "Production workflows need predictable performance and visible failure modes.",
    problem:
      "Production workflows need dependable runtime, visible alerts, and error handling that teams can trust.",
    contribution:
      "Improved production code reliability through better error handling, alerts, webhooks, and database connections.",
    tools: ["Python", "Database optimization", "Alerts", "Error handling"],
    impact: "Reduced production runtime by 60%.",
    learning:
      "Performance is not just engineering polish; it changes whether a workflow feels dependable to the people using it.",
    futureDirection:
      "Document this as an operations-quality case around reliability, monitoring, and maintainability.",
    visual: {
      image: "/images/projects/operations-signal.svg",
      alt: "Production workflow optimization placeholder",
      caption: "Runtime, alerts, and reliability treated as operational quality work.",
      label: "Reliability loop",
      motif: "automation",
    },
  },
  {
    slug: "online-diagrammatic-tool",
    title: "Collaborative Diagramming Tool",
    category: "B.Tech Projects",
    filter: "B.Tech",
    status: "Academic build",
    shortDescription:
      "Real-time collaborative diagram platform with document sharing.",
    context:
      "Built during the B.Tech chapter as a full-stack collaboration project.",
    problem:
      "Collaborative diagramming requires real-time communication, document access, and user authentication to work smoothly.",
    contribution:
      "Built a real-time collaborative diagram platform with secure document sharing and multi-user interaction.",
    tools: ["Node.js", "Express.js", "Socket.IO", "MongoDB", "JWT", "HTML/CSS"],
    impact:
      "Created early full-stack experience across collaboration, auth, and real-time architecture.",
    learning:
      "Early experience in real-time collaboration, authentication, and full-stack architecture.",
    futureDirection:
      "Reframe as a product utility case around collaboration flows and document access.",
    visual: {
      image: "/images/projects/diagramming-tool.svg",
      alt: "Screenshot placeholder for the collaborative diagramming tool",
      caption: "A collaboration canvas graphic until a real product screenshot is added.",
      label: "Screenshot slot",
      motif: "system",
    },
  },
  {
    slug: "stocksense-price-predict",
    title: "StockSense Forecasting Interface",
    category: "B.Tech Projects",
    filter: "B.Tech",
    status: "Academic build",
    shortDescription:
      "Stock price prediction app with forecasting and interactive visualizations.",
    context:
      "Built as a forecasting and data-visualization project using public market data.",
    problem:
      "Forecasting outputs can be hard to interpret without a clear interface and visual context.",
    contribution:
      "Built a Streamlit app using historical data, Prophet forecasting, yfinance, Pandas, and Plotly visualizations.",
    tools: ["Python", "Streamlit", "Prophet", "yfinance", "Pandas", "Plotly"],
    impact:
      "Created a usable interface for exploring time-series forecasts and market data.",
    learning:
      "Forecasting becomes useful only when the output is interpretable.",
    futureDirection:
      "Improve framing around uncertainty, model limits, and decision usefulness.",
    visual: {
      image: "/images/projects/stocksense-forecasting.svg",
      alt: "Screenshot placeholder for the StockSense forecasting interface",
      caption: "Forecasting, charting, and uncertainty presented as an interface story.",
      label: "Screenshot slot",
      motif: "chart",
    },
  },
  {
    slug: "leather-defect-detection",
    title: "Leather Defect Detection",
    category: "B.Tech Projects",
    filter: "B.Tech",
    status: "Academic build",
    shortDescription:
      "Deep learning ensemble model for leather defect detection with Flask integration.",
    context:
      "Built as a computer-vision project focused on visual quality inspection.",
    problem:
      "Defect detection requires accuracy, consistency, and a deployable interface for practical use.",
    contribution:
      "Built a deep learning ensemble using CNN, VGG, AlexNet, DenseNet, Xception, and Inception, integrated into a Flask backend and RESTful API.",
    tools: [
      "Python",
      "CNN",
      "VGG",
      "AlexNet",
      "DenseNet",
      "Xception",
      "Inception",
      "Flask",
    ],
    impact:
      "Created experience in model comparison, backend integration, and API-based deployment.",
    learning:
      "Model accuracy depends heavily on environment, data quality, and deployment context.",
    futureDirection:
      "Present this as a machine-learning deployment case with more attention to data and operating context.",
    visual: {
      alt: "Screenshot placeholder for the leather defect detection interface",
      label: "Live app capture",
      motif: "vision",
      images: [
        {
          src: "/images/projects/leather-defect-detection-01.jpg",
          alt: "Screenshot of the Leather Defect Detection upload interface",
          caption: "Captured from the deployed Leather Defect Detection demo.",
          placement: "cover",
        },
      ],
    },
  },
  {
    slug: "cm-silks-retail-learning",
    title: "CM Silks Retail Learning",
    category: "Retail Learning",
    filter: "Retail",
    status: "Learning",
    shortDescription:
      "A family saree retail lens on trust, aspiration, local positioning, pricing, customer education, and modern brand memory.",
    context:
      "CM Silks is not a distant case study for me. It is a family retail context where I can observe how people choose sarees, compare value, ask for reassurance, and remember a brand.",
    problem:
      "Saree retail is not only about visibility. It depends on trust, occasion, fabric understanding, aspiration, price perception, and the comfort of being guided well.",
    contribution:
      "Collected observations around content, customer education, store trust, local positioning, and how buyers compare value across fabrics, occasions, and price points.",
    tools: ["Content planning", "Customer observation", "Retail positioning"],
    impact:
      "Built practical exposure to customer education, local brand memory, and trust-led retail communication.",
    learning:
      "Retail keeps reminding me that many purchase decisions are emotional, social, and practical at the same time.",
    futureDirection:
      "Develop into concise notes on saree retail trust, customer education, local positioning, content-led brand building, and purchase behavior.",
    visual: {
      image: "/images/projects/retail-signals.svg",
      alt: "CM Silks retail customer behavior notes placeholder",
      caption: "Trust, price, occasion, aspiration, and store experience as everyday behavior signals.",
      label: "Observation notes",
      motif: "retail",
    },
  },
  {
    slug: "mba-case-notes",
    title: "MBA Case Notes & Market Signals",
    category: "MBA Case Notes",
    filter: "MBA",
    status: "Building",
    shortDescription:
      "A growing space for product, marketing, strategy, consumer behavior, and market analysis work from the IIM Sirmaur chapter.",
    context:
      "A developing archive for the IIM Sirmaur MBA journey as technical thinking expands into business cases, markets, customers, and strategy.",
    problem:
      "MBA work can easily become scattered across slides, cases, notes, and group discussions. It needs a place where useful thinking can mature before it becomes public.",
    contribution:
      "Creating a structure for future product notes, marketing work, strategy cases, consumer-behavior observations, and market analysis.",
    tools: ["Product thinking", "Marketing", "Strategy", "Consumer behavior"],
    impact:
      "Future-ready structure for adding stronger MBA work as coursework, cases, live projects, and market notes develop.",
    learning:
      "This section should grow from real coursework, cases, observations, and projects rather than filler.",
    futureDirection:
      "Add selected MBA projects with clearer problem framing, analysis, and recommendations.",
    visual: {
      image: "/images/projects/mba-case-notes.svg",
      alt: "MBA case notes placeholder",
      caption: "A growing space for product, marketing, strategy, and consumer-behavior notes.",
      label: "Case space",
      motif: "case",
    },
  },
];

export const homepageProjectSlugs = [
  "living-ai-portfolio-system",
  "applied-image-search",
  "order-drop-detection",
  "invoice-pdf-automation",
  "competitor-price-intelligence",
];

export function getProjectBySlug(slug: string) {
  return archiveProjects.find((project) => project.slug === slug);
}

export const homepageProjects = archiveProjects.filter((project) =>
  homepageProjectSlugs.includes(project.slug),
);
