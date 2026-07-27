export type ToolStatus =
  | "Live"
  | "In Build"
  | "Concept"
  | "Priority Candidate";

export type ToolAccent =
  | "emerald"
  | "gold"
  | "violet"
  | "slate"
  | "steel"
  | "copper"
  | "sage";

export type AITool = {
  slug: string;
  name: string;
  status: ToolStatus;
  category: string;
  oneLineBenefit: string;
  homepageAbout: string;
  usefulWhen: string;
  proofOfNeed: string;
  microFeatures: string[];
  route: `/tools/${string}`;
  accent: ToolAccent;
  spotlightNote: string;
  problemStatement: string;
  audience: string[];
  whatItWillDo: string;
  plannedFeatures: string[];
  whyItMatters: string;
  plannedWorkflow: string[];
  relatedSlugs: string[];
};

export const toolsDeskTitle = "MBA Tools Desk";

export const toolsDeskDescription =
  "Small, practical tools I am building from the messier parts of MBA life: cases, placements, interviews, research, business math, and career stories.";

export const statusCta: Record<ToolStatus, string> = {
  Live: "Open Tool",
  "In Build": "View Build Plan",
  Concept: "View Roadmap",
  "Priority Candidate": "View Roadmap",
};

export const statusLabels: Record<ToolStatus, string> = {
  Live: "Live tool",
  "In Build": "Currently working on",
  Concept: "Concept roadmap",
  "Priority Candidate": "Priority candidate",
};

export const aiTools: AITool[] = [
  {
    slug: "case-war-room",
    name: "Case War Room",
    status: "Live",
    category: "Case Competitions",
    oneLineBenefit:
      "Decode business cases before jumping to solutions: exhibits, issue tree, work split, and recommendation logic.",
    homepageAbout:
      "A case-room for the first messy hour, when everyone has opinions, exhibits are half-read, and the slide story is still foggy.",
    usefulWhen:
      "Use it before the team starts building slides or splitting work.",
    proofOfNeed:
      "Built because case teams often lose more time agreeing on the problem than solving it.",
    microFeatures: ["Exhibit read", "Issue tree", "Work split"],
    route: "/tools/case-war-room",
    accent: "gold",
    spotlightNote: "Currently the first tool on my build desk.",
    problemStatement:
      "Case teams often jump into slides before they agree on the decision, the evidence, or the work split. That creates confident decks with weak logic underneath.",
    audience: [
      "MBA case competition teams",
      "Students preparing consulting-style presentations",
      "Analysts who need to turn messy briefs into decisions",
    ],
    whatItWillDo:
      "It will help a team read the brief, decode exhibits, create an issue tree, assign workstreams, compare strategic options, and turn the final logic into a deck-ready outline.",
    plannedFeatures: [
      "Brief intake with exhibit-by-exhibit notes",
      "Problem framing before solution brainstorming",
      "Team role split across research, numbers, strategy, slides, and story",
      "Recommendation matrix with risks, assumptions, and proof needed",
      "Final slide outline with a cleaner narrative order",
    ],
    whyItMatters:
      "Good case work is not only about finding an answer. It is about creating shared clarity fast enough for a team to make better trade-offs under pressure.",
    plannedWorkflow: [
      "Paste the case brief",
      "Mark the decision and constraints",
      "Decode exhibits and evidence gaps",
      "Assign workstreams",
      "Export the recommendation outline",
    ],
    relatedSlugs: [
      "business-news-talking-points",
      "mba-calculator-lab",
      "market-research-survey-builder",
    ],
  },
  {
    slug: "sip-readiness-scorecard",
    name: "SIP Readiness Scorecard",
    status: "Live",
    category: "Placements",
    oneLineBenefit:
      "Check SIP readiness and see what to fix first: role fit, resume evidence, interview gaps, and a 30-day plan.",
    homepageAbout:
      "A practical placement-prep scorecard for students who know they need to prepare but cannot see which gap is hurting them most.",
    usefulWhen:
      "Use it before shortlisting roles, rewriting a resume, or joining mock interviews.",
    proofOfNeed:
      "Built from the anxiety of vague preparation: too much advice, not enough prioritization.",
    microFeatures: ["Role fit", "Resume evidence", "30-day plan"],
    route: "/tools/sip-readiness-scorecard",
    accent: "violet",
    spotlightNote: "A live readiness desk for turning placement anxiety into a repair plan.",
    problemStatement:
      "Placement prep becomes stressful when every gap feels equally urgent. Students need to know whether the issue is role clarity, resume evidence, interview confidence, or simply weak sequencing.",
    audience: [
      "MBA students preparing for SIPs or finals",
      "Early professionals switching roles",
      "Placement prep groups comparing readiness honestly",
    ],
    whatItWillDo:
      "It will turn target roles, resume evidence, project experience, and interview confidence into a readiness scorecard with a few concrete fixes to start this week.",
    plannedFeatures: [
      "Role-family readiness score",
      "Resume evidence audit by strength, not just keywords",
      "Interview risk prompts for common weak spots",
      "30-day gap-fixing plan",
      "Weekly check-in format for accountability",
    ],
    whyItMatters:
      "Preparation feels lighter when the next step is visible. A scorecard cannot remove uncertainty, but it can stop students from confusing motion with progress.",
    plannedWorkflow: [
      "Choose target role families",
      "Enter resume highlights and constraints",
      "Review readiness scores",
      "Pick the most expensive gaps",
      "Follow a 30-day repair plan",
    ],
    relatedSlugs: [
      "weak-internship-reframer",
      "company-interview-intelligence",
      "mba-skill-gap-heatmap",
    ],
  },
  {
    slug: "company-interview-intelligence",
    name: "Company Interview Intelligence",
    status: "Concept",
    category: "Interviews",
    oneLineBenefit:
      "Prepare for a company interview with business model, role angle, competitor context, and sharper questions.",
    homepageAbout:
      "A company-role prep card for the night before an interview, when tabs are open everywhere and the story still feels scattered.",
    usefulWhen:
      "Use it after you know the company and role, before you write your opening pitch.",
    proofOfNeed:
      "Built because company research is easy to collect and hard to connect to your own fit.",
    microFeatures: ["Business model", "Role angle", "Question bank"],
    route: "/tools/company-interview-intelligence",
    accent: "steel",
    spotlightNote: "A prep card for the moment before the interview room gets loud.",
    problemStatement:
      "Interview preparation is often scattered across company pages, news, job descriptions, and generic question banks. The missing part is connecting that research to the role and the candidate's story.",
    audience: [
      "MBA students preparing for company interviews",
      "Candidates switching into product, marketing, analytics, or consulting",
      "Placement teams building prep material",
    ],
    whatItWillDo:
      "It will create a focused company-role card with business model notes, competitor context, role-fit angles, likely interview questions, and questions the candidate can ask back.",
    plannedFeatures: [
      "Company snapshot without brochure language",
      "Business model and competitor context",
      "Role-fit talking points",
      "Candidate story alignment checklist",
      "Likely interview questions and questions to ask",
    ],
    whyItMatters:
      "Strong preparation is not memorizing facts. It is understanding how the company works, where the role fits, and how your story can speak to that context.",
    plannedWorkflow: [
      "Enter company and role",
      "Review business and competitor context",
      "Map your strongest fit angles",
      "Practice company-specific questions",
      "Save a concise prep card",
    ],
    relatedSlugs: [
      "sip-readiness-scorecard",
      "business-news-talking-points",
      "weak-internship-reframer",
    ],
  },
  {
    slug: "business-news-talking-points",
    name: "Business News to Talking Points",
    status: "Concept",
    category: "Business Awareness",
    oneLineBenefit:
      "Turn business news into GD, PI, WAT, LinkedIn, and classroom points without sounding rehearsed.",
    homepageAbout:
      "A thinking aid for turning one news item into a balanced argument, a business implication, and a point of view you can actually say.",
    usefulWhen:
      "Use it before GD practice, PI prep, WAT writing, or a LinkedIn reflection.",
    proofOfNeed:
      "Built because most news consumption stops at summary, while interviews ask for judgment.",
    microFeatures: ["GD map", "PI angle", "LinkedIn point"],
    route: "/tools/business-news-talking-points",
    accent: "copper",
    spotlightNote: "From headline to usable business thinking.",
    problemStatement:
      "Business news is often consumed passively. Students need a way to turn events into arguments, stakeholder implications, counterpoints, and examples they can use in real conversations.",
    audience: [
      "MBA students preparing for GD, PI, and WAT",
      "Students trying to speak better in class discussions",
      "Early professionals building business awareness",
    ],
    whatItWillDo:
      "It will transform a news article, link, or topic into a business issue, balanced talking points, interview angles, WAT structure, and a short LinkedIn-style point of view.",
    plannedFeatures: [
      "News summary with business context",
      "For-against GD argument map",
      "PI and WAT angles",
      "Stakeholder and risk lens",
      "Short LinkedIn reflection draft",
    ],
    whyItMatters:
      "Business awareness becomes valuable when it helps someone reason, compare, and communicate, not just repeat what happened.",
    plannedWorkflow: [
      "Paste a link, article, or topic",
      "Extract the business issue",
      "Generate balanced arguments",
      "Review stakeholders and risks",
      "Turn it into a shareable point of view",
    ],
    relatedSlugs: [
      "company-interview-intelligence",
      "case-war-room",
      "market-research-survey-builder",
    ],
  },
  {
    slug: "mba-skill-gap-heatmap",
    name: "MBA Skill Gap Heatmap",
    status: "Concept",
    category: "Career Planning",
    oneLineBenefit:
      "Map your current skills against target roles and see which gaps deserve attention first.",
    homepageAbout:
      "A role-readiness map for students choosing between PM, marketing, analytics, consulting, category, and strategy paths.",
    usefulWhen:
      "Use it when your learning list is long but your next project needs to be chosen.",
    proofOfNeed:
      "Built because career advice is easy to collect and hard to prioritize by role.",
    microFeatures: ["Role map", "Gap heatmap", "Learning plan"],
    route: "/tools/mba-skill-gap-heatmap",
    accent: "sage",
    spotlightNote: "A role map that makes gaps visible without making them dramatic.",
    problemStatement:
      "Students hear many skill suggestions, but it is hard to know which ones matter for a specific role and which gaps are urgent enough to act on now.",
    audience: [
      "MBA students choosing a role direction",
      "Early professionals planning a switch",
      "Mentors helping students prioritize learning",
    ],
    whatItWillDo:
      "It will compare current skill confidence with target role expectations and produce a heatmap, project suggestions, and a learning plan.",
    plannedFeatures: [
      "Target role selection across common MBA paths",
      "Current skill self-assessment",
      "Skill gap heatmap",
      "Project and learning recommendations",
      "Progress milestones",
    ],
    whyItMatters:
      "Career planning gets easier when vague ambition becomes a concrete gap map with next steps that can be acted on this week.",
    plannedWorkflow: [
      "Pick target role families",
      "Score current skill confidence",
      "Review the heatmap",
      "Choose priority gaps",
      "Build a learning and project plan",
    ],
    relatedSlugs: [
      "sip-readiness-scorecard",
      "mba-calculator-lab",
      "weak-internship-reframer",
    ],
  },
  {
    slug: "mba-calculator-lab",
    name: "MBA Calculator Lab",
    status: "Concept",
    category: "Business Calculators",
    oneLineBenefit:
      "Use MBA math without losing the interpretation: break-even, CAC/LTV, TAM, RICE, NPV, and margin.",
    homepageAbout:
      "A calculator shelf for business numbers that usually end up in cases, live projects, slides, and hurried decision notes.",
    usefulWhen:
      "Use it when the formula is known but the implication still needs to be written clearly.",
    proofOfNeed:
      "Built because the number is only useful when the recommendation explains what changed.",
    microFeatures: ["Metric math", "Sensitivity", "Slide note"],
    route: "/tools/mba-calculator-lab",
    accent: "slate",
    spotlightNote: "Calculators with interpretation, not just outputs.",
    problemStatement:
      "Business formulas are easy to look up but harder to apply cleanly in cases, projects, and decision notes without losing the interpretation.",
    audience: [
      "MBA students working on projects or cases",
      "Analysts preparing quick decision notes",
      "Teams building finance, marketing, or product slides",
    ],
    whatItWillDo:
      "It will provide practical calculators for common MBA metrics and convert the output into plain-language implications for slides or decisions.",
    plannedFeatures: [
      "Break-even and contribution margin calculators",
      "CAC/LTV and funnel math",
      "TAM/SAM/SOM estimator",
      "RICE prioritization helper",
      "NPV, payback, and sensitivity notes",
    ],
    whyItMatters:
      "Numbers are more useful when the tool explains what changed, which assumption matters, and how the answer should appear in a recommendation.",
    plannedWorkflow: [
      "Choose a calculator",
      "Enter assumptions",
      "Review output and sensitivity",
      "Write the business implication",
      "Save or copy the decision note",
    ],
    relatedSlugs: [
      "case-war-room",
      "mba-skill-gap-heatmap",
      "market-research-survey-builder",
    ],
  },
  {
    slug: "weak-internship-reframer",
    name: "Weak Internship Reframer",
    status: "Concept",
    category: "Resume & Interviews",
    oneLineBenefit:
      "Turn thin internship work into honest resume bullets and interview stories without inventing impact.",
    homepageAbout:
      "A candid reframing tool for imperfect internships: unclear ownership, small projects, no clean metric, or a manager who never defined the work well.",
    usefulWhen:
      "Use it before rewriting a resume or answering, 'Tell me about your internship.'",
    proofOfNeed:
      "Built because many students need truthful framing, not inflated achievements.",
    microFeatures: ["Honest framing", "Resume bullets", "PI answers"],
    route: "/tools/weak-internship-reframer",
    accent: "violet",
    spotlightNote: "For experience that was real, but not neatly packaged.",
    problemStatement:
      "Not every internship has a clean project, metric, or brand signal. Students still need to describe what they learned honestly and confidently.",
    audience: [
      "Students with unclear or low-ownership internships",
      "Candidates rebuilding resume bullets",
      "Interview candidates preparing honest PI answers",
    ],
    whatItWillDo:
      "It will turn raw internship notes into truthful resume bullets, learning points, and interview answers without exaggerating impact.",
    plannedFeatures: [
      "Raw work-to-skill mapping",
      "Resume bullet drafting without fake metrics",
      "Ownership and constraint framing",
      "PI answer drafts",
      "Overclaim and red-flag check",
    ],
    whyItMatters:
      "A weaker experience can still show ownership, learning, context, and judgment when it is framed with honesty and structure.",
    plannedWorkflow: [
      "Describe the actual internship work",
      "Identify responsibilities and constraints",
      "Map work to skills and learning",
      "Draft resume bullets",
      "Practice truthful interview answers",
    ],
    relatedSlugs: [
      "sip-readiness-scorecard",
      "company-interview-intelligence",
      "mba-skill-gap-heatmap",
    ],
  },
  {
    slug: "market-research-survey-builder",
    name: "Market Research Survey Builder",
    status: "Concept",
    category: "Marketing Research",
    oneLineBenefit:
      "Build survey questions that do not accidentally bias responses or collect unusable data.",
    homepageAbout:
      "A research-design helper for student projects where the survey often gets built before the decision question is clear.",
    usefulWhen:
      "Use it before sending a questionnaire to classmates, customers, or field respondents.",
    proofOfNeed:
      "Built because bad survey design creates confident-looking data that cannot answer the problem.",
    microFeatures: ["Question design", "Bias check", "Analysis plan"],
    route: "/tools/market-research-survey-builder",
    accent: "copper",
    spotlightNote: "Research design help before the bad questionnaire spreads.",
    problemStatement:
      "Student research projects often start with surveys that ask leading questions, miss variables, or collect data that cannot answer the actual problem.",
    audience: [
      "MBA marketing research teams",
      "Students building live project surveys",
      "Early analysts designing customer research",
    ],
    whatItWillDo:
      "It will help define the research objective, draft survey questions, flag bias, check variable coverage, and create an analysis plan before data collection.",
    plannedFeatures: [
      "Research objective clarifier",
      "Survey question drafting",
      "Bias and leading-question check",
      "Variable and segment coverage review",
      "Analysis plan generator",
    ],
    whyItMatters:
      "Better surveys protect teams from wasting time collecting confident-looking data that cannot support a decision.",
    plannedWorkflow: [
      "Define the research problem",
      "Choose respondents and variables",
      "Draft survey questions",
      "Run bias and coverage checks",
      "Create the analysis plan",
    ],
    relatedSlugs: [
      "case-war-room",
      "business-news-talking-points",
      "mba-calculator-lab",
    ],
  },
];

export function getToolBySlug(slug: string) {
  return aiTools.find((tool) => tool.slug === slug);
}

export function getRelatedTools(tool: AITool) {
  return tool.relatedSlugs
    .map((slug) => getToolBySlug(slug))
    .filter((related): related is AITool => Boolean(related));
}
