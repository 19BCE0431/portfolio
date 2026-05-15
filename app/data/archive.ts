export type ArchiveFilter =
  | "All"
  | "Applied AI"
  | "Automation"
  | "Business Intelligence"
  | "B.Tech"
  | "Retail"
  | "MBA";

export type ArchiveCategory =
  | "Applied AI & Data Science"
  | "Automation & Operations"
  | "Market / Business Intelligence"
  | "B.Tech Projects"
  | "Retail Learning"
  | "MBA Case Notes";

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
};

export const archiveFilters: ArchiveFilter[] = [
  "All",
  "Applied AI",
  "Automation",
  "Business Intelligence",
  "B.Tech",
  "Retail",
  "MBA",
];

export const archiveProjects: ArchiveProject[] = [
  {
    slug: "applied-image-search",
    title: "Visual Product Discovery",
    category: "Applied AI & Data Science",
    filter: "Applied AI",
    status: "Shipped",
    shortDescription:
      "Image-led search flow that reduced discovery friction when users did not know the exact product name.",
    context:
      "Built in a commerce setting where search quality can directly affect discovery, confidence, and purchase intent.",
    problem:
      "Users may recognize what they need visually before they can describe it clearly. That creates a gap between intent and searchable language.",
    contribution:
      "Built an image-led discovery workflow using OpenAI, FastAPI, and image processing to connect uploaded visuals with relevant product or content descriptions.",
    tools: ["OpenAI", "FastAPI", "Image processing"],
    impact: "Increased orders by 28%.",
    learning:
      "Applied AI becomes valuable when it removes effort at a specific point in the purchase journey.",
    futureDirection:
      "Expand the case into a deeper product study around search behavior, visual intent, and assisted discovery.",
  },
  {
    slug: "order-drop-detection",
    title: "Order Drop Early Warning",
    category: "Automation & Operations",
    filter: "Automation",
    status: "Operational",
    shortDescription:
      "Hourly anomaly detection that surfaced order drops early enough for faster operational follow-up.",
    context:
      "Order movement can change quickly. Teams need early signals when something unusual happens.",
    problem:
      "Manual diagnosis can be slow when order drops happen across channels, categories, or operational workflows.",
    contribution:
      "Built hourly anomaly detection with Python, dashboards, and alerting logic to support faster diagnosis of order drops.",
    tools: ["Python", "Anomaly detection", "Dashboards", "Alerts"],
    impact:
      "Created a faster signal layer for operational response and diagnosis.",
    learning:
      "Data Science work matters most when it connects signals to urgency and clear follow-up decisions.",
    futureDirection:
      "Extend the case with alert examples, diagnosis workflows, and how teams can prioritize causes.",
  },
  {
    slug: "document-intelligence-system",
    title: "Document Intelligence for Faster Lookup",
    category: "Applied AI & Data Science",
    filter: "Applied AI",
    status: "Built",
    shortDescription:
      "RAG workflow for searching PDFs and internal documents without repeated manual lookup.",
    context:
      "Product and operational information often sits inside PDFs and internal documents that are slow to search manually.",
    problem:
      "Manual document lookup creates repeated effort and slows down information retrieval.",
    contribution:
      "Built an LLM-based RAG workflow to automate document queries and make product information easier to retrieve.",
    tools: ["LLMs", "RAG", "Python"],
    impact:
      "Reduced manual search effort and improved speed of internal information access.",
    learning:
      "Retrieval work is useful when it makes internal knowledge easier to reach at the moment of need.",
    futureDirection:
      "Develop this into a clearer internal-knowledge case study with retrieval quality, UX, and trust considerations.",
  },
  {
    slug: "invoice-pdf-automation",
    title: "Invoice Data Extraction Automation",
    category: "Automation & Operations",
    filter: "Automation",
    status: "Built",
    shortDescription:
      "OCR and parsing workflow for extracting invoice and PDF data from repeated operational tasks.",
    context:
      "Invoices and PDFs often require repetitive extraction, validation, and entry work.",
    problem:
      "Manual extraction from images and PDFs creates operational friction and quality risk.",
    contribution:
      "Automated invoice image and PDF data extraction using EasyOCR, pdfbuilder, and Python regex.",
    tools: ["EasyOCR", "pdfbuilder", "Python regex"],
    impact: "Reduced repeated manual data-entry and validation effort.",
    learning:
      "Practical automation becomes valuable when it removes repeated operational friction.",
    futureDirection:
      "Add structured examples around extraction accuracy, exception handling, and validation flow.",
  },
  {
    slug: "competitor-price-intelligence",
    title: "Competitor Pricing Intelligence",
    category: "Market / Business Intelligence",
    filter: "Business Intelligence",
    status: "Built",
    shortDescription:
      "Price crawling, fuzzy matching, and dashboards for tracking competitor movement across 9 sites.",
    context:
      "Pricing signals can reveal market movement, competitor behavior, and tactical pressure.",
    problem:
      "Competitor prices were spread across multiple sites, making comparison and monitoring difficult.",
    contribution:
      "Crawled 9 competitor sites and built PostgreSQL pipelines with fuzzy search and dashboards for price movement tracking.",
    tools: ["Selenium", "Scrapy", "PostgreSQL", "Fuzzy search", "Dashboards"],
    impact: "Identified competitor price changes mirroring ours by 65%.",
    learning:
      "Pricing is not only a technical tracking problem; it is a business signal.",
    futureDirection:
      "Turn this into a market-intelligence case with pricing patterns, signal quality, and business interpretation.",
  },
  {
    slug: "logistics-status-automation",
    title: "Logistics Visibility Automation",
    category: "Automation & Operations",
    filter: "Automation",
    status: "Built",
    shortDescription:
      "Real-time order-status scraping connected to more timely customer notification workflows.",
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
      "Customer communication improves when operational visibility improves.",
    futureDirection:
      "Document the workflow as a customer-experience operations case.",
  },
  {
    slug: "content-automation-system",
    title: "Content Operations Automation",
    category: "Automation & Operations",
    filter: "Automation",
    status: "Shipped",
    shortDescription:
      "Automated content collection workflow for improving publishing consistency and audience relevance.",
    context:
      "Regular content operations need both relevance and consistency.",
    problem:
      "Manual content collection can slow down cadence and make publishing less consistent.",
    contribution:
      "Automated content collection from Krishi Jagran and Krishak Jagat for Kisan Sandesh.",
    tools: ["Web scraping", "Automation"],
    impact: "Increased engagement by 144%.",
    learning:
      "Content operations need both relevance and reliable cadence.",
    futureDirection:
      "Expand this into a content-operations note around cadence, selection, and audience usefulness.",
  },
  {
    slug: "crop-advisory-enhancement",
    title: "Crop Advisory Model Improvement",
    category: "Applied AI & Data Science",
    filter: "Applied AI",
    status: "Improved",
    shortDescription:
      "LLM and image-processing work aimed at improving the reliability of a crop advisory workflow.",
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
      "AI in agriculture needs reliability, context, and practical usefulness.",
    futureDirection:
      "Develop this into a case about AI reliability, domain context, and decision support.",
  },
  {
    slug: "cancellation-prediction",
    title: "Cancellation Risk Prediction",
    category: "Applied AI & Data Science",
    filter: "Applied AI",
    status: "Built",
    shortDescription:
      "Prediction model for identifying likely order cancellations earlier in the confirmation workflow.",
    context:
      "Order confirmation workflows can be delayed when teams manually identify cancellation risk.",
    problem:
      "Manual confirmation delays create uncertainty and slow down operational follow-up.",
    contribution:
      "Built an order cancellation prediction model to reduce manual confirmation delay.",
    tools: ["Machine learning", "Python"],
    impact: "Reduced manual confirmation delay by 1-2 days.",
    learning:
      "Predictive work matters when it improves workflow timing and reduces uncertainty.",
    futureDirection:
      "Add clearer model framing around signals, workflow usage, and decision thresholds.",
  },
  {
    slug: "runtime-optimization",
    title: "Production Workflow Optimization",
    category: "Automation & Operations",
    filter: "Automation",
    status: "Improved",
    shortDescription:
      "Production Python reliability and runtime improvements with alerts and database refinements.",
    context:
      "Production workflows need predictable performance and visible failure modes.",
    problem:
      "Slow scripts and fragile error handling can create operational delays and hidden failures.",
    contribution:
      "Improved production code reliability through better error handling, alerts, webhooks, and database connections.",
    tools: ["Python", "Database optimization", "Alerts", "Error handling"],
    impact: "Reduced production runtime by 60%.",
    learning:
      "Performance is not just engineering polish; it changes operational reliability.",
    futureDirection:
      "Document this as an operations-quality case around reliability, monitoring, and maintainability.",
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
  },
  {
    slug: "cm-silks-retail-learning",
    title: "Retail & Customer Behavior Notes",
    category: "Retail Learning",
    filter: "Retail",
    status: "Learning",
    shortDescription:
      "A small learning note on customer education, trust, category understanding, and local retail behavior.",
    context:
      "Ongoing observation of local saree retail and the everyday details behind customer choice.",
    problem:
      "Retail growth is not only about visibility; it depends on trust, education, category understanding, aspiration, and price perception.",
    contribution:
      "Collected observations around content, customer education, trust, local positioning, and how buyers compare value.",
    tools: ["Content planning", "Customer observation", "Retail positioning"],
    impact:
      "Built practical exposure to how customers understand sarees, compare value, and respond to trust-led communication.",
    learning:
      "Retail taught me how trust, aspiration, pricing, and education influence customer decisions.",
    futureDirection:
      "Develop into concise notes on saree retail, customer education, and purchase behavior.",
  },
  {
    slug: "mba-case-notes",
    title: "MBA Case & Market Notes",
    category: "MBA Case Notes",
    filter: "MBA",
    status: "Building",
    shortDescription:
      "A future space for product, marketing, strategy, consumer behavior, and market analysis work.",
    context:
      "A developing archive for work from the IIM Sirmaur MBA journey.",
    problem:
      "The portfolio needs a place for business-school work that is not yet a polished public case study.",
    contribution:
      "Creating a structure for future product teardowns, marketing notes, strategy cases, consumer-behavior observations, and market analysis.",
    tools: ["Product thinking", "Marketing", "Strategy", "Consumer behavior"],
    impact:
      "Future-ready structure for adding stronger MBA work as it develops.",
    learning:
      "This section should grow from real coursework, cases, observations, and projects rather than filler content.",
    futureDirection:
      "Add selected MBA projects with clearer problem framing, analysis, and recommendations.",
  },
];

export const homepageProjectSlugs = [
  "applied-image-search",
  "document-intelligence-system",
  "competitor-price-intelligence",
  "cm-silks-retail-learning",
  "mba-case-notes",
];

export function getProjectBySlug(slug: string) {
  return archiveProjects.find((project) => project.slug === slug);
}

export const homepageProjects = archiveProjects.filter((project) =>
  homepageProjectSlugs.includes(project.slug),
);
