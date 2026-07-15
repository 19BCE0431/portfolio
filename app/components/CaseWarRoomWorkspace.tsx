"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  ClipboardList,
  Copy,
  Database,
  Download,
  FileDown,
  FileText,
  Link2,
  LockKeyhole,
  Pencil,
  Presentation,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
  Timer,
  Upload,
  Users,
  WandSparkles,
} from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import type { AITool } from "../data/tools";
import { Footer } from "./Footer";
import { Reveal } from "./Reveal";
import { SectionLabel } from "./SectionLabel";
import { ToolRouteTracker } from "./ToolRouteTracker";

type InputMode = "pdf" | "text" | "link";
type WorkMode = "Individual" | "Team";

type TeamMember = {
  name: string;
  strengths: string;
};

type CaseSourcePreview = {
  detectedTitle: string;
  detectedCompany: string;
  detectedIndustry: string;
  detectedSubject?: string;
  sourceQuality?: "strong" | "usable" | "noisy";
  narrativeStartDetected?: boolean;
  removedBoilerplateCount?: number;
  caseDecision?: string;
  caseType?: string;
  caseBrief?: string;
  decisionSignals?: string[];
  keyTopics?: string[];
  approximateWordCount: number;
  detectedSections: string[];
  numberSamples: string[];
  hasNumbers: boolean;
  hasExhibits: boolean;
  warnings: string[];
};

type PreparedSource = {
  mode: InputMode;
  sourceName: string;
  text: string;
  rawText?: string;
  cleanedText?: string;
  preview: CaseSourcePreview;
};

type StageResult = {
  data: unknown;
  model?: string;
  usedFallback?: boolean;
  notices?: string[];
  generatedAt: string;
};

type ClassroomStakeholder = {
  stakeholder: string;
  whatTheyWant: string;
  pressureOrProblem: string;
  whyTheyMatter: string;
};

type ClassroomTimelineItem = {
  period: string;
  event: string;
  whyItMatters: string;
};

type ClassroomFactNumber = {
  factOrNumber: string;
  context: string;
  whyItMatters: string;
  discussionUse: string;
  needsVerification?: boolean;
};

type ClassroomBriefData = {
  caseSnapshot: string;
  mainDecision: string;
  caseObjective: string;
  stakeholders: ClassroomStakeholder[];
  timeline: ClassroomTimelineItem[];
  keyFactsNumbers: ClassroomFactNumber[];
  keyTensions: string[];
  professorPushAngles: string[];
  preparationChecklist: string[];
  smartQuestions: string[];
};

type StageErrorDetails = {
  code?: string;
  message: string;
  nextAction: string;
  retryable: boolean;
};

type FoundationStageKey = "classroomBrief" | "decode" | "exhibits" | "teamSplit";
type SolutionStageKey =
  | "strategy"
  | "evaluation"
  | "risks"
  | "recommendation"
  | "ppt"
  | "reflection"
  | "readinessScore";
type StageKey = FoundationStageKey | SolutionStageKey;
type StageNavItem = {
  label: string;
  key?: StageKey;
};

const STORAGE_KEY = "mohit-case-war-room-classroom-brief-2";
const PREVIOUS_STORAGE_KEY = "mohit-case-war-room-mvp-1";
const LEGACY_STORAGE_KEY = "mohit-case-war-room-phase-2";
const LEARNING_MODE_STRATEGY_BLOCK =
  "Strategy Builder is locked in this MVP. Finish the understanding layer first, then use the next product layer for strategy.";

type SavedWorkspace = {
  preparedSource?: PreparedSource | null;
  extractedText?: string;
  classroomBriefResult?: StageResult | null;
  decodeResult?: StageResult | null;
  exhibitsResult?: StageResult | null;
  teamSplitResult?: StageResult | null;
  solutionResults?: Partial<Record<SolutionStageKey, StageResult | null>>;
  strategyUnlocked?: boolean;
  learningMode?: boolean;
  classroomMode?: boolean;
  competitionMode?: boolean;
};


const inputModes: Array<{
  id: InputMode;
  title: string;
  label: string;
  description: string;
  icon: typeof Upload;
}> = [
  {
    id: "pdf",
    title: "Upload PDF",
    label: "Recommended",
    description:
      "Best for full case studies with exhibits, tables, and detailed instructions.",
    icon: Upload,
  },
  {
    id: "text",
    title: "Paste Case Text",
    label: "Flexible",
    description:
      "Paste the case description, problem statement, exhibits, or copied case text.",
    icon: FileText,
  },
  {
    id: "link",
    title: "Paste Case Link",
    label: "Limited",
    description:
      "Use this only if the case is publicly accessible. The tool reads that exact link only.",
    icon: Link2,
  },
];

const subjects = [
  "Marketing",
  "Strategy",
  "Operations",
  "Finance",
  "HR",
  "Analytics",
  "Product Management",
  "Entrepreneurship",
  "General Management",
];

const purposes = [
  "Class discussion",
  "Written assignment",
  "Case competition PPT",
  "Internship/live project",
  "Interview practice",
  "Self-learning",
];

const outputTypes = [
  "Case understanding brief",
  "Exhibit and numbers brief",
  "Class discussion prep",
  "Team work plan",
];

const deadlines = ["Today", "Tomorrow", "2-3 days", "1 week", "No deadline"];

const analysisDepths = [
  "Beginner explanation",
  "MBA-level explanation",
  "Competition-level depth",
  "Executive summary only",
];

const stages: StageNavItem[] = [
  { label: "Source" },
  { label: "Classroom Brief", key: "classroomBrief" },
  { label: "Exhibits", key: "exhibits" },
  { label: "Discussion Prep", key: "decode" },
  { label: "Team Split", key: "teamSplit" },
  { label: "Strategy Builder" },
  { label: "Recommendation" },
  { label: "PPT Storyline" },
];

const solutionStageKeys: SolutionStageKey[] = [
  "strategy",
  "evaluation",
  "risks",
  "recommendation",
  "ppt",
  "reflection",
  "readinessScore",
];

const solutionStageMeta: Record<
  SolutionStageKey,
  {
    endpoint: string;
    title: string;
    loadingMessage: string;
  }
> = {
  strategy: {
    endpoint: "/api/case-war-room/strategy",
    title: "Stage 5 - Strategy Builder",
    loadingMessage: "Building strategy options...",
  },
  evaluation: {
    endpoint: "/api/case-war-room/evaluation",
    title: "Stage 6 - Evaluation Matrix",
    loadingMessage: "Comparing strategic choices...",
  },
  risks: {
    endpoint: "/api/case-war-room/risks",
    title: "Stage 7 - Risk Matrix",
    loadingMessage: "Stress-testing risks...",
  },
  recommendation: {
    endpoint: "/api/case-war-room/recommendation",
    title: "Stage 8 - Final Recommendation",
    loadingMessage: "Writing recommendation logic...",
  },
  ppt: {
    endpoint: "/api/case-war-room/ppt",
    title: "Stage 9 - PPT Storyline",
    loadingMessage: "Creating PPT storyline...",
  },
  reflection: {
    endpoint: "/api/case-war-room/reflection",
    title: "Stage 10 - Reflection Questions",
    loadingMessage: "Preparing reflection questions...",
  },
  readinessScore: {
    endpoint: "/api/case-war-room/readiness-score",
    title: "Stage 11 - Case Readiness Score",
    loadingMessage: "Scoring case readiness...",
  },
};

function createEmptySolutionResults() {
  return Object.fromEntries(
    solutionStageKeys.map((key) => [key, null]),
  ) as Record<SolutionStageKey, StageResult | null>;
}

function createEmptySolutionLoading() {
  return Object.fromEntries(
    solutionStageKeys.map((key) => [key, false]),
  ) as Record<SolutionStageKey, boolean>;
}

function createEmptySolutionErrors() {
  return Object.fromEntries(
    solutionStageKeys.map((key) => [key, ""]),
  ) as Record<SolutionStageKey, string>;
}

function createEmptySolutionErrorDetails() {
  return Object.fromEntries(
    solutionStageKeys.map((key) => [key, undefined]),
  ) as Record<SolutionStageKey, StageErrorDetails | undefined>;
}

function isSolutionStageKey(stage: StageKey): stage is SolutionStageKey {
  return solutionStageKeys.includes(stage as SolutionStageKey);
}

function normalizeMissingText(text: string) {
  return text.replace(/Not available in the provided case\./g, "Not available in provided case.");
}

function resultToMarkdown(title: string, value: unknown, depth = 0): string {
  const prefix = "#".repeat(Math.min(depth + 2, 6));

  if (Array.isArray(value)) {
    if (value.length === 0) return "- Not available in provided case.\n";

    return value
      .map((item, index) => {
        if (typeof item === "object" && item !== null) {
          return `${prefix} Item ${index + 1}\n${resultToMarkdown(title, item, depth + 1)}`;
        }

        return `- ${normalizeMissingText(asText(item))}`;
      })
      .join("\n");
  }

  if (typeof value === "object" && value !== null) {
    return Object.entries(value)
      .map(([key, entry]) => {
        const label = humanizeKey(key);

        if (typeof entry === "object" && entry !== null) {
          return `${prefix} ${label}\n${resultToMarkdown(label, entry, depth + 1)}`;
        }

        return `${prefix} ${label}\n${normalizeMissingText(asText(entry))}`;
      })
      .join("\n\n");
  }

  return `${prefix} ${title}\n${normalizeMissingText(asText(value))}`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  }[character] || character));
}

function markdownToPrintHtml(markdown: string) {
  const lines = markdown.split("\n");
  const html: string[] = [];
  let listOpen = false;

  const closeList = () => {
    if (!listOpen) return;
    html.push("</ul>");
    listOpen = false;
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      closeList();
      return;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);

    if (heading) {
      closeList();
      const level = Math.min(heading[1].length, 3);
      html.push(`<h${level}>${escapeHtml(heading[2])}</h${level}>`);
      return;
    }

    if (trimmed.startsWith("- ")) {
      if (!listOpen) {
        html.push("<ul>");
        listOpen = true;
      }
      html.push(`<li>${escapeHtml(trimmed.slice(2))}</li>`);
      return;
    }

    closeList();
    html.push(`<p>${escapeHtml(trimmed)}</p>`);
  });

  closeList();

  return html.join("\n");
}

function slugifyFilename(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 52);

  return slug || "case-war-room-output";
}

function downloadTextFile(filename: string, text: string, type = "text/markdown") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function FieldLabel({
  children,
  optional,
}: {
  children: ReactNode;
  optional?: boolean;
}) {
  return (
    <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/42">
      {children}
      {optional && <span className="ml-2 normal-case tracking-[0] text-white/28">Optional</span>}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="grid gap-2">
      <FieldLabel>{label}</FieldLabel>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 rounded-[8px] border border-white/10 bg-[#111416] px-3 text-[0.94rem] text-white/82 outline-none transition focus:border-amber-200/38 focus:ring-2 focus:ring-amber-200/12"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-[#111416]">
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  optional,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  optional?: boolean;
  type?: string;
}) {
  return (
    <div className="grid gap-2">
      <FieldLabel optional={optional}>{label}</FieldLabel>
      <input
        aria-label={label}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-12 rounded-[8px] border border-white/10 bg-[#111416] px-3 text-[0.94rem] text-white/82 outline-none transition placeholder:text-white/28 focus:border-amber-200/38 focus:ring-2 focus:ring-amber-200/12"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
  optional,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  optional?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <FieldLabel optional={optional}>{label}</FieldLabel>
      <textarea
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="resize-y rounded-[8px] border border-white/10 bg-[#111416] px-3 py-3 text-[0.94rem] leading-[1.55] text-white/82 outline-none transition placeholder:text-white/28 focus:border-amber-200/38 focus:ring-2 focus:ring-amber-200/12"
      />
    </div>
  );
}

function SourceBadge() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        title="This analysis uses only the material you provide. No outside web search or company knowledge is added."
        className="inline-flex min-h-9 items-center gap-2 rounded-[8px] border border-emerald-200/24 bg-emerald-300/[0.1] px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-emerald-100"
      >
        <ShieldCheck className="h-4 w-4" />
        Case-Only Mode is ON
      </span>
    </div>
  );
}

function humanizeKey(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function asText(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "Not available in provided case.";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return normalizeMissingText(String(value));
  }

  return normalizeMissingText(JSON.stringify(value, null, 2));
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
}

function readString(record: Record<string, unknown>, keys: string[], fallback = "Not available in the provided case.") {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) return normalizeMissingText(value.trim());
    if (typeof value === "number" || typeof value === "boolean") return String(value);
  }

  return fallback;
}

function readBoolean(record: Record<string, unknown>, keys: string[]) {
  return keys.some((key) => Boolean(record[key]));
}

function readStringList(record: Record<string, unknown>, keys: string[], fallback: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (Array.isArray(value)) {
      const items = value
        .map((item) => asText(item))
        .filter((item) => item && item !== "Not available in provided case.");

      if (items.length) return items;
    }
  }

  return fallback;
}

function normalizeClassroomBriefData(value: unknown): ClassroomBriefData {
  const record = asRecord(value);
  const stakeholders = Array.isArray(record.stakeholders)
    ? record.stakeholders.map((item) => {
        const row = asRecord(item);

        return {
          stakeholder: readString(row, ["stakeholder", "name"]),
          whatTheyWant: readString(row, ["whatTheyWant", "what_they_want", "want"]),
          pressureOrProblem: readString(row, ["pressureOrProblem", "pressure_or_problem", "pressure", "problem"]),
          whyTheyMatter: readString(row, ["whyTheyMatter", "why_they_matter", "importance"]),
        };
      })
    : [];
  const timeline = Array.isArray(record.timeline)
    ? record.timeline.map((item) => {
        const row = asRecord(item);

        return {
          period: readString(row, ["period", "date", "year", "time"]),
          event: readString(row, ["event", "what_happened"]),
          whyItMatters: readString(row, ["whyItMatters", "why_it_matters", "importance"]),
        };
      })
    : [];
  const keyFactsNumbers = Array.isArray(record.keyFactsNumbers)
    ? record.keyFactsNumbers.map((item) => {
        const row = asRecord(item);

        return {
          factOrNumber: readString(row, ["factOrNumber", "fact_or_number", "number", "fact"]),
          context: readString(row, ["context", "whereItAppears", "where_it_appears"]),
          whyItMatters: readString(row, ["whyItMatters", "why_it_matters"]),
          discussionUse: readString(row, ["discussionUse", "discussion_use", "how_it_may_be_used", "use"]),
          needsVerification: readBoolean(row, ["needsVerification", "needs_verification"]),
        };
      })
    : [];

  return {
    caseSnapshot: readString(record, ["caseSnapshot", "case_snapshot", "snapshot"]),
    mainDecision: readString(record, ["mainDecision", "main_decision", "coreQuestion", "core_question"]),
    caseObjective: readString(record, ["caseObjective", "case_objective", "objective"]),
    stakeholders,
    timeline,
    keyFactsNumbers,
    keyTensions: readStringList(record, ["keyTensions", "key_tensions"], ["Not available in the provided case."]),
    professorPushAngles: readStringList(record, ["professorPushAngles", "professor_push_angles"], ["Not available in the provided case."]),
    preparationChecklist: readStringList(record, ["preparationChecklist", "preparation_checklist"], [
      "I understand the main decision.",
      "I know the key stakeholders.",
      "I can explain the top facts and numbers.",
      "I know what tradeoffs are involved.",
      "I have questions ready for class.",
    ]),
    smartQuestions: readStringList(record, ["smartQuestions", "smart_questions"], ["Not available in the provided case."]),
  };
}

function renderMarkdownTable(headers: string[], rows: string[][]) {
  if (rows.length === 0) return "Not available in the provided case.";

  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => normalizeMissingText(cell).replace(/\|/g, "/")).join(" | ")} |`),
  ].join("\n");
}

function classroomBriefToMarkdown(title: string, result: StageResult | null) {
  if (!result) return "";

  const brief = normalizeClassroomBriefData(result.data);
  const timelineMarkdown = brief.timeline.length
    ? renderMarkdownTable(
        ["Period", "Event", "Why it matters"],
        brief.timeline.map((item) => [item.period, item.event, item.whyItMatters]),
      )
    : "No clear timeline is available in the provided case.";

  return [
    `# ${title}`,
    "",
    "## 60-Second Case Snapshot",
    brief.caseSnapshot,
    "",
    "## Main Decision / Core Question",
    brief.mainDecision,
    "",
    "## Case Objective",
    brief.caseObjective,
    "",
    "## Stakeholder Map",
    renderMarkdownTable(
      ["Stakeholder", "What they want", "Pressure/problem", "Why they matter"],
      brief.stakeholders.map((item) => [item.stakeholder, item.whatTheyWant, item.pressureOrProblem, item.whyTheyMatter]),
    ),
    "",
    "## Timeline / Case Flow",
    timelineMarkdown,
    "",
    "## Facts and Numbers to Remember",
    renderMarkdownTable(
      ["Fact/number", "Context", "Why it matters", "Discussion use"],
      brief.keyFactsNumbers.map((item) => [
        item.needsVerification ? `${item.factOrNumber} (Needs verification)` : item.factOrNumber,
        item.context,
        item.whyItMatters,
        item.discussionUse,
      ]),
    ),
    "",
    "## Key Tensions",
    brief.keyTensions.map((item) => `- ${item}`).join("\n"),
    "",
    "## What the Professor May Push On",
    brief.professorPushAngles.map((item) => `- ${item}`).join("\n"),
    "",
    "## Before-Class Preparation Checklist",
    brief.preparationChecklist.map((item) => `- ${item}`).join("\n"),
    "",
    "## 3 Smart Questions to Ask in Class",
    brief.smartQuestions.slice(0, 3).map((item) => `- ${item}`).join("\n"),
  ].join("\n");
}

function renderPrintTable(headers: string[], rows: string[][]) {
  if (rows.length === 0) {
    return `<p>Not available in the provided case.</p>`;
  }

  return `
    <table>
      <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
      <tbody>
        ${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(normalizeMissingText(cell))}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  `;
}

function classroomBriefToPrintHtml(title: string, result: StageResult | null) {
  if (!result) return "";

  const brief = normalizeClassroomBriefData(result.data);
  const timelineHtml = brief.timeline.length
    ? renderPrintTable(
        ["Period", "Event", "Why it matters"],
        brief.timeline.map((item) => [item.period, item.event, item.whyItMatters]),
      )
    : "<p>No clear timeline is available in the provided case.</p>";

  return `
    <section class="page">
      <p class="kicker">Classroom Case Brief</p>
      <h1>${escapeHtml(title)}</h1>
      <h2>60-Second Case Snapshot</h2>
      <p class="snapshot">${escapeHtml(brief.caseSnapshot)}</p>
      <div class="two-col">
        <div>
          <h2>Main Decision / Core Question</h2>
          <p>${escapeHtml(brief.mainDecision)}</p>
        </div>
        <div>
          <h2>Case Objective</h2>
          <p>${escapeHtml(brief.caseObjective)}</p>
        </div>
      </div>
      <h2>Stakeholder Map</h2>
      ${renderPrintTable(
        ["Stakeholder", "What they want", "Pressure/problem", "Why they matter"],
        brief.stakeholders.map((item) => [item.stakeholder, item.whatTheyWant, item.pressureOrProblem, item.whyTheyMatter]),
      )}
    </section>
    <section class="page">
      <h2>Timeline / Case Flow</h2>
      ${timelineHtml}
      <h2>Facts and Numbers to Remember</h2>
      ${renderPrintTable(
        ["Fact/number", "Context", "Why it matters", "Discussion use"],
        brief.keyFactsNumbers.map((item) => [
          item.needsVerification ? `${item.factOrNumber} (Needs verification)` : item.factOrNumber,
          item.context,
          item.whyItMatters,
          item.discussionUse,
        ]),
      )}
      <div class="two-col">
        <div>
          <h2>Key Tensions</h2>
          <ul>${brief.keyTensions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
        <div>
          <h2>Professor May Push On</h2>
          <ul>${brief.professorPushAngles.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
      </div>
      <h2>3 Smart Questions to Ask in Class</h2>
      <ol>${brief.smartQuestions.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
    </section>
  `;
}

function TrustBadge({ children, tone }: { children: ReactNode; tone: "assumption" | "missing" | "verify" }) {
  const toneClass =
    tone === "assumption"
      ? "border-amber-200/30 bg-amber-200/[0.1] text-amber-100"
      : tone === "missing"
        ? "border-white/12 bg-white/[0.06] text-white/58"
        : "border-sky-200/24 bg-sky-200/[0.08] text-sky-100/82";

  return (
    <span className={`inline-flex min-h-6 items-center rounded-[7px] border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${toneClass}`}>
      {children}
    </span>
  );
}

function valueNeedsVerification(key = "", value: unknown) {
  const combined = `${key} ${asText(value)}`.toLowerCase();

  return /\b(calculation|calculations|financial|score|result|margin|growth|cagr|npv|break-even|revenue|cost|profit|unit economics|unclear number)\b/.test(combined);
}

function TrustAnnotatedValue({ value, itemKey }: { value: unknown; itemKey?: string }) {
  const text = asText(value);
  const isMissing = text.includes("Not available in provided case.");
  const isAssumption = /assumption required|assumptions required/i.test(`${itemKey || ""} ${text}`);
  const needsVerification = valueNeedsVerification(itemKey, value);

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        {isAssumption && <TrustBadge tone="assumption">Assumption required</TrustBadge>}
        {isMissing && <TrustBadge tone="missing">Not available in provided case</TrustBadge>}
        {needsVerification && <TrustBadge tone="verify">Needs verification</TrustBadge>}
      </div>
      <p className="text-[0.94rem] leading-[1.62] text-white/68">{text}</p>
    </div>
  );
}

function StructuredOutput({ value, itemKey, depth = 0 }: { value: unknown; itemKey?: string; depth?: number }) {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <div className="grid gap-2">
          <TrustBadge tone="missing">Not available in provided case</TrustBadge>
          <p className="text-[0.92rem] text-white/46">Not available in provided case.</p>
        </div>
      );
    }

    const primitiveItems = value.filter((item) => typeof item !== "object" || item === null);
    const objectItems = value.filter((item) => typeof item === "object" && item !== null);

    if (objectItems.length === 0) {
      return (
        <ul className="grid gap-2 pl-0">
          {primitiveItems.map((item, index) => (
            <li key={index} className="flex gap-2 text-[0.94rem] leading-[1.62] text-white/68">
              <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-100/54" />
              <span>{asText(item)}</span>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <div className="grid gap-4">
        {value.map((item, index) => (
          <div key={index} className="border-l border-white/12 pl-4">
            {typeof item === "object" && item !== null ? (
              <StructuredOutput value={item} itemKey={itemKey} depth={depth + 1} />
            ) : (
              <TrustAnnotatedValue value={item} itemKey={itemKey} />
            )}
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object" && value !== null) {
    return (
      <div className={depth === 0 ? "grid gap-5" : "grid gap-4"}>
        {Object.entries(value).map(([key, entry]) => (
          <section key={key} className={depth === 0 ? "border-t border-white/10 pt-4 first:border-t-0 first:pt-0" : "pt-1"}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
              {humanizeKey(key)}
            </p>
            <div className="mt-3">
              {typeof entry === "object" && entry !== null ? (
                <StructuredOutput value={entry} itemKey={key} depth={depth + 1} />
              ) : (
                <TrustAnnotatedValue value={entry} itemKey={key} />
              )}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return <TrustAnnotatedValue value={value} itemKey={itemKey} />;
}

function OutputCard({
  title,
  result,
  loading,
  loadingMessage = "Reading only the provided case material. No outside search is being used.",
  error,
  errorDetails,
  onCopy,
  onRegenerate,
}: {
  title: string;
  result: StageResult | null;
  loading: boolean;
  loadingMessage?: string;
  error: string;
  errorDetails?: StageErrorDetails;
  onCopy: () => void;
  onRegenerate: () => void;
}) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-[#101214] p-4 shadow-[0_26px_90px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.05)] md:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/36">
            Generated output
          </p>
          <h3 className="mt-2 text-[1.35rem] font-semibold text-white/90">{title}</h3>
          {result && (
            <p className="mt-2 text-[0.78rem] leading-[1.45] text-white/38">
              Saved locally · {new Date(result.generatedAt).toLocaleString()} {result.model ? `· ${result.model}` : ""}
            </p>
          )}
          {result?.usedFallback && (
            <div className="mt-3">
              <TrustBadge tone="assumption">Generated using fallback model.</TrustBadge>
            </div>
          )}
          {result?.notices?.length ? (
            <div className="mt-3 grid gap-1.5">
              {result.notices.map((notice) => (
                <p key={notice} className="text-[0.78rem] leading-[1.45] text-amber-100/62">
                  {notice}
                </p>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCopy}
            disabled={!result}
            className="inline-flex min-h-10 items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-[12px] font-semibold text-white/64 transition hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-38"
            aria-label={`Copy ${title}`}
          >
            <Copy className="h-4 w-4" />
            Copy section
          </button>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={loading}
            className="inline-flex min-h-10 items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-[12px] font-semibold text-white/68 transition hover:bg-white/[0.09] disabled:cursor-wait disabled:opacity-54"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {result ? "Regenerate" : "Generate"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="grid gap-3 rounded-[8px] border border-amber-200/22 bg-amber-200/[0.075] p-4">
          <p className="text-[0.92rem] text-amber-100/78">{loadingMessage}</p>
          <div className="grid gap-2">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-10 animate-pulse rounded-[8px] border border-white/10 bg-white/[0.055]"
              />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="grid gap-3 rounded-[8px] border border-amber-200/24 bg-amber-200/[0.08] p-4">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-100/82" />
            <div>
              <p className="text-[0.95rem] font-semibold text-amber-50">{error}</p>
              {errorDetails?.nextAction && (
                <p className="mt-2 text-[0.88rem] leading-[1.55] text-amber-100/76">
                  {errorDetails.nextAction}
                </p>
              )}
            </div>
          </div>
          {errorDetails?.retryable && (
            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex min-h-10 w-fit items-center gap-2 rounded-[8px] border border-amber-100/24 bg-amber-100/[0.1] px-3 text-[12px] font-semibold text-amber-50 transition hover:bg-amber-100/[0.16]"
            >
              <RefreshCw className="h-4 w-4" />
              Retry this stage
            </button>
          )}
        </div>
      )}

      {!loading && !error && result && <StructuredOutput value={result.data} />}

      {!loading && !error && !result && (
        <div className="grid gap-3">
          {[
            "Case evidence will appear here after analysis is connected.",
            "Unsupported claims should be marked as: Assumption required.",
            "Missing facts should be marked as: Not available in the provided case.",
          ].map((item) => (
            <div key={item} className="rounded-[8px] border border-white/10 bg-[#15181b] p-4">
              <p className="text-[0.95rem] leading-[1.58] text-white/62">{item}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClassroomBriefCard({
  title,
  result,
  loading,
  error,
  errorDetails,
  onCopy,
  onRegenerate,
}: {
  title: string;
  result: StageResult | null;
  loading: boolean;
  error: string;
  errorDetails?: StageErrorDetails;
  onCopy: () => void;
  onRegenerate: () => void;
}) {
  const brief = result ? normalizeClassroomBriefData(result.data) : null;
  const timeline = brief?.timeline.length
    ? brief.timeline
    : [{
        period: "Not available in the provided case.",
        event: "No clear timeline is available in the provided case.",
        whyItMatters: "Not available in the provided case.",
      }];

  return (
    <div className="rounded-[8px] border border-white/10 bg-[#101214] p-4 shadow-[0_26px_90px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.05)] md:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/46">
            Classroom Mode
          </p>
          <h3 className="mt-2 text-[1.45rem] font-semibold text-white/92">{title}</h3>
          <p className="mt-2 max-w-[620px] text-[0.86rem] leading-[1.5] text-white/48">
            A concise case-method briefing for class discussion. No recommendations or outside facts are added.
          </p>
          {result && (
            <p className="mt-2 text-[0.78rem] leading-[1.45] text-white/38">
              Saved locally · {new Date(result.generatedAt).toLocaleString()} {result.model ? `· ${result.model}` : ""}
            </p>
          )}
          {result?.usedFallback && (
            <div className="mt-3">
              <TrustBadge tone="assumption">Generated using fallback model.</TrustBadge>
            </div>
          )}
          {result?.notices?.length ? (
            <div className="mt-3 grid gap-1.5">
              {result.notices.map((notice) => (
                <p key={notice} className="text-[0.78rem] leading-[1.45] text-amber-100/62">
                  {notice}
                </p>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCopy}
            disabled={!result}
            className="inline-flex min-h-10 items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-[12px] font-semibold text-white/64 transition hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-38"
          >
            <Copy className="h-4 w-4" />
            Copy brief
          </button>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={loading}
            className="inline-flex min-h-10 items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-[12px] font-semibold text-white/68 transition hover:bg-white/[0.09] disabled:cursor-wait disabled:opacity-54"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {result ? "Regenerate" : "Generate"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="grid gap-3 rounded-[8px] border border-amber-200/22 bg-amber-200/[0.075] p-4">
          <p className="text-[0.92rem] text-amber-100/78">
            Preparing a concise classroom case brief from the provided material only.
          </p>
          <div className="grid gap-2">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-10 animate-pulse rounded-[8px] border border-white/10 bg-white/[0.055]" />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="grid gap-3 rounded-[8px] border border-amber-200/24 bg-amber-200/[0.08] p-4">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-100/82" />
            <div>
              <p className="text-[0.95rem] font-semibold text-amber-50">{error}</p>
              {errorDetails?.nextAction && (
                <p className="mt-2 text-[0.88rem] leading-[1.55] text-amber-100/76">
                  {errorDetails.nextAction}
                </p>
              )}
            </div>
          </div>
          {errorDetails?.retryable && (
            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex min-h-10 w-fit items-center gap-2 rounded-[8px] border border-amber-100/24 bg-amber-100/[0.1] px-3 text-[12px] font-semibold text-amber-50 transition hover:bg-amber-100/[0.16]"
            >
              <RefreshCw className="h-4 w-4" />
              Retry classroom brief
            </button>
          )}
        </div>
      )}

      {!loading && !error && !result && (
        <div className="rounded-[8px] border border-white/10 bg-[#15181b] p-4">
          <p className="text-[0.95rem] leading-[1.58] text-white/62">
            Generate the Classroom Case Brief to get a 1-2 minute study note before class.
          </p>
        </div>
      )}

      {!loading && !error && brief && (
        <div className="grid gap-5">
          <section className="rounded-[8px] border border-emerald-200/18 bg-emerald-300/[0.075] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/58">
              60-Second Case Snapshot
            </p>
            <p className="mt-3 text-[1rem] leading-[1.62] text-white/78">{brief.caseSnapshot}</p>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-[8px] border border-white/10 bg-[#111416] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/34">
                Main Decision / Core Question
              </p>
              <p className="mt-3 text-[0.98rem] leading-[1.56] text-white/76">{brief.mainDecision}</p>
            </section>
            <section className="rounded-[8px] border border-white/10 bg-[#111416] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/34">
                Case Objective
              </p>
              <p className="mt-3 text-[0.98rem] leading-[1.56] text-white/76">{brief.caseObjective}</p>
            </section>
          </div>

          <section className="rounded-[8px] border border-white/10 bg-[#111416] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/34">
              Stakeholder Map
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left text-[0.84rem]">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.12em] text-white/34">
                    <th className="py-2 pr-3 font-semibold">Stakeholder</th>
                    <th className="px-3 py-2 font-semibold">What they want</th>
                    <th className="px-3 py-2 font-semibold">Pressure/problem</th>
                    <th className="py-2 pl-3 font-semibold">Why they matter</th>
                  </tr>
                </thead>
                <tbody>
                  {brief.stakeholders.map((item, index) => (
                    <tr key={`${item.stakeholder}-${index}`} className="border-b border-white/8 last:border-b-0">
                      <td className="py-3 pr-3 font-semibold text-white/78">{item.stakeholder}</td>
                      <td className="px-3 py-3 leading-[1.45] text-white/62">{item.whatTheyWant}</td>
                      <td className="px-3 py-3 leading-[1.45] text-white/62">{item.pressureOrProblem}</td>
                      <td className="py-3 pl-3 leading-[1.45] text-white/62">{item.whyTheyMatter}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[8px] border border-white/10 bg-[#111416] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/34">
                Timeline / Case Flow
              </p>
              <div className="mt-3 grid gap-2">
                {timeline.map((item, index) => (
                  <div key={`${item.period}-${index}`} className="rounded-[8px] border border-white/10 bg-white/[0.035] p-3">
                    <p className="text-[0.8rem] font-semibold text-amber-100/72">{item.period}</p>
                    <p className="mt-1 text-[0.9rem] leading-[1.45] text-white/72">{item.event}</p>
                    <p className="mt-1 text-[0.78rem] leading-[1.45] text-white/42">{item.whyItMatters}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[8px] border border-white/10 bg-[#111416] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/34">
                Facts and Numbers to Remember
              </p>
              <div className="mt-3 grid gap-2">
                {brief.keyFactsNumbers.map((item, index) => (
                  <div key={`${item.factOrNumber}-${index}`} className="rounded-[8px] border border-white/10 bg-white/[0.035] p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-[0.92rem] font-semibold text-white/80">{item.factOrNumber}</p>
                      {item.needsVerification && <TrustBadge tone="verify">Needs verification</TrustBadge>}
                    </div>
                    <p className="mt-2 text-[0.82rem] leading-[1.45] text-white/48">{item.context}</p>
                    <p className="mt-2 text-[0.86rem] leading-[1.45] text-white/64">{item.whyItMatters}</p>
                    <p className="mt-1 text-[0.78rem] leading-[1.45] text-emerald-100/56">{item.discussionUse}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-[8px] border border-white/10 bg-[#111416] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/34">
                Key Tensions in the Case
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {brief.keyTensions.map((item) => (
                  <span key={item} className="rounded-[8px] border border-amber-100/18 bg-amber-100/[0.07] px-2.5 py-1.5 text-[12px] font-medium text-amber-50/76">
                    {item}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-[8px] border border-white/10 bg-[#111416] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/34">
                What the Professor May Push On
              </p>
              <ul className="mt-3 grid gap-2">
                {brief.professorPushAngles.map((item) => (
                  <li key={item} className="flex gap-2 text-[0.9rem] leading-[1.5] text-white/66">
                    <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-100/58" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
            <section className="rounded-[8px] border border-white/10 bg-[#111416] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/34">
                Before-Class Preparation Checklist
              </p>
              <ul className="mt-3 grid gap-2">
                {brief.preparationChecklist.map((item) => (
                  <li key={item} className="flex gap-2 text-[0.9rem] leading-[1.5] text-white/66">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-100/62" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-[8px] border border-white/10 bg-[#111416] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/34">
                3 Smart Questions to Ask in Class
              </p>
              <ol className="mt-3 grid gap-3">
                {brief.smartQuestions.slice(0, 3).map((item, index) => (
                  <li key={item} className="grid grid-cols-[28px_1fr] gap-3 text-[0.95rem] leading-[1.52] text-white/72">
                    <span className="grid h-7 w-7 place-items-center rounded-[8px] border border-white/10 bg-white/[0.055] text-[11px] font-semibold text-amber-100/70">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

function PdfRecoveryPanel({
  caseText,
  textLength,
  isPreparing,
  onTextChange,
  onPrepare,
  onOpenTextMode,
}: {
  caseText: string;
  textLength: number;
  isPreparing: boolean;
  onTextChange: (value: string) => void;
  onPrepare: () => void;
  onOpenTextMode: () => void;
}) {
  return (
    <div className="grid gap-4 rounded-[8px] border border-white/10 bg-[#111416] p-4">
      <div>
        <p className="text-[0.98rem] font-semibold text-white/88">
          Continue without losing the flow.
        </p>
        <p className="mt-2 text-[0.88rem] leading-[1.55] text-white/54">
          Some PDFs fail in production when they are protected, scanned, or parsed
          differently on the server. Paste the readable case text here and the
          same brief, decode, and strategy flow will continue.
        </p>
      </div>
      <TextAreaField
        label="Paste case text"
        value={caseText}
        onChange={onTextChange}
        rows={8}
        placeholder="Paste the case introduction, decision question, exhibits, numbers, and assignment instructions..."
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.82rem] text-white/42">
          {textLength.toLocaleString()} characters pasted.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onOpenTextMode}
            className="inline-flex min-h-10 items-center justify-center rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-[12px] font-semibold text-white/66 transition hover:bg-white/[0.09]"
          >
            Open text input area
          </button>
          <button
            type="button"
            onClick={onPrepare}
            disabled={!caseText.trim() || isPreparing}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] bg-[var(--surface)] px-4 text-[12px] font-semibold text-[#101214] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-46"
          >
            {isPreparing ? "Preparing..." : "Prepare pasted text"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function cleanPreviewValue(value?: string) {
  if (!value || /not available in the provided case/i.test(value)) {
    return "Not available in the provided case.";
  }

  return value;
}

function CaseBriefSummary({
  source,
  extractedText,
  isEditing,
  onToggleEdit,
  onTextChange,
}: {
  source: PreparedSource;
  extractedText: string;
  isEditing: boolean;
  onToggleEdit: () => void;
  onTextChange: (value: string) => void;
}) {
  const preview = source.preview;
  const decisionSignals = preview.decisionSignals?.length
    ? preview.decisionSignals
    : ["Not available in the provided case."];
  const topics = preview.keyTopics?.length
    ? preview.keyTopics
    : [preview.detectedSubject || "General Management"];
  const sourceQuality = preview.sourceQuality || "usable";
  const qualityLabel =
    sourceQuality === "strong"
      ? "Clean source"
      : sourceQuality === "usable"
        ? "Usable source"
        : "Needs review";
  const qualityClass =
    sourceQuality === "strong"
      ? "border-emerald-200/22 bg-emerald-300/[0.08] text-emerald-100/78"
      : sourceQuality === "usable"
        ? "border-amber-200/24 bg-amber-200/[0.08] text-amber-100/78"
        : "border-red-200/24 bg-red-300/[0.08] text-red-100/78";

  return (
    <div className="grid gap-4">
      <div className="rounded-[8px] border border-emerald-200/18 bg-emerald-300/[0.075] p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100/58">
              Source quality
            </p>
            <h2 className="mt-2 text-[1.45rem] font-semibold leading-[1.12] text-white/92">
              {cleanPreviewValue(preview.detectedTitle)}
            </h2>
            <p className="mt-3 max-w-[820px] text-[0.96rem] leading-[1.62] text-white/68">
              {cleanPreviewValue(preview.caseBrief)}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[390px] lg:grid-cols-1">
            {[
              ["Subject", preview.detectedSubject || "General Management"],
              ["Case type", preview.caseType || "General management case"],
              ["Cleaned words", `About ${preview.approximateWordCount.toLocaleString()}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[8px] border border-white/10 bg-[#101614] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/34">{label}</p>
                <p className="mt-1 text-[0.9rem] font-semibold text-white/76">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`rounded-[8px] border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${qualityClass}`}>
            {qualityLabel}
          </span>
          <span className="rounded-[8px] border border-white/10 bg-white/[0.045] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/52">
            {preview.narrativeStartDetected ? "Narrative detected" : "Narrative uncertain"}
          </span>
          <span className="rounded-[8px] border border-white/10 bg-white/[0.045] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/52">
            {Number(preview.removedBoilerplateCount || 0).toLocaleString()} noise lines removed
          </span>
          <span className="rounded-[8px] border border-white/10 bg-white/[0.045] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/52">
            {preview.hasExhibits || preview.hasNumbers ? "Evidence found" : "Limited evidence"}
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.82fr]">
        <div className="rounded-[8px] border border-white/10 bg-[#111416] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/34">
            Main decision detected
          </p>
          <p className="mt-3 text-[0.98rem] leading-[1.58] text-white/72">
            {normalizeMissingText(preview.caseDecision || decisionSignals[0])}
          </p>
          <ul className="mt-4 grid gap-2">
            {decisionSignals.slice(1, 4).map((signal) => (
              <li key={signal} className="flex gap-3 text-[0.88rem] leading-[1.5] text-white/52">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-100/62" />
                <span>{normalizeMissingText(signal)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[8px] border border-white/10 bg-[#111416] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/34">
            Detected focus areas
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {topics.map((topic) => (
              <span key={topic} className="rounded-[8px] border border-white/10 bg-white/[0.045] px-2.5 py-1.5 text-[12px] font-medium text-white/64">
                {topic}
              </span>
            ))}
          </div>
          <p className="mt-4 text-[0.88rem] leading-[1.5] text-white/46">
            Subject and topic detection are used as defaults only. You can refine them in the optional setup panel.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[8px] border border-white/10 bg-[#111416] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/34">
            Evidence found
          </p>
          <div className="mt-3 grid gap-2">
            {(preview.detectedSections.length
              ? preview.detectedSections.slice(0, 5)
              : ["No structured exhibits were detected in the provided case."]).map((section) => (
              <p key={section} className="rounded-[8px] border border-white/10 bg-white/[0.035] px-3 py-2 text-[0.85rem] leading-[1.45] text-white/58">
                {section}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-[8px] border border-white/10 bg-[#111416] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/34">
            Numbers the brief may use
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(preview.numberSamples.length
              ? preview.numberSamples.slice(0, 10)
              : ["Not available in the provided case."]).map((number) => (
              <span key={number} className="rounded-[8px] border border-white/10 bg-white/[0.045] px-2.5 py-1.5 text-[12px] text-white/58">
                {normalizeMissingText(number)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {preview.warnings.length > 0 && (
        <div className="grid gap-2 rounded-[8px] border border-amber-200/24 bg-amber-200/[0.08] p-3">
          {preview.warnings.map((warning) => (
            <div key={warning} className="flex gap-2 text-[0.84rem] leading-[1.45] text-amber-100/84">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      <details className="group rounded-[8px] border border-white/10 bg-[#101214] p-4">
        <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/34">
              Source recovery
            </p>
            <p className="mt-1 text-[0.86rem] leading-[1.5] text-white/48">
              Advanced only. Open this if the PDF parser missed an exhibit, merged a table, or you want to replace the cleaned source.
            </p>
          </div>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] border border-white/10 bg-white/[0.045] text-white/50 transition group-open:rotate-180">
            <ChevronDown className="h-4 w-4" />
          </span>
        </summary>
        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[0.84rem] leading-[1.45] text-white/44">
              The main journey uses cleaned source text. Edit only when the brief clearly missed case content.
            </p>
            <button
              type="button"
              onClick={onToggleEdit}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-[12px] font-semibold text-white/68 transition hover:bg-white/[0.09]"
            >
              <Pencil className="h-4 w-4" />
              {isEditing ? "Show cleaned preview" : "Edit cleaned source"}
            </button>
          </div>

          {isEditing ? (
            <div className="mt-4">
              <TextAreaField
                label="Editable cleaned source"
                value={extractedText}
                onChange={onTextChange}
                rows={14}
              />
            </div>
          ) : (
            <div className="mt-4 max-h-[220px] overflow-auto rounded-[8px] border border-white/10 bg-[#111416] p-4">
              <p className="whitespace-pre-wrap text-[0.86rem] leading-[1.58] text-white/52">
                {extractedText.slice(0, 3200)}
                {extractedText.length > 3200 ? "\n\n[Preview trimmed. Full cleaned source is saved for analysis.]" : ""}
              </p>
            </div>
          )}
        </div>
      </details>
    </div>
  );
}

function readSavedWorkspace(): SavedWorkspace {
  if (typeof window === "undefined") return {};

  try {
    const saved =
      window.localStorage.getItem(STORAGE_KEY) ||
      window.localStorage.getItem(PREVIOUS_STORAGE_KEY) ||
      window.localStorage.getItem(LEGACY_STORAGE_KEY) ||
      "{}";

    return JSON.parse(saved) as SavedWorkspace;
  } catch {
    return {};
  }
}

export function CaseWarRoomWorkspace({ tool }: { tool: AITool }) {
  const [savedWorkspace, setSavedWorkspace] = useState<SavedWorkspace>({});
  const [savedWorkspaceLoaded, setSavedWorkspaceLoaded] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("pdf");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [caseTitle, setCaseTitle] = useState("");
  const [caseText, setCaseText] = useState("");
  const [caseUrl, setCaseUrl] = useState("");
  const [sourceInstructions, setSourceInstructions] = useState("");
  const [quickDecode, setQuickDecode] = useState(false);
  const [classroomMode, setClassroomMode] = useState(true);
  const [competitionMode, setCompetitionMode] = useState(false);
  const [learningMode, setLearningMode] = useState(false);
  const [subject, setSubject] = useState("General Management");
  const [purpose, setPurpose] = useState(purposes[0]);
  const [requiredOutput, setRequiredOutput] = useState(outputTypes[0]);
  const [workMode, setWorkMode] = useState<WorkMode>("Individual");
  const [teamSize, setTeamSize] = useState(4);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(
    Array.from({ length: 4 }, () => ({ name: "", strengths: "" })),
  );
  const [deadline, setDeadline] = useState(deadlines[2]);
  const [analysisDepth, setAnalysisDepth] = useState(analysisDepths[1]);
  const [professorInstructions, setProfessorInstructions] = useState("");
  const [slideLimit, setSlideLimit] = useState("");
  const [evaluationCriteria, setEvaluationCriteria] = useState("");
  const [specificQuestions, setSpecificQuestions] = useState("");
  const [knownConstraints, setKnownConstraints] = useState("");
  const [activeStage, setActiveStage] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isPreparingSource, setIsPreparingSource] = useState(false);
  const [isRunningClassroomBrief, setIsRunningClassroomBrief] = useState(false);
  const [isRunningDecode, setIsRunningDecode] = useState(false);
  const [isRunningExhibits, setIsRunningExhibits] = useState(false);
  const [isRunningTeamSplit, setIsRunningTeamSplit] = useState(false);
  const [linkStatus, setLinkStatus] = useState("");
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [preparedSource, setPreparedSource] = useState<PreparedSource | null>(
    null,
  );
  const [extractedText, setExtractedText] = useState("");
  const [isEditingExtractedText, setIsEditingExtractedText] = useState(false);
  const [sourceError, setSourceError] = useState("");
  const [sourceErrorDetails, setSourceErrorDetails] = useState<StageErrorDetails | undefined>();
  const [classroomBriefResult, setClassroomBriefResult] = useState<StageResult | null>(
    null,
  );
  const [decodeResult, setDecodeResult] = useState<StageResult | null>(
    null,
  );
  const [exhibitsResult, setExhibitsResult] = useState<StageResult | null>(
    null,
  );
  const [teamSplitResult, setTeamSplitResult] = useState<StageResult | null>(
    null,
  );
  const [solutionResults, setSolutionResults] = useState<
    Record<SolutionStageKey, StageResult | null>
  >(() => createEmptySolutionResults());
  const [, setSolutionLoading] = useState<
    Record<SolutionStageKey, boolean>
  >(() => createEmptySolutionLoading());
  const [, setSolutionErrors] = useState<Record<SolutionStageKey, string>>(
    () => createEmptySolutionErrors(),
  );
  const [, setSolutionErrorDetails] = useState<
    Record<SolutionStageKey, StageErrorDetails | undefined>
  >(() => createEmptySolutionErrorDetails());
  const [strategyUnlocked, setStrategyUnlocked] = useState(false);
  const [strategyUnlockMessage, setStrategyUnlockMessage] = useState("");
  const [classroomBriefError, setClassroomBriefError] = useState("");
  const [decodeError, setDecodeError] = useState("");
  const [exhibitsError, setExhibitsError] = useState("");
  const [teamSplitError, setTeamSplitError] = useState("");
  const [classroomBriefErrorDetails, setClassroomBriefErrorDetails] = useState<StageErrorDetails | undefined>();
  const [decodeErrorDetails, setDecodeErrorDetails] = useState<StageErrorDetails | undefined>();
  const [exhibitsErrorDetails, setExhibitsErrorDetails] = useState<StageErrorDetails | undefined>();
  const [teamSplitErrorDetails, setTeamSplitErrorDetails] = useState<StageErrorDetails | undefined>();

  const textLength = caseText.trim().length;
  const shortText = inputMode === "text" && textLength > 0 && textLength < 800;
  const visibleTeamMembers = useMemo(
    () => (workMode === "Team" ? teamMembers.slice(0, teamSize) : []),
    [teamMembers, teamSize, workMode],
  );

  const sourceSummary = useMemo(() => {
    if (preparedSource) return preparedSource.sourceName || preparedSource.preview.detectedTitle;
    if (inputMode === "pdf") return pdfFile?.name ?? "No PDF selected yet";
    if (inputMode === "text") return `${textLength.toLocaleString()} pasted characters`;
    return caseUrl || "No link entered yet";
  }, [caseUrl, inputMode, pdfFile?.name, preparedSource, textLength]);

  const config = useMemo(
    () => ({
      caseTitle,
      sourceInstructions,
      subject,
      purpose,
      requiredOutput,
      workMode,
      teamSize,
      teamMembers: visibleTeamMembers,
      deadline,
      analysisDepth,
      professorInstructions,
      slideLimit,
      evaluationCriteria,
      specificQuestions,
      knownConstraints,
      quickDecode,
      learningMode,
      classroomMode,
      competitionMode,
    }),
    [
      analysisDepth,
      caseTitle,
      classroomMode,
      competitionMode,
      deadline,
      evaluationCriteria,
      knownConstraints,
      learningMode,
      professorInstructions,
      purpose,
      quickDecode,
      requiredOutput,
      slideLimit,
      sourceInstructions,
      specificQuestions,
      subject,
      teamSize,
      visibleTeamMembers,
      workMode,
    ],
  );

  useEffect(() => {
    const saved = readSavedWorkspace();

    queueMicrotask(() => {
      setSavedWorkspace(saved);

      if (
        saved.preparedSource ||
        saved.classroomBriefResult ||
        saved.decodeResult ||
        saved.exhibitsResult ||
        saved.teamSplitResult
      ) {
        setPreparedSource(saved.preparedSource || null);
        setExtractedText(saved.extractedText || saved.preparedSource?.text || "");
        setClassroomBriefResult(saved.classroomBriefResult || null);
        setDecodeResult(saved.decodeResult || null);
        setExhibitsResult(saved.exhibitsResult || null);
        setTeamSplitResult(saved.teamSplitResult || null);
        setSolutionResults(createEmptySolutionResults());
        setStrategyUnlocked(false);
        setLearningMode(Boolean(saved.learningMode));
        setClassroomMode(saved.classroomMode !== false);
        setCompetitionMode(Boolean(saved.competitionMode));
        setSubmitted(Boolean(saved.preparedSource));
      }

      setSavedWorkspaceLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!savedWorkspaceLoaded) return;
    const snapshot = {
      preparedSource,
      extractedText,
      classroomBriefResult,
      decodeResult,
      exhibitsResult,
      teamSplitResult,
      solutionResults: createEmptySolutionResults(),
      strategyUnlocked: false,
      learningMode,
      classroomMode,
      competitionMode,
    };

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(snapshot),
    );
  }, [
    classroomBriefResult,
    classroomMode,
    competitionMode,
    decodeResult,
    exhibitsResult,
    extractedText,
    learningMode,
    preparedSource,
    savedWorkspaceLoaded,
    teamSplitResult,
  ]);

  const updateTeamSize = (size: number) => {
    const nextSize = Math.min(8, Math.max(2, size));
    setTeamSize(nextSize);
    setTeamMembers((current) =>
      Array.from({ length: nextSize }, (_, index) => current[index] ?? { name: "", strengths: "" }),
    );
  };

  const updateWorkMode = (mode: WorkMode) => {
    if (mode === workMode) return;

    setWorkMode(mode);
    setTeamSplitResult(null);
    setTeamSplitError("");
    setTeamSplitErrorDetails(undefined);
    setStrategyUnlockMessage("");
  };

  const updateTeamMember = (
    index: number,
    field: keyof TeamMember,
    value: string,
  ) => {
    setTeamMembers((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index ? { ...member, [field]: value } : member,
      ),
    );
  };

  const resetPreparedSource = () => {
    setPreparedSource(null);
    setExtractedText("");
    setSourceError("");
    setSourceErrorDetails(undefined);
    setClassroomBriefResult(null);
    setDecodeResult(null);
    setExhibitsResult(null);
    setTeamSplitResult(null);
    setSolutionResults(createEmptySolutionResults());
    setSolutionLoading(createEmptySolutionLoading());
    setSolutionErrors(createEmptySolutionErrors());
    setSolutionErrorDetails(createEmptySolutionErrorDetails());
    setClassroomBriefError("");
    setDecodeError("");
    setExhibitsError("");
    setTeamSplitError("");
    setClassroomBriefErrorDetails(undefined);
    setDecodeErrorDetails(undefined);
    setExhibitsErrorDetails(undefined);
    setTeamSplitErrorDetails(undefined);
    setStrategyUnlocked(false);
    setStrategyUnlockMessage("");
  };

  const validate = (requireFreshSource: boolean) => {
    const errors: string[] = [];

    if (requireFreshSource && inputMode === "pdf" && !pdfFile) {
      errors.push("Upload a PDF before starting the workspace.");
    }

    if (requireFreshSource && inputMode === "text" && !caseText.trim()) {
      errors.push("Paste case text before starting the workspace.");
    }

    if (requireFreshSource && shortText && !quickDecode) {
      errors.push("Add more case text or turn on Quick Decode Mode for a short source.");
    }

    if (requireFreshSource && inputMode === "link") {
      try {
        const url = new URL(caseUrl);

        if (!["http:", "https:"].includes(url.protocol)) {
          errors.push("Enter a valid public http or https case link.");
        }
      } catch {
        errors.push("Enter a valid public case link.");
      }
    }

    if (workMode === "Team" && (teamSize < 2 || teamSize > 8)) {
      errors.push("Team size must be between 2 and 8.");
    }

    if (slideLimit.trim()) {
      const parsedSlideLimit = Number(slideLimit);

      if (!Number.isInteger(parsedSlideLimit) || parsedSlideLimit <= 0 || parsedSlideLimit > 120) {
        errors.push("Slide limit should be a positive, reasonable number.");
      }
    }

    return errors;
  };

  const scrollToWorkspaceSection = (id: string) => {
    window.requestAnimationFrame(() => {
      const element = document.getElementById(id);

      if (!element) return;

      const top = element.getBoundingClientRect().top + window.scrollY - 96;

      window.scrollTo({
        top: Math.max(0, top),
        left: 0,
        behavior: "smooth",
      });
      window.requestAnimationFrame(() => {
        if (window.scrollX !== 0) window.scrollTo(0, window.scrollY);
      });
    });
  };

  const prepareSource = async (pdfOverride?: File | null, modeOverride?: InputMode) => {
    const mode = modeOverride ?? inputMode;

    setIsPreparingSource(true);
    setSourceError("");
    setSourceErrorDetails(undefined);
    setLinkStatus("");

    try {
      const response =
        mode === "pdf"
          ? await preparePdfSource(pdfOverride)
          : await fetch("/api/case-war-room/source", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                mode,
                text: mode === "text" ? caseText : "",
                url: mode === "link" ? caseUrl : "",
                titleHint: caseTitle,
              }),
            });

      const payload = (await response.json()) as {
        ok?: boolean;
        source?: PreparedSource;
        error?: string;
        errorDetails?: StageErrorDetails;
      };

      if (!response.ok || !payload.ok || !payload.source) {
        setSourceErrorDetails(payload.errorDetails);
        throw new Error(payload.error || "Source preparation failed. Please try again.");
      }

      setPreparedSource(payload.source);
      setExtractedText(payload.source.text);
      if (payload.source.preview.detectedSubject && subjects.includes(payload.source.preview.detectedSubject)) {
        setSubject(payload.source.preview.detectedSubject);
      }
      setIsEditingExtractedText(false);
      setSubmitted(true);
      setActiveStage(1);
      scrollToWorkspaceSection("case-war-room-outputs");

      if (mode === "link") {
        setLinkStatus(
          `Exact-link extraction succeeded. ${payload.source.preview.approximateWordCount.toLocaleString()} words are ready for case-only analysis.`,
        );
      }

      void runStage("classroomBrief", payload.source.text);

      return payload.source;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Source preparation failed. Please try again.";
      setSourceError(message);
      if (mode === "link") setLinkStatus(message);
      return null;
    } finally {
      setIsPreparingSource(false);
    }
  };

  const preparePdfSource = (pdfOverride?: File | null) => {
    const formData = new FormData();
    const file = pdfOverride ?? pdfFile;

    if (file) formData.append("pdf", file);
    formData.append("titleHint", caseTitle);

    return fetch("/api/case-war-room/source", {
      method: "POST",
      body: formData,
    });
  };

  const openTextFallback = () => {
    setInputMode("text");
    setSourceError("");
    setSourceErrorDetails(undefined);
    setFormErrors([]);
    scrollToWorkspaceSection("case-war-room-source");
  };

  const preparePastedRecovery = async () => {
    setInputMode("text");
    setFormErrors([]);

    if (!caseText.trim()) {
      setSourceError("Paste the readable case text to continue.");
      setSourceErrorDetails({
        code: "empty_input",
        message: "Paste the readable case text to continue.",
        nextAction: "Paste the case text, then prepare the pasted source.",
        retryable: false,
      });
      return null;
    }

    return prepareSource(null, "text");
  };

  const buildStageContext = (stage: StageKey) => {
    const context: Record<string, unknown> = {
      classroom_brief_output: classroomBriefResult?.data || "Not available in the provided case.",
      case_decode_output: decodeResult?.data || "Not available in the provided case.",
      exhibit_output: exhibitsResult?.data || "Not available in the provided case.",
      team_split_output: teamSplitResult?.data || "Not available in the provided case.",
    };

    if (stage !== "strategy") {
      context.strategy_builder_output =
        solutionResults.strategy?.data || "Not available in the provided case.";
    }

    if (["recommendation", "ppt", "reflection", "readinessScore"].includes(stage)) {
      context.evaluation_matrix_output =
        solutionResults.evaluation?.data || "Not available in the provided case.";
      context.risk_matrix_output =
        solutionResults.risks?.data || "Not available in the provided case.";
    }

    if (["ppt", "reflection", "readinessScore"].includes(stage)) {
      context.final_recommendation_output =
        solutionResults.recommendation?.data || "Not available in the provided case.";
    }

    if (stage === "readinessScore") {
      context.ppt_storyline_output =
        solutionResults.ppt?.data || "Not available in the provided case.";
      context.reflection_questions_output =
        solutionResults.reflection?.data || "Not available in the provided case.";
    }

    return context;
  };

  const runStage = async (stage: StageKey, sourceOverride?: string) => {
    const sourceText = (sourceOverride || extractedText || preparedSource?.text || "").trim();
    const solutionStage = isSolutionStageKey(stage);

    if (!sourceText) {
      const error = "Prepare a source before running this stage.";
      const details: StageErrorDetails = {
        code: "empty_input",
        message: error,
        nextAction: "Prepare a source preview, then rerun this stage.",
        retryable: false,
      };
      if (stage === "classroomBrief") setClassroomBriefError(error);
      if (stage === "decode") setDecodeError(error);
      if (stage === "exhibits") setExhibitsError(error);
      if (stage === "teamSplit") setTeamSplitError(error);
      if (stage === "classroomBrief") setClassroomBriefErrorDetails(details);
      if (stage === "decode") setDecodeErrorDetails(details);
      if (stage === "exhibits") setExhibitsErrorDetails(details);
      if (stage === "teamSplit") setTeamSplitErrorDetails(details);
      if (solutionStage) {
        setSolutionErrors((current) => ({ ...current, [stage]: error }));
        setSolutionErrorDetails((current) => ({ ...current, [stage]: details }));
      }
      return null;
    }

    if (solutionStage && learningMode) {
      const details: StageErrorDetails = {
        code: "learning_mode",
        message: LEARNING_MODE_STRATEGY_BLOCK,
        nextAction: "Stay in Classroom Mode for now. Strategy, recommendation, and PPT stages are reserved for the next product layer.",
        retryable: false,
      };

      setStrategyUnlockMessage(LEARNING_MODE_STRATEGY_BLOCK);
      setSolutionErrors((current) => ({
        ...current,
        [stage]: LEARNING_MODE_STRATEGY_BLOCK,
      }));
      setSolutionErrorDetails((current) => ({
        ...current,
        [stage]: details,
      }));
      return null;
    }

    const endpoint =
      solutionStage
        ? solutionStageMeta[stage].endpoint
        : stage === "classroomBrief"
          ? "/api/case-war-room/classroom-brief"
          : stage === "teamSplit"
          ? "/api/case-war-room/team-split"
          : `/api/case-war-room/${stage}`;
    const setLoading = (value: boolean) => {
      if (stage === "classroomBrief") setIsRunningClassroomBrief(value);
      if (stage === "decode") setIsRunningDecode(value);
      if (stage === "exhibits") setIsRunningExhibits(value);
      if (stage === "teamSplit") setIsRunningTeamSplit(value);
      if (solutionStage) {
        setSolutionLoading((current) => ({ ...current, [stage]: value }));
      }
    };
    const setError = (value: string) => {
      if (stage === "classroomBrief") setClassroomBriefError(value);
      if (stage === "decode") setDecodeError(value);
      if (stage === "exhibits") setExhibitsError(value);
      if (stage === "teamSplit") setTeamSplitError(value);
      if (solutionStage) {
        setSolutionErrors((current) => ({ ...current, [stage]: value }));
      }
    };
    const setErrorDetails = (value: StageErrorDetails | undefined) => {
      if (stage === "classroomBrief") setClassroomBriefErrorDetails(value);
      if (stage === "decode") setDecodeErrorDetails(value);
      if (stage === "exhibits") setExhibitsErrorDetails(value);
      if (stage === "teamSplit") setTeamSplitErrorDetails(value);
      if (solutionStage) {
        setSolutionErrorDetails((current) => ({ ...current, [stage]: value }));
      }
    };
    const setResult = (value: StageResult) => {
      if (stage === "classroomBrief") setClassroomBriefResult(value);
      if (stage === "decode") setDecodeResult(value);
      if (stage === "exhibits") setExhibitsResult(value);
      if (stage === "teamSplit") setTeamSplitResult(value);
      if (solutionStage) {
        setSolutionResults((current) => ({ ...current, [stage]: value }));
      }
    };

    setLoading(true);
    setError("");
    setErrorDetails(undefined);
    if (solutionStage) setStrategyUnlockMessage("");

    let responseErrorDetails: StageErrorDetails | undefined;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceText,
          config,
          context: buildStageContext(stage),
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        result?: unknown;
        error?: string;
        errorDetails?: StageErrorDetails;
        model?: string;
        usedFallback?: boolean;
        notices?: string[];
      };

      if (!response.ok || !payload.ok) {
        responseErrorDetails = payload.errorDetails;
        setErrorDetails(responseErrorDetails);
        throw new Error(payload.error || "Analysis failed. Please try again.");
      }

      const result: StageResult = {
        data: payload.result,
        model: payload.model,
        usedFallback: payload.usedFallback,
        notices: payload.notices || [],
        generatedAt: new Date().toISOString(),
      };

      setResult(result);
      return result;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Analysis failed. Please try again.");
      setErrorDetails(
        responseErrorDetails || {
          code: "network_failure",
          message: error instanceof Error ? error.message : "Analysis failed. Please try again.",
          nextAction: "Retry this stage. If it keeps failing, use manual decode mode for this section.",
          retryable: true,
        },
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async (source: PreparedSource) => {
    const sourceText = source.text;

    setSolutionResults(createEmptySolutionResults());
    setSolutionLoading(createEmptySolutionLoading());
    setSolutionErrors(createEmptySolutionErrors());
    setSolutionErrorDetails(createEmptySolutionErrorDetails());
    setClassroomBriefErrorDetails(undefined);
    setDecodeErrorDetails(undefined);
    setExhibitsErrorDetails(undefined);
    setTeamSplitErrorDetails(undefined);
    setStrategyUnlocked(false);
    setStrategyUnlockMessage("");

    await runStage("classroomBrief", sourceText);
    scrollToWorkspaceSection("case-war-room-outputs");
  };

  const runUnderstandingFlow = async () => {
    const needsSourcePreparation = !preparedSource;
    const errors = validate(needsSourcePreparation);
    setFormErrors(errors);

    if (errors.length > 0) return;

    if (needsSourcePreparation) {
      await prepareSource();
      return;
    }

    const reviewedSource: PreparedSource = {
      ...preparedSource,
      text: extractedText || preparedSource.text,
    };

    setSubmitted(true);
    setActiveStage(1);
    await runAnalysis(reviewedSource);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (sourceErrorDetails?.code === "pdf_extraction_failed" && inputMode === "pdf") {
      if (caseText.trim()) {
        await preparePastedRecovery();
      } else {
        openTextFallback();
      }
      return;
    }

    await runUnderstandingFlow();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;

    setPdfFile(nextFile);
    resetPreparedSource();
    setFormErrors([]);
    if (nextFile) void prepareSource(nextFile, "pdf");
  };

  const copyResult = async (result: StageResult | null) => {
    if (!result) return;
    await navigator.clipboard.writeText(resultToMarkdown("Case War Room Section", result.data));
  };

  const copyClassroomBrief = async () => {
    if (!classroomBriefResult) return;
    await navigator.clipboard.writeText(
      classroomBriefToMarkdown(
        caseTitle || preparedSource?.preview.detectedTitle || "Classroom Case Brief",
        classroomBriefResult,
      ),
    );
  };

  const handleContinueToStrategy = () => {
    setStrategyUnlocked(false);
    setActiveStage(5);
    setStrategyUnlockMessage(
      "Strategy Builder is locked for the next product layer. This version is focused on classroom briefing, evidence, discussion prep, and team split.",
    );
    scrollToWorkspaceSection("case-war-room-outputs");
  };

  const handleStageSelect = (index: number) => {
    const stage = stages[index];

    if (!stage) return;

    if (index >= 5) {
      setStrategyUnlocked(false);
      setActiveStage(index);
      setStrategyUnlockMessage(
        "Strategy, recommendation, and PPT stages are locked for the next product layer. Stay in Classroom Mode for now.",
      );
      scrollToWorkspaceSection("case-war-room-outputs");
      return;
    }

    setActiveStage(index);
    scrollToWorkspaceSection("case-war-room-outputs");
  };

  const activeStageLabel = stages[activeStage]?.label || "Source";
  const isRunningFoundation = isRunningClassroomBrief || isRunningDecode || isRunningExhibits || isRunningTeamSplit;
  const allStageResults = useMemo(
    () => [
      { key: "classroomBrief" as StageKey, title: "Classroom Case Brief", result: classroomBriefResult },
      { key: "exhibits" as StageKey, title: "Exhibits", result: exhibitsResult },
      { key: "decode" as StageKey, title: "Discussion Prep", result: decodeResult },
      { key: "teamSplit" as StageKey, title: "Team Split", result: teamSplitResult },
    ],
    [classroomBriefResult, decodeResult, exhibitsResult, teamSplitResult],
  );
  const generatedStageCount = allStageResults.filter((stage) => stage.result).length;
  const teamStageReady = workMode === "Individual" || Boolean(teamSplitResult);
  const understandingReady = Boolean(classroomBriefResult && exhibitsResult && decodeResult && teamStageReady) && !isRunningFoundation;
  const pdfExtractionFailed = sourceErrorDetails?.code === "pdf_extraction_failed";
  const workflowStages = stages;
  const hasSourceInput =
    inputMode === "pdf"
      ? Boolean(pdfFile)
      : inputMode === "text"
        ? Boolean(caseText.trim())
        : Boolean(caseUrl.trim());
  const primaryActionLabel = isPreparingSource
    ? "Preparing source..."
    : isRunningClassroomBrief
      ? "Building classroom brief..."
    : isRunningDecode || isRunningExhibits || isRunningTeamSplit
      ? "Generating study notes..."
      : pdfExtractionFailed
          ? caseText.trim()
            ? "Prepare pasted case text"
            : "Paste case text instead"
        : sourceError
          ? inputMode === "pdf"
            ? "Try PDF again"
            : "Retry source preparation"
        : preparedSource
          ? understandingReady
            ? "Regenerate classroom brief"
            : classroomBriefResult
              ? "Regenerate classroom brief"
              : "Generate classroom brief"
          : inputMode === "pdf"
            ? hasSourceInput
              ? "Prepare selected PDF"
              : "Choose a PDF to start"
            : "Prepare case brief";
  const hasSavedSnapshot = Boolean(
    savedWorkspace.preparedSource ||
      savedWorkspace.classroomBriefResult ||
      savedWorkspace.decodeResult ||
      savedWorkspace.exhibitsResult ||
      savedWorkspace.teamSplitResult,
  );
  const fullMarkdown = useMemo(() => {
    const lines = [
      `# ${caseTitle || preparedSource?.preview.detectedTitle || "Case War Room Output"}`,
      "",
      "Case-Only Mode: ON",
      "Assumptions are labeled.",
      "Verify numbers before submission.",
      "",
      "## Source Snapshot",
      `- Subject: ${subject}`,
      `- Purpose: ${purpose}`,
      `- Work mode: ${workMode}`,
      `- Source: ${sourceSummary}`,
      "",
    ];

    allStageResults.forEach((stage) => {
      if (!stage.result) return;

      lines.push(`## ${stage.title}`);
      if (stage.result.usedFallback) lines.push("- Generated using fallback model.");
      lines.push(resultToMarkdown(stage.title, stage.result.data));
      lines.push("");
    });

    return lines.join("\n");
  }, [allStageResults, caseTitle, preparedSource?.preview.detectedTitle, purpose, sourceSummary, subject, workMode]);
  const exportBaseName = slugifyFilename(caseTitle || preparedSource?.preview.detectedTitle || "case-war-room-output");

  const exportMarkdown = () => {
    if (generatedStageCount === 0) return;
    downloadTextFile(`${exportBaseName}.md`, fullMarkdown);
  };

  const exportClassroomBrief = () => {
    if (!classroomBriefResult) return;
    downloadTextFile(
      `${exportBaseName}-classroom-brief.md`,
      classroomBriefToMarkdown(caseTitle || preparedSource?.preview.detectedTitle || "Classroom Case Brief", classroomBriefResult),
    );
  };

  const exportClassroomBriefPdf = () => {
    if (!classroomBriefResult) return;

    const printWindow = window.open("", "_blank");

    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Classroom Case Brief</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Inter, Arial, sans-serif; margin: 0; color: #171817; line-height: 1.38; background: #ffffff; }
            .page { min-height: 100vh; padding: 34px 38px; page-break-after: always; }
            .page:last-child { page-break-after: auto; }
            .kicker { margin: 0 0 8px; font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #657067; }
            h1 { font-size: 28px; line-height: 1.05; margin: 0 0 20px; letter-spacing: 0; }
            h2 { margin: 16px 0 8px; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #4b534c; }
            p { margin: 0 0 8px; font-size: 11.5px; }
            .snapshot { border-left: 3px solid #70836f; padding: 10px 0 10px 14px; font-size: 13px; line-height: 1.48; color: #222620; }
            .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
            table { width: 100%; border-collapse: collapse; margin: 8px 0 12px; table-layout: fixed; }
            th { border-bottom: 1px solid #cfd5ce; padding: 7px 6px; text-align: left; font-size: 8.5px; letter-spacing: 0.1em; text-transform: uppercase; color: #5f675f; }
            td { border-bottom: 1px solid #e5e8e3; padding: 7px 6px; vertical-align: top; font-size: 9.5px; line-height: 1.36; }
            ul, ol { margin: 6px 0 12px 18px; padding: 0; }
            li { margin: 4px 0; font-size: 10.5px; line-height: 1.4; }
            @media print {
              .page { min-height: auto; }
            }
          </style>
        </head>
        <body>
          ${classroomBriefToPrintHtml(caseTitle || preparedSource?.preview.detectedTitle || "Classroom Case Brief", classroomBriefResult)}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const exportFullAnalysisPdf = () => {
    if (generatedStageCount === 0) return;

    const printWindow = window.open("", "_blank");

    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Case War Room Output</title>
          <style>
            body { font-family: Inter, Arial, sans-serif; margin: 42px; color: #141615; line-height: 1.55; }
            h1 { font-size: 30px; margin: 0 0 22px; letter-spacing: -0.02em; }
            h2 { border-top: 1px solid #d8d5cc; font-size: 20px; margin: 28px 0 12px; padding-top: 18px; }
            h3 { font-size: 15px; margin: 18px 0 8px; text-transform: uppercase; letter-spacing: 0.08em; color: #51564f; }
            p, li { font-size: 12.5px; }
            ul { margin: 8px 0 14px 20px; padding: 0; }
            li { margin: 4px 0; }
          </style>
        </head>
        <body>
          ${markdownToPrintHtml(fullMarkdown)}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const clearSavedWorkspace = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(PREVIOUS_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    setSavedWorkspace({});
    setSubmitted(false);
    setPreparedSource(null);
    setExtractedText("");
    setClassroomBriefResult(null);
    setDecodeResult(null);
    setExhibitsResult(null);
    setTeamSplitResult(null);
    setSolutionResults(createEmptySolutionResults());
    setSolutionErrors(createEmptySolutionErrors());
    setSolutionErrorDetails(createEmptySolutionErrorDetails());
    setClassroomBriefError("");
    setClassroomBriefErrorDetails(undefined);
    setStrategyUnlocked(false);
    setStrategyUnlockMessage("");
    setActiveStage(0);
  };

  const restoreSavedWorkspace = () => {
    if (!hasSavedSnapshot) return;

    setPreparedSource(savedWorkspace.preparedSource || null);
    setExtractedText(savedWorkspace.extractedText || savedWorkspace.preparedSource?.text || "");
    setClassroomBriefResult(savedWorkspace.classroomBriefResult || null);
    setDecodeResult(savedWorkspace.decodeResult || null);
    setExhibitsResult(savedWorkspace.exhibitsResult || null);
    setTeamSplitResult(savedWorkspace.teamSplitResult || null);
    setSolutionResults(createEmptySolutionResults());
    setStrategyUnlocked(false);
    setLearningMode(Boolean(savedWorkspace.learningMode));
    setClassroomMode(savedWorkspace.classroomMode !== false);
    setCompetitionMode(Boolean(savedWorkspace.competitionMode));
    setSubmitted(Boolean(savedWorkspace.preparedSource));
    setActiveStage(savedWorkspace.classroomBriefResult ? 1 : savedWorkspace.preparedSource ? 1 : 0);
  };

  return (
    <>
      <ToolRouteTracker tool={tool} />
      <main className="relative overflow-hidden bg-[var(--background)] pt-24 text-white md:pt-36">
        <div
          aria-hidden="true"
          className="premium-grid pointer-events-none absolute right-[-180px] top-20 h-[520px] w-[680px] opacity-[0.16] [mask-image:radial-gradient(circle,black,transparent_72%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-[520px] w-full bg-[radial-gradient(circle_at_22%_0%,rgba(232,203,148,0.18),transparent_34%),linear-gradient(180deg,rgba(255,253,248,0.1),transparent_54%)]"
        />

        <article className="relative z-10 w-full px-3.5 pb-16 md:px-9 md:pb-28 min-[1180px]:px-14">
          <Reveal>
            <Link
              href="/#ai-tools-lab"
              className="premium-link mb-4 inline-flex min-h-10 items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.07] px-3 py-2 text-[12px] font-medium text-white/76 shadow-[0_16px_44px_rgba(0,0,0,0.2)] backdrop-blur transition hover:bg-white/[0.11] focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <ArrowLeft className="h-4 w-4 text-white/48" />
              Back to MBA Tools Desk
            </Link>
          </Reveal>

          <Reveal>
            <section className="rounded-[8px] border border-white/10 bg-[#0c0f11] p-4 shadow-[0_32px_110px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.05)] md:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <SectionLabel>MBA Classroom Briefing Tool</SectionLabel>
                  <h1 className="mt-3 text-[clamp(1.9rem,7vw,4.35rem)] font-semibold leading-[0.96] tracking-[0] text-white">
                    Case War Room
                  </h1>
                  <p className="mt-4 max-w-[760px] text-[0.96rem] leading-[1.5] text-white/68 md:text-[1.12rem] md:leading-[1.58]">
                    Upload the case and get a crisp classroom brief first:
                    snapshot, decision, stakeholders, timeline, key facts,
                    and questions to carry into discussion.
                  </p>
                </div>
                <div className="grid gap-3 lg:min-w-[360px]">
                  <SourceBadge />
                  <div className="rounded-[8px] border border-amber-100/20 bg-amber-100/[0.08] p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/56">
                      Current next action
                    </p>
                    <p className="mt-1 text-[0.98rem] font-semibold text-amber-50">
                      {primaryActionLabel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 hidden gap-2 md:grid md:grid-cols-5">
                {[
                  ["01", "Source", preparedSource ? "Ready" : pdfFile || caseText || caseUrl ? "Selected" : "Start here", Boolean(preparedSource)],
                  ["02", "Classroom Brief", classroomBriefResult ? "Ready" : preparedSource ? "Next" : "Waiting", Boolean(classroomBriefResult)],
                  ["03", "Exhibits", exhibitsResult ? "Done" : classroomBriefResult ? "Optional" : "After brief", Boolean(exhibitsResult)],
                  ["04", "Discussion Prep", decodeResult ? "Done" : classroomBriefResult ? "Optional" : "After brief", Boolean(decodeResult)],
                  ["05", "Strategy", "Locked", false],
                ].map(([step, label, status, done]) => (
                  <div
                    key={String(label)}
                    className={`min-w-[148px] rounded-[8px] border p-3 md:min-w-0 ${
                      done
                        ? "border-emerald-200/22 bg-emerald-300/[0.08]"
                        : "border-white/10 bg-white/[0.035]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/36">
                        {String(step)}
                      </span>
                      {done ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-100/70" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-white/20" />
                      )}
                    </div>
                    <p className="mt-2 text-[0.86rem] font-semibold leading-[1.2] text-white/72">
                      {String(label)}
                    </p>
                    <p className="mt-1 text-[0.74rem] leading-[1.35] text-white/42">
                      {String(status)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.68fr)_minmax(360px,0.32fr)] lg:items-start">
            <section className="grid gap-6">
              <Reveal>
                <div id="case-war-room-source" className="scroll-mt-28 rounded-[8px] border border-white/10 bg-[#0c0f11] p-3 shadow-[0_32px_110px_rgba(0,0,0,0.28)] md:p-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    {inputModes.map((mode) => {
                      const Icon = mode.icon;
                      const isActive = inputMode === mode.id;

                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => {
                            setInputMode(mode.id);
                            setFormErrors([]);
                            setLinkStatus("");
                            resetPreparedSource();
                          }}
                          className={`group min-h-[158px] rounded-[8px] border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-amber-200/20 ${
                            isActive
                              ? "border-amber-200/36 bg-amber-200/[0.09] shadow-[0_20px_70px_rgba(232,203,148,0.08)]"
                              : "border-white/10 bg-[#121518] hover:border-white/18 hover:bg-[#171a1d]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="grid h-10 w-10 place-items-center rounded-[8px] border border-white/10 bg-white/[0.06] text-white/70">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="rounded-[8px] border border-white/10 bg-white/[0.055] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/46">
                              {mode.label}
                            </span>
                          </div>
                          <h2 className="mt-4 text-[1.05rem] font-semibold text-white/88">
                            {mode.title}
                          </h2>
                          <p className="mt-2 text-[0.86rem] leading-[1.52] text-white/48">
                            {mode.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 rounded-[8px] border border-white/10 bg-[#101214] p-4 md:p-5">
                    {inputMode === "pdf" && (
                      <div className="grid gap-4">
                        <div className="rounded-[8px] border border-dashed border-white/18 bg-white/[0.035] p-5">
                          <FieldLabel>PDF upload</FieldLabel>
                          <input
                            aria-label="PDF upload"
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={handleFileChange}
                            className="mt-3 block w-full cursor-pointer rounded-[8px] border border-white/10 bg-[#15181b] p-3 text-[0.92rem] text-white/72 file:mr-4 file:rounded-[7px] file:border-0 file:bg-[var(--surface)] file:px-3 file:py-2 file:text-[12px] file:font-semibold file:text-[#101214]"
                          />
                          <p className="mt-3 text-[0.82rem] text-white/42">
                            {pdfFile ? `Selected: ${pdfFile.name}` : "Upload a PDF and the workspace will try to extract case text for preview."}
                          </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <TextInput label="Optional case title" value={caseTitle} onChange={setCaseTitle} optional />
                          <TextInput label="Optional notes/instructions" value={sourceInstructions} onChange={setSourceInstructions} optional />
                        </div>
                      </div>
                    )}

                    {inputMode === "text" && (
                      <div className="grid gap-4">
                        <TextAreaField
                          label="Case text"
                          value={caseText}
                          onChange={(value) => {
                            setCaseText(value);
                            resetPreparedSource();
                          }}
                          rows={12}
                          placeholder="Paste the case brief, exhibits, problem statement, numbers, constraints, or instructions..."
                        />
                        <div className="flex flex-col gap-3 rounded-[8px] border border-white/10 bg-white/[0.035] p-3 md:flex-row md:items-center md:justify-between">
                          <p className="text-[0.84rem] text-white/52">
                            {textLength.toLocaleString()} characters. Full analysis is designed for 800+ characters.
                          </p>
                          <label className="flex cursor-pointer items-center gap-2 text-[0.84rem] font-medium text-white/70">
                            <input
                              aria-label="Quick Decode Mode"
                              type="checkbox"
                              checked={quickDecode}
                              onChange={(event) => setQuickDecode(event.target.checked)}
                              className="h-4 w-4 accent-amber-200"
                            />
                            Quick Decode Mode
                          </label>
                        </div>
                        {shortText && (
                          <div className="rounded-[8px] border border-amber-200/24 bg-amber-200/[0.08] p-3 text-[0.88rem] leading-[1.5] text-amber-100/82">
                            This looks too brief for a complete case analysis. Add more context, exhibits, numbers, or instructions for better results.
                          </div>
                        )}
                        <div className="grid gap-4 md:grid-cols-2">
                          <TextInput label="Optional case title" value={caseTitle} onChange={setCaseTitle} optional />
                          <TextInput label="Optional instructions" value={sourceInstructions} onChange={setSourceInstructions} optional />
                        </div>
                      </div>
                    )}

                    {inputMode === "link" && (
                      <div className="grid gap-4">
                        <TextInput
                          label="Case URL"
                          value={caseUrl}
                          onChange={(value) => {
                            setCaseUrl(value);
                            resetPreparedSource();
                          }}
                          placeholder="https://..."
                          type="url"
                        />
                        <TextAreaField
                          label="Optional instructions"
                          value={sourceInstructions}
                          onChange={setSourceInstructions}
                          rows={4}
                          optional
                          placeholder="Tell the workspace what to pay attention to in the linked case."
                        />
                        <div className="rounded-[8px] border border-white/10 bg-white/[0.035] p-3 text-[0.84rem] leading-[1.5] text-white/50">
                          This mode fetches only the exact URL you provide. It will not search the web around the topic.
                        </div>
                        {linkStatus && (
                          <div className={`rounded-[8px] border p-3 text-[0.88rem] leading-[1.5] ${
                            linkStatus.startsWith("Exact-link")
                              ? "border-emerald-200/22 bg-emerald-300/[0.08] text-emerald-100/78"
                              : "border-amber-200/24 bg-amber-200/[0.08] text-amber-100/82"
                          }`}>
                            {linkStatus}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>

              {(preparedSource || sourceError) && (
                <Reveal>
                  <section id="case-war-room-brief" className="scroll-mt-28 rounded-[8px] border border-white/10 bg-[#0c0f11] p-4 md:p-5">
                    <div className="mb-5">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/36">
                          Case brief
                        </p>
                        <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[0] text-white/90">
                          Understand the case before solving.
                        </h2>
                        <p className="mt-2 max-w-[620px] text-[0.88rem] leading-[1.5] text-white/48">
                          The workspace auto-detects subject, decision signals,
                          exhibits, and numbers from the uploaded material.
                        </p>
                      </div>
                    </div>

                    {sourceError && (
                      <div className="grid gap-3 rounded-[8px] border border-amber-200/24 bg-amber-200/[0.08] p-4">
                        <div className="flex gap-3">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-100/82" />
                          <div>
                            <p className="text-[0.95rem] font-semibold text-amber-50">{sourceError}</p>
                            {sourceErrorDetails?.nextAction && (
                              <p className="mt-2 text-[0.88rem] leading-[1.55] text-amber-100/76">
                                {sourceErrorDetails.nextAction}
                              </p>
                            )}
                          </div>
                        </div>
                        {pdfExtractionFailed && (
                          <PdfRecoveryPanel
                            caseText={caseText}
                            textLength={textLength}
                            isPreparing={isPreparingSource}
                            onTextChange={setCaseText}
                            onPrepare={() => void preparePastedRecovery()}
                            onOpenTextMode={openTextFallback}
                          />
                        )}
                        {!pdfExtractionFailed && sourceErrorDetails?.retryable && (
                          <button
                            type="button"
                            onClick={() => void prepareSource()}
                            className="inline-flex min-h-10 w-fit items-center gap-2 rounded-[8px] border border-amber-100/24 bg-amber-100/[0.1] px-3 text-[12px] font-semibold text-amber-50 transition hover:bg-amber-100/[0.16]"
                          >
                            <RefreshCw className="h-4 w-4" />
                            Retry source preparation
                          </button>
                        )}
                      </div>
                    )}

                    {preparedSource && (
                      <>
                        <CaseBriefSummary
                          source={preparedSource}
                          extractedText={extractedText}
                          isEditing={isEditingExtractedText}
                          onToggleEdit={() => setIsEditingExtractedText((current) => !current)}
                          onTextChange={setExtractedText}
                        />
                        <div className="mt-5 flex flex-col gap-4 rounded-[8px] border border-emerald-200/18 bg-emerald-300/[0.075] p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                          <p className="text-[1rem] font-semibold text-white/88">
                              Ready for the classroom brief?
                            </p>
                            <p className="mt-1 text-[0.84rem] leading-[1.5] text-white/50">
                              Generate a concise 1-2 minute study note before moving into exhibits or deeper discussion prep.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => void runUnderstandingFlow()}
                            disabled={isRunningFoundation || isPreparingSource}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-[var(--surface)] px-4 text-[13px] font-semibold text-[#101214] shadow-[0_18px_56px_rgba(232,203,148,0.14)] transition hover:bg-white disabled:cursor-wait disabled:opacity-54"
                          >
                            {classroomBriefResult ? "Regenerate classroom brief" : "Generate classroom brief"}
                            <WandSparkles className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </section>
                </Reveal>
              )}

              <Reveal>
                <details className="group rounded-[8px] border border-white/10 bg-[#0c0f11] p-4 md:p-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-5">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/36">
                        Optional setup
                      </p>
                      <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[0] text-white/90">
                        Refine the output only if needed.
                      </h2>
                      <p className="mt-2 max-w-[700px] text-[0.88rem] leading-[1.5] text-white/48">
                        Defaults are already set from the source. Open this if
                        you want to change purpose, deadline, team mode, slide
                        limit, or evaluation criteria.
                      </p>
                    </div>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] border border-white/10 bg-white/[0.045] text-white/50 transition group-open:rotate-180">
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </summary>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <SelectField label="Subject/topic" value={subject} onChange={setSubject} options={subjects} />
                    <SelectField label="Purpose" value={purpose} onChange={setPurpose} options={purposes} />
                    <SelectField label="Required output" value={requiredOutput} onChange={setRequiredOutput} options={outputTypes} />
                    <SelectField label="Deadline" value={deadline} onChange={setDeadline} options={deadlines} />
                    <SelectField label="Analysis depth" value={analysisDepth} onChange={setAnalysisDepth} options={analysisDepths} />
                    <div className="grid gap-2">
                      <FieldLabel>Work mode</FieldLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {(["Individual", "Team"] as WorkMode[]).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => updateWorkMode(mode)}
                            className={`min-h-12 rounded-[8px] border px-3 text-[0.92rem] font-semibold transition ${
                              workMode === mode
                                ? "border-amber-200/36 bg-amber-200/[0.1] text-amber-100"
                                : "border-white/10 bg-[#111416] text-white/58 hover:bg-[#15181b]"
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <FieldLabel>Classroom Mode</FieldLabel>
                      <button
                        type="button"
                        aria-pressed={classroomMode}
                        onClick={() => setClassroomMode((current) => !current)}
                        className={`min-h-12 rounded-[8px] border px-3 text-left text-[0.92rem] font-semibold transition ${
                          classroomMode
                            ? "border-amber-200/36 bg-amber-200/[0.1] text-amber-100"
                            : "border-white/10 bg-[#111416] text-white/58 hover:bg-[#15181b]"
                        }`}
                      >
                        {classroomMode ? "Classroom Mode ON" : "Classroom Mode OFF"}
                      </button>
                    </div>
                    <div className="grid gap-2">
                      <FieldLabel>Competition Mode</FieldLabel>
                      <button
                        type="button"
                        aria-pressed={competitionMode}
                        onClick={() => setCompetitionMode((current) => !current)}
                        className={`min-h-12 rounded-[8px] border px-3 text-left text-[0.92rem] font-semibold transition ${
                          competitionMode
                            ? "border-amber-200/36 bg-amber-200/[0.1] text-amber-100"
                            : "border-white/10 bg-[#111416] text-white/58 hover:bg-[#15181b]"
                        }`}
                      >
                        {competitionMode ? "Competition Mode ON" : "Competition Mode OFF"}
                      </button>
                    </div>
                  </div>

                  {workMode === "Team" && (
                    <div className="mt-5 rounded-[8px] border border-white/10 bg-[#111416] p-4">
                      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                        <div className="grid gap-2">
                          <FieldLabel>Number of members</FieldLabel>
                          <input
                            aria-label="Number of members"
                            type="number"
                            min={2}
                            max={8}
                            value={teamSize}
                            onChange={(event) => updateTeamSize(Number(event.target.value))}
                            className="min-h-12 rounded-[8px] border border-white/10 bg-[#15181b] px-3 text-white/82 outline-none focus:border-amber-200/38 focus:ring-2 focus:ring-amber-200/12"
                          />
                        </div>
                        <div className="grid gap-3">
                          {visibleTeamMembers.map((member, index) => (
                            <div key={index} className="grid gap-3 md:grid-cols-2">
                              <TextInput
                                label={`Member ${index + 1} name`}
                                value={member.name}
                                onChange={(value) => updateTeamMember(index, "name", value)}
                                optional
                              />
                              <TextInput
                                label="Strengths"
                                value={member.strengths}
                                onChange={(value) => updateTeamMember(index, "strengths", value)}
                                placeholder="Research, numbers, slides..."
                                optional
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <TextAreaField label="Professor/competition instructions" value={professorInstructions} onChange={setProfessorInstructions} rows={4} optional />
                    <TextAreaField label="Evaluation criteria" value={evaluationCriteria} onChange={setEvaluationCriteria} rows={4} optional />
                    <TextAreaField label="Specific questions given in the case" value={specificQuestions} onChange={setSpecificQuestions} rows={4} optional />
                    <TextAreaField label="Known constraints" value={knownConstraints} onChange={setKnownConstraints} rows={4} optional />
                    <TextInput label="Slide limit" value={slideLimit} onChange={setSlideLimit} placeholder="Example: 8" optional type="number" />
                  </div>
                </details>
              </Reveal>
            </section>

            <aside className="sticky top-24 grid gap-4 self-start">
              <Reveal>
                <section className="rounded-[8px] border border-white/10 bg-[#101214] p-4 shadow-[0_28px_100px_rgba(0,0,0,0.26)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/36">
                    Next step
                  </p>
                  <h2 className="mt-2 text-[1.3rem] font-semibold leading-[1.15] text-white/90">
                    {pdfExtractionFailed
                      ? "Paste text to continue."
                      : preparedSource
                        ? classroomBriefResult
                          ? "Classroom brief is ready."
                          : "Build the classroom brief."
                        : "Start with a source."}
                  </h2>
                  <p className="mt-2 text-[0.88rem] leading-[1.5] text-white/50">
                    {pdfExtractionFailed
                      ? "Automatic PDF reading hit a server parser issue. Pasted case text will use the same brief, decode, and strategy workflow."
                      : preparedSource
                      ? "Start with the concise classroom note. Exhibits, discussion prep, and team split stay available as follow-up tabs."
                      : "Upload a PDF, paste text, or add an exact link. The first output is a classroom-ready brief."}
                  </p>
                  <div className="mt-4 grid gap-3 text-[0.9rem] text-white/62">
                    <div className="flex items-start gap-3">
                      <ClipboardList className="mt-0.5 h-4 w-4 text-amber-100/76" />
                      <span>{preparedSource?.preview.detectedTitle || caseTitle || "No case prepared yet"}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Presentation className="mt-0.5 h-4 w-4 text-amber-100/76" />
                      <span>{subject} · {purpose}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="mt-0.5 h-4 w-4 text-amber-100/76" />
                      <span>{workMode === "Team" ? `${teamSize} member team` : "Individual work mode"}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Timer className="mt-0.5 h-4 w-4 text-amber-100/76" />
                      <span>{deadline} · {analysisDepth}</span>
                    </div>
                  </div>
                  <div className="mt-4 rounded-[8px] border border-white/10 bg-white/[0.035] p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/34">Source</p>
                    <p className="mt-2 break-words text-[0.86rem] leading-[1.45] text-white/62">{sourceSummary}</p>
                    {preparedSource && (
                      <p className="mt-2 text-[0.78rem] leading-[1.4] text-emerald-100/58">
                        Prepared · {preparedSource.preview.approximateWordCount.toLocaleString()} words
                      </p>
                    )}
                  </div>

                  {formErrors.length > 0 && (
                    <div className="mt-4 grid gap-2 rounded-[8px] border border-amber-200/24 bg-amber-200/[0.08] p-3">
                      {formErrors.map((error) => (
                        <div key={error} className="flex gap-2 text-[0.84rem] leading-[1.45] text-amber-100/84">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>{error}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={
                      isPreparingSource ||
                      isRunningClassroomBrief ||
                      isRunningDecode ||
                      isRunningExhibits ||
                      isRunningTeamSplit
                    }
                    className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[8px] border border-amber-100/24 bg-[var(--surface)] px-4 py-3 text-[13px] font-semibold text-[#101214] shadow-[0_22px_70px_rgba(232,203,148,0.13)] transition hover:bg-white disabled:cursor-wait disabled:opacity-62"
                  >
                    {primaryActionLabel}
                    {preparedSource ? <WandSparkles className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </button>
                  <p className="mt-3 text-[0.78rem] leading-[1.45] text-white/38">
                    Case-only mode stays on. Assumptions are labeled, and numbers should be verified before submission.
                  </p>
                  {preparedSource && understandingReady && !strategyUnlocked && !learningMode && (
                    <button
                      type="button"
                      onClick={handleContinueToStrategy}
                      className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-[12px] font-semibold text-white/70 transition hover:bg-white/[0.09]"
                    >
                      I have understood the case. Continue to Strategy Builder.
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </section>
              </Reveal>

              {(classroomBriefResult || savedWorkspace.classroomBriefResult) && (
              <Reveal>
                <section className="rounded-[8px] border border-white/10 bg-[#101214] p-4 shadow-[0_28px_100px_rgba(0,0,0,0.22)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/36">
                        Saved output
                      </p>
                      <p className="mt-2 text-[0.88rem] leading-[1.45] text-white/58">
                        {generatedStageCount > 0
                          ? `${generatedStageCount} generated section${generatedStageCount === 1 ? "" : "s"} ready.`
                          : "Generated sections will be saved here."}
                      </p>
                    </div>
                    <Save className="h-4 w-4 text-emerald-100/62" />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={copyClassroomBrief}
                      disabled={!classroomBriefResult}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-[12px] font-semibold text-white/66 transition hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-38"
                    >
                      <Copy className="h-4 w-4" />
                      Copy brief
                    </button>
                    <button
                      type="button"
                      onClick={exportClassroomBriefPdf}
                      disabled={!classroomBriefResult}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-[12px] font-semibold text-white/66 transition hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-38"
                    >
                      <FileDown className="h-4 w-4" />
                      Brief PDF
                    </button>
                    <button
                      type="button"
                      onClick={exportClassroomBrief}
                      disabled={!classroomBriefResult}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-[12px] font-semibold text-white/66 transition hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-38"
                    >
                      <Download className="h-4 w-4" />
                      Brief MD
                    </button>
                    <button
                      type="button"
                      onClick={exportMarkdown}
                      disabled={generatedStageCount === 0}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-[12px] font-semibold text-white/66 transition hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-38"
                    >
                      <Download className="h-4 w-4" />
                      Full MD
                    </button>
                    <button
                      type="button"
                      onClick={exportFullAnalysisPdf}
                      disabled={generatedStageCount === 0}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-[12px] font-semibold text-white/66 transition hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-38"
                    >
                      <FileDown className="h-4 w-4" />
                      Full PDF
                    </button>
                    <button
                      type="button"
                      onClick={restoreSavedWorkspace}
                      disabled={!hasSavedSnapshot}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-[12px] font-semibold text-white/66 transition hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-38"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restore
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={clearSavedWorkspace}
                    className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.035] px-3 text-[12px] font-semibold text-white/48 transition hover:bg-white/[0.07]"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear saved result
                  </button>
                </section>
              </Reveal>
              )}
            </aside>
          </form>

          {preparedSource && (
          <section className="mt-8 rounded-[8px] border border-white/10 bg-[#0c0f11] p-4 md:mt-10 md:p-5">
              <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/36">
                    Stage stepper
                  </p>
                  <h2 className="mt-2 text-[1.45rem] font-semibold text-white/90">
                    Understand first. Solve second.
                  </h2>
                </div>
                <p className="max-w-[440px] text-[0.86rem] leading-[1.5] text-white/46">
                  Classroom Mode starts with a concise brief. Deeper strategy, recommendation, and PPT stages stay locked.
                </p>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {workflowStages.map((stage, index) => {
                  const locked = index >= 5;
                  const active = activeStage === index;
                  const generated =
                    stage.key === "classroomBrief"
                      ? Boolean(classroomBriefResult)
                      : stage.key === "decode"
                      ? Boolean(decodeResult)
                      : stage.key === "exhibits"
                        ? Boolean(exhibitsResult)
                        : stage.key === "teamSplit"
                          ? Boolean(teamSplitResult)
                          : false;

                  return (
                    <button
                      key={stage.label}
                      type="button"
                      aria-disabled={locked}
                      onClick={() => handleStageSelect(index)}
                      className={`min-h-20 min-w-[128px] rounded-[8px] border p-2 text-left transition sm:min-w-[146px] ${
                        active
                          ? "border-amber-200/36 bg-amber-200/[0.1]"
                          : locked
                            ? "border-white/8 bg-white/[0.025] opacity-54"
                            : "border-white/10 bg-[#111416] hover:bg-[#171a1d]"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/36">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {locked ? (
                          <LockKeyhole className="h-3.5 w-3.5 text-white/28" />
                        ) : generated ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-100/62" />
                        ) : null}
                      </span>
                      <span className="mt-3 block text-[0.78rem] font-semibold leading-[1.25] text-white/68">
                        {stage.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 grid gap-5 rounded-[8px] border border-amber-200/22 bg-amber-200/[0.075] p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <h3 className="text-[1.2rem] font-semibold text-amber-50">
                    {understandingReady ? "Ready for strategy?" : "Brief first, deeper work second."}
                  </h3>
                  <p className="mt-2 max-w-[760px] text-[0.92rem] leading-[1.55] text-amber-50/66">
                    {understandingReady
                      ? "You’ve decoded the case, exhibits, constraints, and work split. Continue only when you’re ready to move from understanding to solving."
                      : "Prepare a source, generate the Classroom Case Brief, then open exhibits, discussion prep, or team split only if needed."}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {understandingReady ? (
                    <>
                      <button
                        type="button"
                        onClick={handleContinueToStrategy}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-[var(--surface)] px-4 text-[13px] font-semibold text-[#101214] shadow-[0_18px_56px_rgba(232,203,148,0.14)] transition hover:bg-white disabled:cursor-wait disabled:opacity-62"
                      >
                        I have understood the case. Continue to Strategy Builder.
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveStage(1);
                          setStrategyUnlockMessage("");
                        }}
                        className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-white/10 bg-white/[0.055] px-4 text-[13px] font-semibold text-white/72 transition hover:bg-white/[0.09]"
                      >
                        Stay in Classroom Mode
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={runUnderstandingFlow}
                      disabled={!preparedSource || isPreparingSource || isRunningDecode || isRunningExhibits || isRunningTeamSplit}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-[var(--surface)] px-4 text-[13px] font-semibold text-[#101214] shadow-[0_18px_56px_rgba(232,203,148,0.14)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-46"
                    >
                      Generate classroom brief
                      <WandSparkles className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              {strategyUnlockMessage && (
                <div className="mt-3 rounded-[8px] border border-amber-200/24 bg-amber-200/[0.08] p-3 text-[0.88rem] leading-[1.5] text-amber-100/82">
                  {strategyUnlockMessage}
                </div>
              )}
          </section>
          )}

          {preparedSource && (
          <section id="case-war-room-outputs" className="mt-6 scroll-mt-28 grid gap-4 lg:grid-cols-[0.35fr_0.65fr]">
              <div className="rounded-[8px] border border-white/10 bg-[#101214] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/36">
                  Active output
                </p>
                <h2 className="mt-3 text-[2rem] font-semibold leading-[1] text-white/90">
                  {activeStageLabel}
                </h2>
                <p className="mt-4 text-[0.9rem] leading-[1.58] text-white/52">
                  This workspace uses the prepared case source, saved outputs,
                  and your optional instructions.
                </p>
                <div className="mt-5 grid gap-2 text-[0.82rem] text-white/42">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-emerald-100/62" />
                    <span>{preparedSource ? "Source prepared" : "Source not prepared yet"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4 text-emerald-100/62" />
                    <span>Outputs save in this browser</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LockKeyhole className="h-4 w-4 text-emerald-100/62" />
                    <span>Strategy remains locked in this MVP</span>
                  </div>
                </div>
              </div>

              <div>
                {activeStage === 0 && (
                  <div className="rounded-[8px] border border-white/10 bg-[#101214] p-5">
                    {preparedSource ? (
                      <CaseBriefSummary
                        source={preparedSource}
                        extractedText={extractedText}
                        isEditing={isEditingExtractedText}
                        onToggleEdit={() => setIsEditingExtractedText((current) => !current)}
                        onTextChange={setExtractedText}
                      />
                    ) : (
                      <div className="rounded-[8px] border border-white/10 bg-[#15181b] p-4">
                        <p className="text-[0.95rem] leading-[1.58] text-white/62">
                          Prepare a PDF, pasted case, or exact link source to preview extracted evidence.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeStage === 1 && (
                  <ClassroomBriefCard
                    title="Classroom Case Brief"
                    result={classroomBriefResult}
                    loading={isRunningClassroomBrief}
                    error={classroomBriefError}
                    errorDetails={classroomBriefErrorDetails}
                    onCopy={copyClassroomBrief}
                    onRegenerate={() => runStage("classroomBrief")}
                  />
                )}

                {activeStage === 2 && (
                  <OutputCard
                    title="Exhibits"
                    result={exhibitsResult}
                    loading={isRunningExhibits}
                    error={exhibitsError}
                    errorDetails={exhibitsErrorDetails}
                    onCopy={() => copyResult(exhibitsResult)}
                    onRegenerate={() => runStage("exhibits")}
                  />
                )}

                {activeStage === 3 && (
                  <OutputCard
                    title="Discussion Prep"
                    result={decodeResult}
                    loading={isRunningDecode}
                    error={decodeError}
                    errorDetails={decodeErrorDetails}
                    onCopy={() => copyResult(decodeResult)}
                    onRegenerate={() => runStage("decode")}
                  />
                )}

                {activeStage === 4 && (
                  workMode === "Team" ? (
                    <OutputCard
                      title="Team Split"
                      result={teamSplitResult}
                      loading={isRunningTeamSplit}
                      error={teamSplitError}
                      errorDetails={teamSplitErrorDetails}
                      onCopy={() => copyResult(teamSplitResult)}
                      onRegenerate={() => runStage("teamSplit")}
                    />
                  ) : (
                    <div className="rounded-[8px] border border-white/10 bg-[#101214] p-5">
                      <p className="text-[0.95rem] leading-[1.58] text-white/62">
                        Team split is hidden because this is an individual case.
                      </p>
                    </div>
                  )
                )}

                {activeStage >= 5 && (
                  <div className="rounded-[8px] border border-white/10 bg-[#101214] p-5">
                    <LockKeyhole className="h-5 w-5 text-white/38" />
                    <h3 className="mt-4 text-[1.3rem] font-semibold text-white/88">
                      {activeStageLabel} is locked.
                    </h3>
                    <p className="mt-3 text-[0.95rem] leading-[1.58] text-white/56">
                      This classroom version focuses on the case brief, exhibits,
                      discussion prep, and optional team split. Strategy,
                      recommendation, and PPT storyline are intentionally kept
                      for a later product layer.
                    </p>
                  </div>
                )}

                {submitted && (
                  <div className="mt-4 rounded-[8px] border border-emerald-200/22 bg-emerald-300/[0.08] p-3 text-[0.88rem] leading-[1.5] text-emerald-100/76">
                    Workspace started. Source and configuration are valid for Case-Only Mode.
                  </div>
                )}
              </div>
          </section>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}
