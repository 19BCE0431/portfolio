"use client";

import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Copy,
  Download,
  FileText,
  Gauge,
  Lightbulb,
  MessageSquare,
  PenLine,
  RefreshCw,
  Target,
  Timer,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { AITool } from "../data/tools";
import { Footer } from "./Footer";
import { Reveal } from "./Reveal";
import { SectionLabel } from "./SectionLabel";
import { ToolRouteTracker } from "./ToolRouteTracker";

type RatingKey =
  | "roleClarity"
  | "resumeEvidence"
  | "functionalDepth"
  | "businessAwareness"
  | "interviewStories"
  | "companyPrep"
  | "networking"
  | "executionRhythm";

type RoleFamily =
  | "Marketing"
  | "Finance"
  | "Consulting"
  | "Product"
  | "Analytics"
  | "Operations"
  | "HR"
  | "General Management";

type EvidenceKey = "internship" | "project" | "leadership" | "metric";

type EvidenceItem = {
  key: EvidenceKey;
  label: string;
  prompt: string;
  value: string;
  strength: number;
};

type SipProfile = {
  roleFamily: RoleFamily;
  targetCompanies: string;
  timeline: "This week" | "2 weeks" | "1 month" | "2-3 months";
  experience: "Fresher" | "0-1 year" | "1-3 years" | "3+ years";
  constraints: string;
  ratings: Record<RatingKey, number>;
  evidence: EvidenceItem[];
  mockInterviews: number;
  resumeVersion: "Raw notes" | "Draft" | "Reviewed once" | "Final polish";
};

type Dimension = {
  key: RatingKey;
  label: string;
  description: string;
  weight: number;
};

type RoleProfile = {
  headline: string;
  mustShow: string[];
  riskSignals: string[];
  proofKeywords: string[];
  interviewDrills: string[];
  resumeAngles: string[];
  weights: Partial<Record<RatingKey, number>>;
};

type EvidenceAudit = EvidenceItem & {
  score: number;
  roleFit: number;
  signals: string[];
  missing: string[];
  rewrite: string;
};

const STORAGE_KEY = "mohit-sip-readiness-scorecard-1";

const dimensions: Dimension[] = [
  {
    key: "roleClarity",
    label: "Role clarity",
    description: "You can name the role, why it fits, and what work you want to do.",
    weight: 1.2,
  },
  {
    key: "resumeEvidence",
    label: "Resume evidence",
    description: "Your bullets prove skills through projects, outcomes, ownership, or numbers.",
    weight: 1.35,
  },
  {
    key: "functionalDepth",
    label: "Functional depth",
    description: "You can answer role-specific questions beyond generic MBA language.",
    weight: 1.25,
  },
  {
    key: "businessAwareness",
    label: "Business awareness",
    description: "You can discuss companies, sectors, and recent business issues with judgment.",
    weight: 1,
  },
  {
    key: "interviewStories",
    label: "Interview stories",
    description: "You have structured stories for ownership, conflict, failure, and impact.",
    weight: 1.15,
  },
  {
    key: "companyPrep",
    label: "Company prep",
    description: "You can connect your story to target company roles and business context.",
    weight: 1,
  },
  {
    key: "networking",
    label: "Networking signal",
    description: "You have alumni, seniors, or peer feedback shaping prep direction.",
    weight: 0.8,
  },
  {
    key: "executionRhythm",
    label: "Prep rhythm",
    description: "You are practicing weekly instead of collecting advice passively.",
    weight: 0.95,
  },
];

const roleProfiles: Record<RoleFamily, RoleProfile> = {
  Marketing: {
    headline: "Show customer thinking, brand judgment, channel sense, and clean communication.",
    mustShow: ["Consumer insight", "Campaign or GTM logic", "Sales/channel awareness", "Structured storytelling"],
    riskSignals: ["Only saying creative", "No consumer evidence", "Weak business metric language"],
    proofKeywords: ["consumer", "customer", "brand", "campaign", "channel", "sales", "market", "gtm"],
    interviewDrills: [
      "Pick one brand you admire. What customer problem does it solve better than competitors?",
      "Explain a failed campaign and what you would change in targeting, channel, or message.",
      "Walk through a go-to-market plan for a new campus product in six steps.",
    ],
    resumeAngles: ["consumer insight", "channel execution", "campaign metric", "sales or market research"],
    weights: { resumeEvidence: 1.45, businessAwareness: 1.15, interviewStories: 1.2 },
  },
  Finance: {
    headline: "Show comfort with numbers, valuation logic, financial statements, and risk-return thinking.",
    mustShow: ["Finance fundamentals", "Excel/modeling comfort", "Market awareness", "Numerical clarity"],
    riskSignals: ["Vague interest in finance", "No finance project", "Cannot explain assumptions"],
    proofKeywords: ["valuation", "npv", "irr", "capm", "beta", "model", "financial", "excel", "debt", "equity"],
    interviewDrills: [
      "Explain the difference between profit, cash flow, and value creation using one example.",
      "Tell me how you would estimate a discount rate when data is incomplete.",
      "Walk through one finance project and defend the assumptions you made.",
    ],
    resumeAngles: ["financial discipline", "assumption testing", "ownership under constraints", "spreadsheet/result metric"],
    weights: { functionalDepth: 1.5, resumeEvidence: 1.25, businessAwareness: 1.15 },
  },
  Consulting: {
    headline: "Show structured problem solving, business judgment, and concise client-ready communication.",
    mustShow: ["Issue structuring", "Case practice", "Leadership evidence", "Clear synthesis"],
    riskSignals: ["Framework dumping", "No quantified impact", "Long unfocused answers"],
    proofKeywords: ["problem", "analysis", "recommendation", "market", "cost", "growth", "stakeholder", "client"],
    interviewDrills: [
      "Structure why a profitable company may still be losing market share.",
      "Give a 60-second synthesis of a messy project you worked on.",
      "Defend a recommendation when the interviewer challenges your first assumption.",
    ],
    resumeAngles: ["structured analysis", "quantified impact", "stakeholder management", "recommendation quality"],
    weights: { roleClarity: 1.25, interviewStories: 1.35, executionRhythm: 1.2 },
  },
  Product: {
    headline: "Show user empathy, prioritization logic, metrics, and cross-functional execution.",
    mustShow: ["User problem framing", "Feature prioritization", "Metrics thinking", "Execution tradeoffs"],
    riskSignals: ["Only saying tech interest", "No product examples", "Weak metric choices"],
    proofKeywords: ["user", "feature", "metric", "roadmap", "prioritize", "experiment", "product", "feedback"],
    interviewDrills: [
      "Choose a product you use daily and identify one user segment it underserves.",
      "Prioritize three feature ideas when engineering time is limited.",
      "Define success metrics for a new onboarding flow and explain the tradeoffs.",
    ],
    resumeAngles: ["user research", "metric choice", "prioritization", "cross-functional execution"],
    weights: { functionalDepth: 1.35, resumeEvidence: 1.25, roleClarity: 1.2 },
  },
  Analytics: {
    headline: "Show data thinking, business interpretation, tools, and decision impact.",
    mustShow: ["Data/tool evidence", "Metric interpretation", "Business problem framing", "Clear recommendation"],
    riskSignals: ["Tool list without impact", "No project story", "Cannot explain model limits"],
    proofKeywords: ["data", "dashboard", "sql", "python", "excel", "model", "metric", "insight", "analysis"],
    interviewDrills: [
      "Explain a dashboard you built: metric definition, audience, and action triggered.",
      "A conversion metric dropped by 12 percent. How would you diagnose it?",
      "Describe one model limitation and how you would communicate uncertainty.",
    ],
    resumeAngles: ["business metric", "analysis method", "decision impact", "tool clarity"],
    weights: { functionalDepth: 1.45, resumeEvidence: 1.35, businessAwareness: 1.05 },
  },
  Operations: {
    headline: "Show process thinking, cost-service tradeoffs, execution discipline, and root-cause logic.",
    mustShow: ["Process improvement", "Supply/capacity awareness", "Data-backed diagnosis", "Implementation sense"],
    riskSignals: ["Generic efficiency talk", "No process example", "Weak follow-through story"],
    proofKeywords: ["process", "capacity", "supply", "cost", "inventory", "quality", "turnaround", "root cause"],
    interviewDrills: [
      "Diagnose why delivery delays increased even though staffing stayed constant.",
      "Explain a process improvement using baseline, intervention, and result.",
      "Trade off cost, quality, and speed for an operations decision.",
    ],
    resumeAngles: ["process baseline", "root-cause action", "cost-service tradeoff", "implementation result"],
    weights: { functionalDepth: 1.3, resumeEvidence: 1.3, executionRhythm: 1.15 },
  },
  HR: {
    headline: "Show people judgment, culture sensitivity, communication, and structured change thinking.",
    mustShow: ["People/process evidence", "Conflict handling", "Policy or culture lens", "Stakeholder empathy"],
    riskSignals: ["Only saying people person", "No difficult conversation story", "Weak business linkage"],
    proofKeywords: ["people", "culture", "conflict", "policy", "training", "engagement", "stakeholder", "change"],
    interviewDrills: [
      "Tell me about a conflict you handled without formal authority.",
      "How would you diagnose low engagement in a fast-growing team?",
      "Design a fair process for shortlisting candidates under time pressure.",
    ],
    resumeAngles: ["people process", "conflict resolution", "communication outcome", "business linkage"],
    weights: { interviewStories: 1.35, roleClarity: 1.2, resumeEvidence: 1.15 },
  },
  "General Management": {
    headline: "Show broad business judgment, ownership, communication, and ability to learn fast.",
    mustShow: ["Cross-functional view", "Ownership story", "Business basics", "Execution judgment"],
    riskSignals: ["Too broad to be credible", "No clear role preference", "Weak examples"],
    proofKeywords: ["ownership", "business", "stakeholder", "growth", "cost", "execution", "team", "decision"],
    interviewDrills: [
      "Explain a decision where you balanced customer, cost, and execution constraints.",
      "Tell me about a time you owned an ambiguous task and made progress.",
      "Pick a business you know and explain one growth risk and one operational risk.",
    ],
    resumeAngles: ["ownership", "cross-functional judgment", "execution result", "business impact"],
    weights: { roleClarity: 1.25, resumeEvidence: 1.25, businessAwareness: 1.1 },
  },
};

const defaultEvidence: EvidenceItem[] = [
  {
    key: "internship",
    label: "Internship / work evidence",
    prompt: "Example: owned distributor mapping for 42 outlets; built weekly sales tracker.",
    value: "",
    strength: 3,
  },
  {
    key: "project",
    label: "Project evidence",
    prompt: "Example: market sizing, financial model, user research, dashboard, process map.",
    value: "",
    strength: 3,
  },
  {
    key: "leadership",
    label: "Leadership / ownership",
    prompt: "Example: led club event, managed vendors, resolved team conflict, shipped a deadline.",
    value: "",
    strength: 3,
  },
  {
    key: "metric",
    label: "Metric / proof point",
    prompt: "Example: improved response rate by 18%, reduced turnaround time, raised NPS.",
    value: "",
    strength: 2,
  },
];

const defaultProfile: SipProfile = {
  roleFamily: "Marketing",
  targetCompanies: "",
  timeline: "1 month",
  experience: "0-1 year",
  constraints: "",
  ratings: {
    roleClarity: 3,
    resumeEvidence: 3,
    functionalDepth: 3,
    businessAwareness: 3,
    interviewStories: 3,
    companyPrep: 2,
    networking: 2,
    executionRhythm: 3,
  },
  evidence: defaultEvidence,
  mockInterviews: 1,
  resumeVersion: "Draft",
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoreLabel(score: number) {
  if (score >= 82) return "Interview-ready";
  if (score >= 68) return "Almost ready";
  if (score >= 52) return "Repair the gaps";
  return "Needs structure first";
}

function scoreTone(score: number) {
  if (score >= 82) return "text-emerald-100 border-emerald-200/24 bg-emerald-300/[0.1]";
  if (score >= 68) return "text-sky-100 border-sky-200/24 bg-sky-300/[0.1]";
  if (score >= 52) return "text-amber-100 border-amber-200/28 bg-amber-300/[0.1]";
  return "text-red-100 border-red-200/24 bg-red-300/[0.1]";
}

function ratingLabel(value: number) {
  if (value >= 5) return "Strong";
  if (value >= 4) return "Good";
  if (value >= 3) return "Usable";
  if (value >= 2) return "Weak";
  return "Missing";
}

function scoreStatus(score: number) {
  if (score >= 78) return "green";
  if (score >= 58) return "yellow";
  return "red";
}

function timelineDays(timeline: SipProfile["timeline"]) {
  if (timeline === "This week") return 7;
  if (timeline === "2 weeks") return 14;
  if (timeline === "1 month") return 30;
  return 75;
}

function timelinePressure(profile: SipProfile) {
  const days = timelineDays(profile.timeline);
  if (days <= 7) return 11;
  if (days <= 14) return 7;
  if (days <= 30) return 3;
  return 0;
}

function splitCompanies(value: string) {
  return value
    .split(/[,;\n]/)
    .map((company) => company.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function hasRoleKeyword(text: string, roleFamily: RoleFamily) {
  const normalized = text.toLowerCase();
  return roleProfiles[roleFamily].proofKeywords.some((keyword) => normalized.includes(keyword));
}

function evidenceSignals(item: EvidenceItem, roleFamily: RoleFamily) {
  const text = item.value.trim();
  const normalized = text.toLowerCase();
  const signals: string[] = [];
  const missing: string[] = [];

  if (/\d|%|percent|x\b|crore|lakh|revenue|cost|profit|users|customers|sales|nps/i.test(text)) {
    signals.push("number");
  } else {
    missing.push("measurable result");
  }

  if (/\b(led|owned|built|created|improved|reduced|increased|launched|analyzed|designed|managed|negotiated|automated|mapped|presented)\b/i.test(text)) {
    signals.push("action");
  } else {
    missing.push("action verb");
  }

  if (/\b(because|therefore|result|impact|so that|which led|helped|saved|grew|reduced|improved|increased)\b/i.test(text)) {
    signals.push("impact logic");
  } else {
    missing.push("impact logic");
  }

  if (hasRoleKeyword(normalized, roleFamily)) {
    signals.push(`${roleFamily.toLowerCase()} relevance`);
  } else {
    missing.push(`${roleFamily.toLowerCase()} relevance`);
  }

  return { signals, missing };
}

function buildEvidenceAudit(profile: SipProfile): EvidenceAudit[] {
  return profile.evidence.map((item) => {
    const { signals, missing } = evidenceSignals(item, profile.roleFamily);
    const hasText = item.value.trim().length > 0;
    const roleFit = signals.some((signal) => signal.includes("relevance")) ? 18 : 0;
    const score = clampScore(item.strength * 15 + signals.length * 10 + (hasText ? 8 : -18));
    const fallbackAngleIndex: Record<EvidenceKey, number> = {
      internship: 0,
      project: 1,
      leadership: 2,
      metric: 3,
    };
    const angle = roleProfiles[profile.roleFamily].resumeAngles.find((option) =>
      item.value.toLowerCase().includes(option.split(" ")[0]),
    ) || roleProfiles[profile.roleFamily].resumeAngles[fallbackAngleIndex[item.key]];

    return {
      ...item,
      score,
      roleFit,
      signals,
      missing,
      rewrite: hasText
        ? `Rewrite this as: action + context + ${angle} + measurable result.`
        : `Add one proof point that shows ${angle}, then attach a number or decision impact.`,
    };
  });
}

function evidenceQuality(audit: EvidenceAudit[]) {
  if (!audit.length) return 0;
  return audit.reduce((total, item) => total + item.score, 0) / audit.length;
}

function buildExecutiveDiagnosis(profile: SipProfile, overallScore: number, gaps: ReturnType<typeof buildDimensionScores>) {
  const strongest = [...gaps].sort((a, b) => b.score - a.score)[0];
  const weakest = gaps[0];
  const companies = splitCompanies(profile.targetCompanies);
  const pressure = timelinePressure(profile);
  const urgency =
    pressure >= 10
      ? "Your timeline is tight, so fix only the proof that will show up in interviews."
      : pressure >= 7
        ? "You have enough time for focused repair, but not for broad exploration."
        : "You have room to build depth, not just polish surface answers.";

  return {
    verdict:
      overallScore >= 82
        ? "You can enter shortlists if you keep the story crisp and role-specific."
        : overallScore >= 68
          ? "You are close, but one weak signal can still pull the interview down."
          : overallScore >= 52
            ? "The profile is usable only after targeted repairs."
            : "Start with structure: target role, proof points, and three practiced stories.",
    strongest: strongest
      ? `${strongest.label} is your strongest current signal at ${strongest.score}/100.`
      : "No strong signal is visible yet.",
    bottleneck: weakest
      ? `${weakest.label} is the main bottleneck at ${weakest.score}/100.`
      : "The main bottleneck is unclear.",
    urgency,
    companyFocus: companies.length
      ? `Anchor prep around ${companies.slice(0, 3).join(", ")} before adding more companies.`
      : "Add 3-5 target companies so the plan can become sharper.",
  };
}

function buildCandidatePitch(profile: SipProfile, audit: EvidenceAudit[]) {
  const strongestEvidence = [...audit].sort((a, b) => b.score + b.roleFit - (a.score + a.roleFit))[0];
  const proof = strongestEvidence?.value.trim();
  const proofLine = proof
    ? proof.replace(/\s+/g, " ").replace(/[.?!]+$/, "").slice(0, 170)
    : `my strongest ${profile.roleFamily.toLowerCase()} proof point is still being built`;

  return `I am targeting ${profile.roleFamily} roles because my preparation is strongest around ${roleProfiles[
    profile.roleFamily
  ].mustShow
    .slice(0, 2)
    .join(" and ")
    .toLowerCase()}. The proof I would lead with is: ${proofLine}. Over the next ${profile.timeline.toLowerCase()}, I am tightening the weakest gap so my resume, pitch, and interview stories point to the same role.`;
}

function buildResumeMoves(profile: SipProfile, audit: EvidenceAudit[]) {
  return audit
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((item) => ({
      label: item.label,
      status: scoreStatus(item.score),
      score: item.score,
      move: item.rewrite,
      missing: item.missing.slice(0, 2),
    }));
}

function buildInterviewDrill(profile: SipProfile, gaps: ReturnType<typeof buildDimensionScores>) {
  const gapDrill = gaps[0]
    ? `Open the interview by proving ${gaps[0].label.toLowerCase()} before the interviewer has to ask for it.`
    : "Open with a clear role-fit pitch.";

  return [gapDrill, ...roleProfiles[profile.roleFamily].interviewDrills].slice(0, 4);
}

function profileFromStorage() {
  if (typeof window === "undefined") return defaultProfile;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile;

    const parsed = JSON.parse(raw) as Partial<SipProfile>;

    return {
      ...defaultProfile,
      ...parsed,
      ratings: { ...defaultProfile.ratings, ...(parsed.ratings || {}) },
      evidence: defaultEvidence.map((item) => ({
        ...item,
        ...(parsed.evidence || []).find((entry) => entry.key === item.key),
      })),
    };
  } catch {
    return defaultProfile;
  }
}

function buildDimensionScores(profile: SipProfile) {
  const roleProfile = roleProfiles[profile.roleFamily];
  const audit = buildEvidenceAudit(profile);
  const evidenceAverage = evidenceQuality(audit);
  const resumeVersionBonus =
    profile.resumeVersion === "Final polish"
      ? 8
      : profile.resumeVersion === "Reviewed once"
        ? 5
        : profile.resumeVersion === "Draft"
          ? 2
          : -5;
  const mockBonus = Math.min(12, profile.mockInterviews * 3);
  const pressure = timelinePressure(profile);
  const companyPenalty = splitCompanies(profile.targetCompanies).length >= 3 ? 0 : 8;

  return dimensions.map((dimension) => {
    const roleWeight = roleProfile.weights[dimension.key] || 1;
    const base = profile.ratings[dimension.key] * 20;
    const adjusted =
      dimension.key === "resumeEvidence"
        ? evidenceAverage + resumeVersionBonus
        : dimension.key === "interviewStories"
          ? base + mockBonus
          : dimension.key === "executionRhythm"
            ? base + Math.min(8, profile.mockInterviews * 2)
            : dimension.key === "companyPrep"
              ? base - companyPenalty
              : dimension.key === "roleClarity"
                ? base - Math.max(0, companyPenalty - 3)
                : base;
    const timelineAdjusted =
      dimension.key === "resumeEvidence" ||
      dimension.key === "interviewStories" ||
      dimension.key === "executionRhythm"
        ? adjusted - pressure
        : adjusted;

    return {
      ...dimension,
      roleWeight,
      score: clampScore(timelineAdjusted),
      weightedScore: clampScore(timelineAdjusted) * dimension.weight * roleWeight,
      weightedMax: 100 * dimension.weight * roleWeight,
    };
  });
}

function buildPlan(profile: SipProfile, gaps: ReturnType<typeof buildDimensionScores>) {
  const roleProfile = roleProfiles[profile.roleFamily];
  const firstGap = gaps[0]?.label || "resume evidence";
  const secondGap = gaps[1]?.label || "interview stories";
  const thirdGap = gaps[2]?.label || "company prep";

  return [
    {
      week: profile.timeline === "This week" ? "Day 1-2" : "Week 1",
      focus: `Stabilize ${firstGap.toLowerCase()}`,
      actions: [
        `Rewrite the SIP pitch for ${profile.roleFamily}: target role, why fit, strongest proof, and one weakness you are fixing.`,
        "Convert two raw resume points into action-context-result bullets with a number or decision impact.",
        `Study 2 target companies${profile.targetCompanies ? ` from ${profile.targetCompanies}` : ""} and write one business observation for each.`,
      ],
    },
    {
      week: profile.timeline === "This week" ? "Day 3-4" : "Week 2",
      focus: `Repair ${secondGap.toLowerCase()}`,
      actions: [
        "Build 6 interview stories: leadership, conflict, failure, achievement, analysis, and teamwork.",
        "Do two mocks and mark every answer that became vague, too long, or unsupported.",
        `Practice one ${profile.roleFamily} role-specific question daily.`,
      ],
    },
    {
      week: profile.timeline === "This week" ? "Day 5-6" : "Week 3",
      focus: `Strengthen ${thirdGap.toLowerCase()}`,
      actions: [
        "Create a company-role prep card for 5 likely recruiters.",
        `Prepare examples for: ${roleProfile.mustShow.slice(0, 3).join(", ")}.`,
        "Ask one senior/alumni/person with role context for feedback on your story.",
      ],
    },
    {
      week: profile.timeline === "This week" ? "Day 7" : "Week 4",
      focus: "Polish and simulate",
      actions: [
        "Run one full mock: resume walkthrough, HR questions, functional round, and questions to ask.",
        "Cut the resume to the strongest proof points and remove unsupported claims.",
        "Create a final one-page prep sheet: pitch, top stories, companies, risks, and fixes.",
      ],
    },
  ];
}

function buildMarkdown(profile: SipProfile, report: ReturnType<typeof useSipReport>) {
  return [
    `# SIP Readiness Scorecard`,
    "",
    `Target role: ${profile.roleFamily}`,
    `Timeline: ${profile.timeline}`,
    `Score: ${report.overallScore}/100 (${scoreLabel(report.overallScore)})`,
    "",
    "## Executive Diagnosis",
    `- Verdict: ${report.diagnosis.verdict}`,
    `- Bottleneck: ${report.diagnosis.bottleneck}`,
    `- Urgency: ${report.diagnosis.urgency}`,
    `- Company focus: ${report.diagnosis.companyFocus}`,
    "",
    "## Candidate Pitch",
    report.pitch,
    "",
    "## Priority Gaps",
    ...report.gaps.slice(0, 4).map((gap) => `- ${gap.label}: ${gap.score}/100`),
    "",
    "## Resume Repair",
    ...report.resumeMoves.map(
      (move) =>
        `- ${move.label}: ${move.move}${move.missing.length ? ` Missing: ${move.missing.join(", ")}.` : ""}`,
    ),
    "",
    "## Role Signals To Show",
    ...roleProfiles[profile.roleFamily].mustShow.map((item) => `- ${item}`),
    "",
    "## Interview Drill",
    ...report.interviewDrill.map((item) => `- ${item}`),
    "",
    "## 30-Day Plan",
    ...report.plan.flatMap((week) => [
      `### ${week.week}: ${week.focus}`,
      ...week.actions.map((action) => `- ${action}`),
      "",
    ]),
    "## Interview Risks",
    ...report.risks.map((risk) => `- ${risk}`),
  ].join("\n");
}

function useSipReport(profile: SipProfile) {
  return useMemo(() => {
    const dimensionScores = buildDimensionScores(profile);
    const total = dimensionScores.reduce((sum, item) => sum + item.weightedScore, 0);
    const max = dimensionScores.reduce((sum, item) => sum + item.weightedMax, 0);
    const overallScore = clampScore((total / max) * 100);
    const gaps = [...dimensionScores].sort((a, b) => a.score - b.score);
    const roleProfile = roleProfiles[profile.roleFamily];
    const audit = buildEvidenceAudit(profile);
    const diagnosis = buildExecutiveDiagnosis(profile, overallScore, gaps);
    const pitch = buildCandidatePitch(profile, audit);
    const resumeMoves = buildResumeMoves(profile, audit);
    const interviewDrill = buildInterviewDrill(profile, gaps);
    const risks = [
      ...gaps.slice(0, 3).map((gap) => `${gap.label} is at ${gap.score}/100. Prepare evidence before interviews.`),
      ...roleProfile.riskSignals.slice(0, 2),
    ];
    const plan = buildPlan(profile, gaps);

    return {
      dimensionScores,
      overallScore,
      gaps,
      roleProfile,
      audit,
      diagnosis,
      pitch,
      resumeMoves,
      interviewDrill,
      risks,
      plan,
    };
  }, [profile]);
}

function updateRating(profile: SipProfile, key: RatingKey, value: number): SipProfile {
  return {
    ...profile,
    ratings: {
      ...profile.ratings,
      [key]: value,
    },
  };
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[8px] border border-white/10 bg-[#0c0f11] p-4 shadow-[0_28px_100px_rgba(0,0,0,0.2)] md:p-5 ${className}`}>
      {children}
    </section>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/38">
      {children}
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 rounded-[8px] border border-white/10 bg-[#15181b] px-3 text-[0.95rem] text-white/82 outline-none transition focus:border-indigo-200/40 focus:ring-2 focus:ring-indigo-200/12"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-2">
      <FieldLabel>{label}</FieldLabel>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-12 rounded-[8px] border border-white/10 bg-[#15181b] px-3 text-[0.95rem] text-white/82 outline-none transition placeholder:text-white/28 focus:border-indigo-200/40 focus:ring-2 focus:ring-indigo-200/12"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="grid gap-2">
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="resize-none rounded-[8px] border border-white/10 bg-[#15181b] px-3 py-3 text-[0.95rem] leading-[1.5] text-white/82 outline-none transition placeholder:text-white/28 focus:border-indigo-200/40 focus:ring-2 focus:ring-indigo-200/12"
      />
    </div>
  );
}

function RatingSlider({
  dimension,
  value,
  score,
  onChange,
}: {
  dimension: Dimension;
  value: number;
  score: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-[#111416] p-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.94rem] font-semibold text-white/82">{dimension.label}</p>
          <p className="mt-1 text-[0.78rem] leading-[1.45] text-white/42">{dimension.description}</p>
        </div>
        <span className={`shrink-0 rounded-[8px] border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${scoreTone(score)}`}>
          {score}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <input
          type="range"
          min={1}
          max={5}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-2 w-full accent-indigo-200"
          aria-label={dimension.label}
        />
        <span className="w-16 text-right text-[0.8rem] font-semibold text-white/54">{ratingLabel(value)}</span>
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  return (
    <div
      className="grid h-36 w-36 shrink-0 place-items-center rounded-full border border-white/10"
      style={{
        background: `conic-gradient(rgba(199,210,254,0.95) ${score * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
      }}
    >
      <div className="grid h-[112px] w-[112px] place-items-center rounded-full bg-[#0c0f11] text-center">
        <div>
          <p className="text-[2.35rem] font-semibold leading-none text-white">{score}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">out of 100</p>
        </div>
      </div>
    </div>
  );
}

function ReportBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-[0.82rem]">
        <span className="font-medium text-white/66">{label}</span>
        <span className="font-semibold text-white/56">{score}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full bg-indigo-200/78"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const className =
    status === "green"
      ? "border-emerald-200/20 bg-emerald-300/[0.1] text-emerald-100"
      : status === "yellow"
        ? "border-amber-200/24 bg-amber-300/[0.1] text-amber-100"
        : "border-red-200/20 bg-red-300/[0.1] text-red-100";

  return (
    <span className={`rounded-[8px] border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${className}`}>
      {status}
    </span>
  );
}

function InsightRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="grid gap-2 border-t border-white/10 py-3 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/34">
        {icon}
        {label}
      </div>
      <p className="text-[0.93rem] leading-[1.5] text-white/72">{value}</p>
    </div>
  );
}

export function SipReadinessWorkspace({ tool }: { tool: AITool }) {
  const [profile, setProfile] = useState<SipProfile>(defaultProfile);
  const [loaded, setLoaded] = useState(false);
  const report = useSipReport(profile);
  const markdown = useMemo(() => buildMarkdown(profile, report), [profile, report]);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      setProfile(profileFromStorage());
      setLoaded(true);
    }, 0);

    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [loaded, profile]);

  const updateEvidence = (key: EvidenceKey, patch: Partial<EvidenceItem>) => {
    setProfile((current) => ({
      ...current,
      evidence: current.evidence.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    }));
  };

  const reset = () => {
    setProfile(defaultProfile);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const copyReport = async () => {
    await navigator.clipboard.writeText(markdown);
  };

  return (
    <>
      <ToolRouteTracker tool={tool} />
      <main className="relative overflow-hidden bg-[var(--background)] pt-32 text-white md:pt-36">
        <div
          aria-hidden="true"
          className="premium-grid pointer-events-none absolute right-[-180px] top-20 h-[520px] w-[680px] opacity-[0.16] [mask-image:radial-gradient(circle,black,transparent_72%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-[560px] w-full bg-[radial-gradient(circle_at_22%_0%,rgba(165,180,252,0.2),transparent_36%),linear-gradient(180deg,rgba(255,253,248,0.08),transparent_54%)]"
        />

        <article className="relative z-10 w-full px-3.5 pb-16 md:px-9 md:pb-28 min-[1180px]:px-14">
          <Reveal>
            <Link
              href="/#ai-tools-lab"
              className="premium-link mb-4 hidden min-h-10 items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.07] px-3 py-2 text-[12px] font-medium text-white/76 shadow-[0_16px_44px_rgba(0,0,0,0.2)] backdrop-blur transition hover:bg-white/[0.11] focus:outline-none focus:ring-2 focus:ring-white/20 md:inline-flex"
            >
              <ArrowLeft className="h-4 w-4 text-white/48" />
              Back to MBA Tools Desk
            </Link>
          </Reveal>

          <header className="grid gap-6 py-5 md:py-8 lg:grid-cols-[0.82fr_0.7fr] lg:items-start lg:gap-12">
            <Reveal>
              <SectionLabel>SIP Readiness Workspace</SectionLabel>
              <h1 className="max-w-[760px] text-[clamp(2.35rem,7.4vw,5.85rem)] font-semibold leading-[0.96] tracking-[0] text-white">
                SIP Readiness Scorecard
              </h1>
              <p className="mt-4 max-w-[700px] text-[clamp(1rem,3.2vw,1.25rem)] leading-[1.55] text-white/72">
                Diagnose role fit, resume proof, interview risk, and the next 30 days of placement prep.
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <Panel className="bg-[#101214]/92">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/36">Current score</p>
                    <p className="mt-3 text-[1.45rem] font-semibold leading-[1.12] text-white/92">{scoreLabel(report.overallScore)}</p>
                    <p className="mt-2 text-[0.9rem] leading-[1.5] text-white/48">{report.roleProfile.headline}</p>
                  </div>
                  <ScoreRing score={report.overallScore} />
                </div>
                <div className="mt-5 grid gap-2">
                  {report.gaps.slice(0, 3).map((gap) => (
                    <ReportBar key={gap.key} label={gap.label} score={gap.score} />
                  ))}
                </div>
                <div className="mt-5 grid gap-3 border-t border-white/10 pt-4">
                  <InsightRow
                    icon={<TrendingUp className="h-3.5 w-3.5 text-indigo-100/62" />}
                    label="Verdict"
                    value={report.diagnosis.verdict}
                  />
                  <InsightRow
                    icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-100/72" />}
                    label="Main bottleneck"
                    value={report.diagnosis.bottleneck}
                  />
                </div>
              </Panel>
            </Reveal>
          </header>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.62fr)_minmax(420px,0.38fr)] lg:items-start">
            <section className="grid gap-5">
              <Reveal>
                <Panel>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/36">Target setup</p>
                      <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[0] text-white/90">Choose the role you are preparing for.</h2>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-[8px] border border-indigo-100/18 bg-indigo-300/[0.11] text-indigo-100">
                      <Target className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <SelectField
                      label="Target role family"
                      value={profile.roleFamily}
                      options={Object.keys(roleProfiles)}
                      onChange={(value) => setProfile((current) => ({ ...current, roleFamily: value as RoleFamily }))}
                    />
                    <SelectField
                      label="Timeline"
                      value={profile.timeline}
                      options={["This week", "2 weeks", "1 month", "2-3 months"]}
                      onChange={(value) => setProfile((current) => ({ ...current, timeline: value as SipProfile["timeline"] }))}
                    />
                    <SelectField
                      label="Experience"
                      value={profile.experience}
                      options={["Fresher", "0-1 year", "1-3 years", "3+ years"]}
                      onChange={(value) => setProfile((current) => ({ ...current, experience: value as SipProfile["experience"] }))}
                    />
                    <TextField
                      label="Target companies"
                      value={profile.targetCompanies}
                      onChange={(value) => setProfile((current) => ({ ...current, targetCompanies: value }))}
                      placeholder="Example: HUL, Deloitte, ICICI, ZS..."
                    />
                    <div className="md:col-span-2">
                      <TextAreaField
                        label="Constraints"
                        value={profile.constraints}
                        onChange={(value) => setProfile((current) => ({ ...current, constraints: value }))}
                        placeholder="Example: weak finance basics, limited mock practice, no internship brand signal..."
                      />
                    </div>
                  </div>
                </Panel>
              </Reveal>

              <Reveal>
                <Panel className="border-indigo-100/16 bg-[#101218]">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/36">Placement diagnosis</p>
                      <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[0] text-white/90">Know what to fix before doing more prep.</h2>
                    </div>
                    <Lightbulb className="h-5 w-5 text-indigo-100/72" />
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <div className="rounded-[8px] border border-white/10 bg-white/[0.035] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/34">Candidate pitch draft</p>
                      <p className="mt-3 text-[0.95rem] leading-[1.62] text-white/72">{report.pitch}</p>
                    </div>
                    <div className="grid gap-3">
                      <InsightRow
                        icon={<ClipboardList className="h-3.5 w-3.5 text-indigo-100/62" />}
                        label="Strongest signal"
                        value={report.diagnosis.strongest}
                      />
                      <InsightRow
                        icon={<Timer className="h-3.5 w-3.5 text-indigo-100/62" />}
                        label="Timeline pressure"
                        value={report.diagnosis.urgency}
                      />
                      <InsightRow
                        icon={<Target className="h-3.5 w-3.5 text-indigo-100/62" />}
                        label="Company focus"
                        value={report.diagnosis.companyFocus}
                      />
                    </div>
                  </div>
                </Panel>
              </Reveal>

              <Reveal>
                <Panel>
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/36">Diagnostic score</p>
                      <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[0] text-white/90">Rate the preparation honestly.</h2>
                    </div>
                    <Gauge className="h-5 w-5 text-indigo-100/72" />
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {report.dimensionScores.map((dimension) => (
                      <RatingSlider
                        key={dimension.key}
                        dimension={dimension}
                        value={profile.ratings[dimension.key]}
                        score={dimension.score}
                        onChange={(value) => setProfile((current) => updateRating(current, dimension.key, value))}
                      />
                    ))}
                  </div>
                </Panel>
              </Reveal>

              <Reveal>
                <Panel>
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/36">Resume evidence</p>
                      <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[0] text-white/90">Turn claims into proof.</h2>
                    </div>
                    <FileText className="h-5 w-5 text-indigo-100/72" />
                  </div>
                  <div className="mt-5 grid gap-3">
                    {profile.evidence.map((item) => (
                      <div key={item.key} className="grid gap-3 rounded-[8px] border border-white/10 bg-[#111416] p-3 md:grid-cols-[1fr_180px]">
                        <TextAreaField
                          label={item.label}
                          value={item.value}
                          onChange={(value) => updateEvidence(item.key, { value })}
                          placeholder={item.prompt}
                          rows={2}
                        />
                        <div className="grid gap-2">
                          <FieldLabel>Strength</FieldLabel>
                          <div className="rounded-[8px] border border-white/10 bg-[#15181b] p-3">
                            <input
                              type="range"
                              min={1}
                              max={5}
                              value={item.strength}
                              onChange={(event) => updateEvidence(item.key, { strength: Number(event.target.value) })}
                              className="w-full accent-indigo-200"
                              aria-label={`${item.label} strength`}
                            />
                            <p className="mt-2 text-right text-[0.82rem] font-semibold text-white/58">{ratingLabel(item.strength)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              </Reveal>

              <Reveal>
                <Panel>
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/36">Practice signals</p>
                      <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[0] text-white/90">Add the prep evidence that changes confidence.</h2>
                    </div>
                    <Timer className="h-5 w-5 text-indigo-100/72" />
                  </div>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <SelectField
                      label="Resume version"
                      value={profile.resumeVersion}
                      options={["Raw notes", "Draft", "Reviewed once", "Final polish"]}
                      onChange={(value) => setProfile((current) => ({ ...current, resumeVersion: value as SipProfile["resumeVersion"] }))}
                    />
                    <div className="grid gap-2">
                      <FieldLabel>Mock interviews completed</FieldLabel>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={profile.mockInterviews}
                        onChange={(event) => setProfile((current) => ({ ...current, mockInterviews: Math.max(0, Number(event.target.value) || 0) }))}
                        className="min-h-12 rounded-[8px] border border-white/10 bg-[#15181b] px-3 text-[0.95rem] text-white/82 outline-none transition focus:border-indigo-200/40 focus:ring-2 focus:ring-indigo-200/12"
                      />
                    </div>
                  </div>
                </Panel>
              </Reveal>
            </section>

            <aside className="sticky top-24 grid gap-5 self-start">
              <Reveal>
                <Panel className="bg-[#101214]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/36">Readiness report</p>
                      <h2 className="mt-2 text-[1.75rem] font-semibold leading-[1.02] text-white">{report.overallScore}/100</h2>
                    </div>
                    <span className={`rounded-[8px] border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${scoreTone(report.overallScore)}`}>
                      {scoreLabel(report.overallScore)}
                    </span>
                  </div>
                  <div className="mt-5 grid gap-3">
                    <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3">
                      <div className="flex items-start gap-3">
                        <Briefcase className="mt-0.5 h-4 w-4 text-indigo-100/72" />
                        <div>
                          <p className="text-[0.9rem] font-semibold text-white/78">{profile.roleFamily}</p>
                          <p className="mt-1 text-[0.82rem] leading-[1.45] text-white/46">{report.roleProfile.headline}</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/34">Must show</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {report.roleProfile.mustShow.map((item) => (
                          <span key={item} className="rounded-[8px] border border-indigo-100/14 bg-indigo-300/[0.08] px-2.5 py-1.5 text-[12px] text-indigo-50/70">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={copyReport}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-[12px] font-semibold text-white/68 transition hover:bg-white/[0.09]"
                    >
                      <Copy className="h-4 w-4" />
                      Copy plan
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadText("sip-readiness-scorecard.md", markdown)}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-[12px] font-semibold text-white/68 transition hover:bg-white/[0.09]"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                    <button
                      type="button"
                      onClick={reset}
                      className="col-span-2 inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.045] px-3 text-[12px] font-semibold text-white/54 transition hover:bg-white/[0.08]"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reset scorecard
                    </button>
                  </div>
                </Panel>
              </Reveal>

              <Reveal>
                <Panel>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/36">Priority gaps</p>
                  <div className="mt-4 grid gap-3">
                    {report.gaps.slice(0, 4).map((gap, index) => (
                      <div key={gap.key} className="grid grid-cols-[34px_1fr] gap-3 rounded-[8px] border border-white/10 bg-[#111416] p-3">
                        <span className="grid h-8 w-8 place-items-center rounded-[8px] bg-white/[0.06] text-[11px] font-semibold text-white/48">0{index + 1}</span>
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[0.9rem] font-semibold text-white/76">{gap.label}</p>
                            <p className="text-[0.8rem] font-semibold text-white/46">{gap.score}</p>
                          </div>
                          <p className="mt-1 text-[0.78rem] leading-[1.45] text-white/42">{gap.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              </Reveal>

              <Reveal>
                <Panel>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/36">Evidence truth check</p>
                  <div className="mt-4 grid gap-3">
                    {report.audit.map((item) => (
                      <div key={item.key} className="border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[0.88rem] font-semibold text-white/76">{item.label}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[0.78rem] font-semibold text-white/44">{item.score}</span>
                            <StatusPill status={scoreStatus(item.score)} />
                          </div>
                        </div>
                        <p className="mt-2 text-[0.78rem] leading-[1.45] text-white/46">
                          {item.missing.length ? `Missing: ${item.missing.slice(0, 2).join(", ")}.` : "Looks specific enough to defend."}
                        </p>
                      </div>
                    ))}
                  </div>
                </Panel>
              </Reveal>
            </aside>
          </div>

          <section className="mt-6 grid gap-5 lg:grid-cols-[0.54fr_0.46fr]">
            <Reveal>
              <Panel className="h-full">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/36">Resume repair queue</p>
                    <h2 className="mt-2 text-[1.45rem] font-semibold text-white/90">Rewrite the weakest proof first.</h2>
                  </div>
                  <PenLine className="h-5 w-5 text-indigo-100/72" />
                </div>
                <div className="mt-5 grid gap-3">
                  {report.resumeMoves.map((move, index) => (
                    <div key={move.label} className="grid gap-3 rounded-[8px] border border-white/10 bg-[#111416] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 place-items-center rounded-[8px] bg-white/[0.06] text-[11px] font-semibold text-white/48">
                            0{index + 1}
                          </span>
                          <div>
                            <p className="text-[0.95rem] font-semibold text-white/80">{move.label}</p>
                            <p className="mt-1 text-[0.75rem] text-white/38">
                              {move.missing.length ? `Missing ${move.missing.join(", ")}` : "Specific enough to defend"}
                            </p>
                          </div>
                        </div>
                        <StatusPill status={move.status} />
                      </div>
                      <p className="text-[0.9rem] leading-[1.5] text-white/58">{move.move}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </Reveal>

            <Reveal>
              <Panel className="h-full">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/36">Interview drill</p>
                    <h2 className="mt-2 text-[1.45rem] font-semibold text-white/90">Practice the questions most likely to expose the gap.</h2>
                  </div>
                  <MessageSquare className="h-5 w-5 text-indigo-100/72" />
                </div>
                <ol className="mt-5 grid gap-3">
                  {report.interviewDrill.map((question, index) => (
                    <li key={question} className="grid grid-cols-[34px_1fr] gap-3 rounded-[8px] border border-white/10 bg-[#111416] p-3">
                      <span className="grid h-8 w-8 place-items-center rounded-[8px] bg-indigo-300/[0.1] text-[11px] font-semibold text-indigo-50/62">
                        {index + 1}
                      </span>
                      <span className="text-[0.9rem] leading-[1.5] text-white/62">{question}</span>
                    </li>
                  ))}
                </ol>
              </Panel>
            </Reveal>
          </section>

          <section className="mt-6 grid gap-5 lg:grid-cols-[0.44fr_0.56fr]">
            <Reveal>
              <Panel className="h-full">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/36">Interview risks</p>
                    <h2 className="mt-2 text-[1.45rem] font-semibold text-white/90">What can hurt you in the room.</h2>
                  </div>
                  <BarChart3 className="h-5 w-5 text-indigo-100/72" />
                </div>
                <ul className="mt-5 grid gap-3">
                  {report.risks.slice(0, 5).map((risk) => (
                    <li key={risk} className="flex gap-3 rounded-[8px] border border-white/10 bg-[#111416] p-3 text-[0.9rem] leading-[1.5] text-white/62">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-100/72" />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </Reveal>

            <Reveal>
              <Panel>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/36">30-day plan</p>
                    <h2 className="mt-2 text-[1.45rem] font-semibold text-white/90">Repair the highest-cost gaps first.</h2>
                  </div>
                  <CalendarDays className="h-5 w-5 text-indigo-100/72" />
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {report.plan.map((week) => (
                    <div key={week.week} className="rounded-[8px] border border-white/10 bg-[#111416] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-100/58">{week.week}</p>
                      <h3 className="mt-2 text-[1rem] font-semibold text-white/84">{week.focus}</h3>
                      <ul className="mt-3 grid gap-2">
                        {week.actions.map((action) => (
                          <li key={action} className="flex gap-2 text-[0.82rem] leading-[1.45] text-white/52">
                            <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-100/60" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Panel>
            </Reveal>
          </section>

          <Reveal>
            <div className="mt-6 rounded-[8px] border border-white/10 bg-[#101214] p-4 text-[0.9rem] font-medium text-white/58 shadow-[0_18px_54px_rgba(0,0,0,0.18)]">
              Built by Mohit Sai Krishna | MBA @ IIM Sirmaur
            </div>
          </Reveal>
        </article>
      </main>
      <Footer />
    </>
  );
}
