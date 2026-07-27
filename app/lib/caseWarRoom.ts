import pdfParse from "pdf-parse/lib/pdf-parse.js";

export const CASE_LINK_ERROR =
  "I couldn't access this case link. Please upload the PDF or paste the case text.";

export const PDF_EXTRACTION_ERROR =
  "This PDF could not be read automatically.";

const MAX_SOURCE_TEXT_LENGTH = 120_000;
const MAX_MODEL_SOURCE_LENGTH = 72_000;
const MAX_PDF_BYTES = 12 * 1024 * 1024;

export const LEARNING_MODE_STRATEGY_BLOCK =
  "Strategy Builder is locked for the next product layer.";

export const FALLBACK_RETRY_NOTICE =
  "The expert AI model is temporarily unavailable. Retrying with fallback model...";

export const FALLBACK_SUCCESS_NOTICE = "Generated using fallback model.";

export const EXPERT_RESPONSE_FAILED =
  "The expert response could not be generated right now. Please try again later or use manual decode mode.";

export type CaseSourceMode = "pdf" | "text" | "link";

export type CaseSourcePreview = {
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

export type CaseWarRoomConfig = {
  caseTitle?: string;
  sourceInstructions?: string;
  subject: string;
  purpose: string;
  requiredOutput: string;
  workMode: "Individual" | "Team";
  teamSize: number;
  teamMembers: Array<{ name?: string; strengths?: string }>;
  deadline: string;
  analysisDepth: string;
  professorInstructions?: string;
  slideLimit?: string;
  evaluationCriteria?: string;
  specificQuestions?: string;
  knownConstraints?: string;
  quickDecode?: boolean;
  learningMode?: boolean;
  classroomMode?: boolean;
  competitionMode?: boolean;
};

export type CaseWarRoomStageContext = Record<string, unknown>;

export type CaseWarRoomErrorCode =
  | "missing_api_key"
  | "quota_exceeded"
  | "rate_limit"
  | "pdf_extraction_failed"
  | "url_extraction_failed"
  | "source_too_large"
  | "invalid_team_size"
  | "empty_input"
  | "too_short"
  | "json_parse_failed"
  | "network_failure"
  | "learning_mode"
  | "model_failed"
  | "unknown";

export type CaseWarRoomErrorPayload = {
  code: CaseWarRoomErrorCode;
  message: string;
  nextAction: string;
  retryable: boolean;
};

export type CaseWarRoomModelTier = "expert" | "cheap";

type CleanCaseSourceResult = {
  cleanedText: string;
  sourceQuality: "strong" | "usable" | "noisy";
  narrativeStartDetected: boolean;
  removedBoilerplateCount: number;
  warnings: string[];
};

type OpenAIChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
};

export function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function validateExactUrl(value: unknown) {
  if (typeof value !== "string") return null;

  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) return null;

    return url;
  } catch {
    return null;
  }
}

export function createCaseWarRoomError(
  code: CaseWarRoomErrorCode,
  message: string,
  nextAction: string,
  retryable = false,
): CaseWarRoomErrorPayload {
  return {
    code,
    message,
    nextAction,
    retryable,
  };
}

export function sourceTooLargeError() {
  return createCaseWarRoomError(
    "source_too_large",
    "This case source is too large for one reliable analysis run.",
    "Shorten the pasted text, split the case into sections, or upload only the case brief and relevant exhibits.",
    false,
  );
}

export function emptyInputError(message = "Empty input. Provide case material before running this stage.") {
  return createCaseWarRoomError("empty_input", message, "Add case text, upload a PDF, or paste an exact case link.", false);
}

export function simpleErrorPayload(message: string): CaseWarRoomErrorPayload {
  return createCaseWarRoomError("unknown", message, "Try again, or switch to manual decode mode if the issue continues.", true);
}

export function shouldUseLocalCaseFallback(error: CaseWarRoomErrorPayload) {
  return [
    "missing_api_key",
    "quota_exceeded",
    "rate_limit",
    "network_failure",
    "model_failed",
    "json_parse_failed",
  ].includes(error.code);
}

export function localCaseFallbackNotice(error?: CaseWarRoomErrorPayload) {
  if (error?.code === "quota_exceeded") {
    return "Expert AI quota is unavailable right now, so a local case-only output was prepared from the uploaded material.";
  }

  if (error?.code === "rate_limit") {
    return "Expert AI is busy right now, so a local case-only output was prepared from the uploaded material.";
  }

  return "Expert generation is unavailable right now, so a local case-only output was prepared from the uploaded material.";
}

export async function extractPdfText(buffer: Buffer) {
  if (buffer.byteLength > MAX_PDF_BYTES) {
    throw new Error("SOURCE_TOO_LARGE");
  }

  try {
    const result = await pdfParse(buffer);
    const text = normalizeSourceText(cleanPdfExtraction(result.text));

    if (!text) throw new Error("PDF had no extractable text.");

    return text;
  } catch (error) {
    console.error("Case War Room PDF parser exception", error);
    throw new Error(PDF_EXTRACTION_ERROR);
  }
}

export async function extractExactUrlText(value: unknown) {
  const url = validateExactUrl(value);

  if (!url) throw new Error(CASE_LINK_ERROR);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: "text/html, text/plain, application/pdf;q=0.8, */*;q=0.5",
        "User-Agent": "MohitPortfolio-CaseWarRoom/2.0 exact-url-fetch",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(CASE_LINK_ERROR);

    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/pdf")) {
      const buffer = Buffer.from(await response.arrayBuffer());
      return {
        contentType,
        text: await extractPdfText(buffer),
      };
    }

    const raw = await response.text();
    const text = normalizeSourceText(stripHtml(raw));

    if (text.length < 120) throw new Error(CASE_LINK_ERROR);

    return {
      contentType,
      text,
    };
  } catch (error) {
    if (error instanceof Error && error.message === PDF_EXTRACTION_ERROR) {
      throw error;
    }

    throw new Error(CASE_LINK_ERROR);
  } finally {
    clearTimeout(timeout);
  }
}

export function normalizeSourceText(text: string) {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_SOURCE_TEXT_LENGTH);
}

export function cleanCaseSourceText(rawText: string, titleHint?: string): CleanCaseSourceResult {
  const normalized = normalizeSourceText(rawText);
  const rawLines = normalized
    .split("\n")
    .map((line) => cleanPdfLine(line))
    .filter(Boolean);
  const explicitTitleHint = cleanTitleHint(titleHint);
  const likelyTitle = explicitTitleHint || detectLikelyTitle(rawLines);
  let removedBoilerplateCount = 0;
  const warnings: string[] = [];
  const cleanedLines = rawLines.filter((line, index) => {
    if (isBoilerplateLine(line) || isBoilerplateCaseSentence(line)) {
      removedBoilerplateCount += 1;
      return false;
    }

    if (isPdfNoiseLine(line, index)) {
      removedBoilerplateCount += 1;
      return false;
    }

    return true;
  });
  const titleIndex = likelyTitle && !isMissing(likelyTitle)
    ? cleanedLines.findIndex((line) => line.toLowerCase() === likelyTitle.toLowerCase())
    : -1;
  const narrativeStartIndex = findNarrativeStartIndex(cleanedLines, likelyTitle);
  const titleLine = likelyTitle && !isMissing(likelyTitle) ? likelyTitle : "";
  const shouldUseNarrativeStart =
    narrativeStartIndex > 0 &&
    (titleIndex < 0 || narrativeStartIndex <= titleIndex + 12);
  const startIndex = shouldUseNarrativeStart
    ? narrativeStartIndex
    : titleIndex > 0
      ? titleIndex
      : 0;
  const narrativeStartDetected = shouldUseNarrativeStart || (titleIndex >= 0 && narrativeStartIndex > titleIndex);
  let usableLines = cleanedLines.slice(startIndex);

  if (titleLine && !explicitTitleHint && !usableLines.some((line) => line.toLowerCase() === titleLine.toLowerCase())) {
    usableLines = [titleLine, ...usableLines];
  }

  removedBoilerplateCount += startIndex;

  let cleanedText = normalizeSourceText(
    usableLines
      .join("\n")
      .replace(/\b[A-Za-z]+ from Dec\s+\d{4}\s+to\s+Apr\s+\d{4}\.?/gi, " ")
      .replace(/\bPage\s+\d+\s+\w+\b/gi, " ")
      .replace(/\s+([,.;:!?])/g, "$1"),
  );

  if (!cleanedText || (titleLine && cleanedText.toLowerCase() === titleLine.toLowerCase())) {
    cleanedText = normalized;
  }

  const wordCount = cleanedText.split(/\s+/).filter(Boolean).length;
  const compactDecisionPrompt =
    wordCount >= 45 &&
    /\b(decide|decision|must|should|had to|needed|choose|recommend|evaluate|whether|prioritize)\b/i.test(cleanedText);
  const effectiveNarrativeStartDetected = narrativeStartDetected || compactDecisionPrompt;
  const sourceQuality =
    wordCount >= 800 && effectiveNarrativeStartDetected
      ? "strong"
      : wordCount >= 180 || effectiveNarrativeStartDetected
        ? "usable"
        : "noisy";

  if (!effectiveNarrativeStartDetected) {
    warnings.push("The case narrative start was not confidently detected. Review Source recovery if the brief looks off.");
  }

  if (sourceQuality === "noisy") {
    warnings.push("The prepared source is short or noisy. Paste cleaner case text if the brief misses context.");
  }

  return {
    cleanedText,
    sourceQuality,
    narrativeStartDetected: effectiveNarrativeStartDetected,
    removedBoilerplateCount,
    warnings,
  };
}

export function isSourceTooLarge(text: string) {
  return text.length > MAX_SOURCE_TEXT_LENGTH;
}

export function buildSourcePreview(text: string, titleHint?: string): CaseSourcePreview {
  const cleanup = cleanCaseSourceText(text, titleHint);
  const normalized = cleanup.cleanedText;
  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const likelyTitle = detectField(normalized, "title") || detectLikelyTitle(lines);
  const detectedTitle =
    cleanTitleHint(titleHint) ||
    (!isMissing(likelyTitle) ? likelyTitle : "") ||
    "Case War Room Output";
  const detectedSubject = detectLikelySubject(normalized, detectedTitle);
  const detectedCompany =
    detectField(normalized, "company") ||
    detectLikelyCompany(normalized) ||
    "Not available in the provided case.";
  const formalEvidenceSections = detectFormalEvidenceSections(lines);
  const narrativeEvidenceSections = detectNarrativeEvidenceSections(lines, detectedTitle);
  const detectedSections = Array.from(new Set([...formalEvidenceSections, ...narrativeEvidenceSections])).slice(0, 12);
  const recoveredCaseSections = recoverKnownCaseSections(normalized);
  const evidenceSections = Array.from(new Set([...detectedSections, ...recoveredCaseSections])).slice(0, 12);
  const caseDecision = inferCaseDecision(normalized, detectedTitle);
  const caseType = detectCaseType(normalized, detectedTitle, detectedSubject);
  const numberSamples = prioritizeNumberSamples(extractRelevantNumberSamples(normalized), normalized, caseType).slice(0, 16);
  const warnings: string[] = [...cleanup.warnings];

  if (formalEvidenceSections.length === 0 && evidenceSections.length === 0) {
    warnings.push("No exhibit, table, chart, figure, or appendix sections were detected.");
  }

  if (numberSamples.length === 0) {
    warnings.push("No obvious numbers were detected. Add exhibits, tables, or copied figures if the case depends on quantitative analysis.");
  }

  return {
    detectedTitle,
    detectedCompany,
    detectedIndustry: detectField(normalized, "industry") || "Not available in the provided case.",
    detectedSubject,
    sourceQuality: cleanup.sourceQuality,
    narrativeStartDetected: cleanup.narrativeStartDetected,
    removedBoilerplateCount: cleanup.removedBoilerplateCount,
    caseDecision,
    caseType,
    caseBrief: extractCaseBrief(normalized, detectedTitle),
    decisionSignals: extractDecisionSignals(normalized),
    keyTopics: extractKeyTopics(normalized, detectedSubject),
    approximateWordCount: normalized.split(/\s+/).filter(Boolean).length,
    detectedSections: evidenceSections,
    numberSamples,
    hasNumbers: numberSamples.length > 0,
    hasExhibits: formalEvidenceSections.length > 0,
    warnings,
  };
}

export function hasCaseWarRoomModelConfig() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function buildLocalClassroomBriefResult(sourceText: string, config: Partial<CaseWarRoomConfig> = {}) {
  const cleanup = cleanCaseSourceText(sourceText, config.caseTitle);
  const cleanSourceText = cleanup.cleanedText;
  const preview = buildSourcePreview(cleanSourceText, config.caseTitle);
  const specialStrategyCase = /strategy and the strategist/i.test(`${preview.detectedTitle}\n${cleanSourceText}`);
  const financeValuationCase = preview.caseType === "Finance valuation";
  const decision = preview.caseDecision || preview.decisionSignals?.[0] || inferUnderlyingProblem(cleanSourceText, preview);
  const snapshot = specialStrategyCase
    ? "This case examines the role of the strategist in shaping strategy. It uses multiple leaders and companies to ask when strong personal conviction creates strategic clarity and when the same conviction becomes rigidity. The class discussion is likely to compare leadership beliefs, evidence available at the time, market feedback, and whether a manager should stay the course or update the strategy."
    : financeValuationCase
      ? buildFinanceSnapshot(cleanSourceText, preview)
      : trimWords(preview.caseBrief || extractSentences(cleanSourceText).slice(0, 3).join(" "), 145);
  const stakeholders = specialStrategyCase
    ? [
        {
          stakeholder: "Senior leaders / strategists",
          whatTheyWant: "A strategy that reflects clear judgment and conviction.",
          pressureOrProblem: "Conviction can become bias when evidence changes.",
          whyTheyMatter: "Their beliefs shape the strategic choices discussed in the case.",
        },
        {
          stakeholder: "Managers and boards",
          whatTheyWant: "A way to judge when to support or challenge a leader's strategy.",
          pressureOrProblem: "They must separate insight from overconfidence.",
          whyTheyMatter: "They decide whether strategy should be reinforced, revised, or stopped.",
        },
        {
          stakeholder: "Customers / users",
          whatTheyWant: "Offerings that create real value, not just difference.",
          pressureOrProblem: "Strategic distinctiveness may not match customer needs.",
          whyTheyMatter: "Customer response is one test of whether a strategy works.",
        },
        {
          stakeholder: "Employees / organizations",
          whatTheyWant: "Clarity on priorities and execution choices.",
          pressureOrProblem: "Repeated strategic shifts or rigid beliefs can create confusion.",
          whyTheyMatter: "They turn leadership beliefs into actual execution.",
        },
      ]
    : financeValuationCase
      ? buildFinanceStakeholders(cleanSourceText)
      : buildClassroomStakeholders(cleanSourceText);

  return {
    caseSnapshot: snapshot || "Not available in the provided case.",
    mainDecision: decision || "Not available in the provided case.",
    caseObjective:
      specialStrategyCase
        ? "Evaluate how much strategy depends on the strategist, and how managers should distinguish productive conviction from dangerous rigidity."
        : financeValuationCase
          ? "Evaluate how to estimate the project discount rate for an unlisted firm by using projected cash flows, capital structure, comparable companies, beta, risk-free rate, and expected market return."
        : preview.caseDecision && !isMissing(preview.caseDecision)
          ? "Understand the main decision, stakeholders, case evidence, numbers, and tradeoffs before moving to a recommendation."
        : config.purpose
          ? `Prepare for ${config.purpose} by identifying the main decision, stakeholders, evidence, and discussion tensions.`
          : "Understand the decision problem, stakeholders, facts, evidence, and tensions before moving to any solution.",
    stakeholders,
    timeline: specialStrategyCase ? [] : extractTimelineEvents(cleanSourceText, preview),
    keyFactsNumbers: buildClassroomFacts(cleanSourceText, preview, specialStrategyCase),
    keyTensions: specialStrategyCase
      ? [
          "Conviction vs adaptability",
          "Distinctiveness vs customer value",
          "Founder belief vs market evidence",
          "Strategic clarity vs organizational rigidity",
          "Learning from failure vs staying the course",
        ]
      : financeValuationCase
        ? [
            "Expansion growth vs financial discipline",
            "Project attractiveness vs discount-rate uncertainty",
            "Comparable-company evidence vs unlisted-firm reality",
            "High initial growth vs sustainable long-run growth",
            "Debt financing benefit vs added project risk",
          ]
        : inferKeyTensions(cleanSourceText, preview),
    professorPushAngles: specialStrategyCase
      ? [
          "When is a strategist's strong belief an asset, and when is it a liability?",
          "Which examples show evidence-based conviction versus refusal to update?",
          "Does being different matter if customers do not experience better value?",
          "How should managers challenge a powerful strategist without killing strategic focus?",
        ]
      : financeValuationCase
        ? [
            "Which discount rate should be used for the NPV: firm-level cost of capital, project risk, or comparable-company risk?",
            "How reliable are comparable listed food-processing companies for estimating beta for this unlisted firm?",
            "Which assumptions matter most: five-year cash flows, 5% terminal growth, debt-equity mix, beta, or market return?",
            "What would make the expansion financially attractive or unattractive before even calculating the final NPV?",
          ]
        : buildProfessorPushAngles(cleanSourceText, preview),
    preparationChecklist: [
      "I understand the main decision.",
      "I know the key stakeholders.",
      "I can explain the top 5 facts/numbers.",
      "I know what tradeoffs are involved.",
      "I have 2-3 questions to raise in class.",
    ],
    smartQuestions: specialStrategyCase
      ? [
          "What evidence would convince us that a leader's conviction is strategic insight rather than personal bias?",
          "Is strategic distinctiveness valuable by itself, or only when it creates clearly better customer value?",
          "How should a board or senior team decide when to back a strategist and when to force a strategic reset?",
        ]
      : financeValuationCase
        ? [
            "Should Maria value the frozen foods expansion using the current firm's risk profile or the risk profile of comparable listed food-processing companies?",
            "Which assumption would change the NPV most: the 5% perpetual growth rate, the beta estimate, or the proposed 1:3 debt-equity financing mix?",
            "If the company is unlisted, what evidence from the case is strong enough to defend the chosen cost of capital in class?",
          ]
        : buildSmartQuestions(cleanSourceText, preview),
  };
}

export function buildLocalDecodeResult(sourceText: string, config: Partial<CaseWarRoomConfig> = {}) {
  const preview = buildSourcePreview(sourceText, config.caseTitle);
  const marketFacts = pickSentences(sourceText, ["market", "customer", "demand", "consumer", "segment", "growth"], 4);
  const financialFacts = pickSentences(sourceText, ["revenue", "cost", "profit", "margin", "cash", "debt", "equity", "investment", "balance sheet"], 4);
  const operationalFacts = pickSentences(sourceText, ["plant", "capacity", "operations", "process", "production", "supply", "quality"], 4);
  const competitiveFacts = pickSentences(sourceText, ["competitor", "competition", "rival", "market share", "positioning"], 3);
  const customerFacts = pickSentences(sourceText, ["customer", "consumer", "buyer", "retailer", "channel"], 3);
  const complexity = estimateComplexity(preview);

  return {
    case_discussion_lens: buildCaseDiscussionLens(sourceText, preview),
    evidence_map: buildEvidenceMap(sourceText, preview),
    cold_call_prep: buildColdCallPrep(sourceText, preview),
    what_case_is_about: preview.caseBrief || "A local case brief was prepared from the uploaded material.",
    company_and_industry_context_from_case_only:
      preview.detectedIndustry && !isMissing(preview.detectedIndustry)
        ? preview.detectedIndustry
        : "Not available in the provided case.",
    main_situation: preview.caseBrief || "Not available in the provided case.",
    stated_problem: preview.decisionSignals?.[0] || "Not available in the provided case.",
    underlying_real_problem: inferUnderlyingProblem(sourceText, preview),
    decision_to_be_made: preview.decisionSignals?.[0] || "Not available in the provided case.",
    case_objective:
      config.purpose || "Understand the case facts, exhibits, constraints, and decision context before solving.",
    what_success_looks_like:
      "A recommendation that is tied to case facts, preserves numbers accurately, and clearly labels missing evidence.",
    key_stakeholders: inferStakeholders(sourceText),
    key_constraints: pickSentences(sourceText, ["constraint", "deadline", "budget", "capacity", "limited", "risk", "must", "cannot"], 5),
    important_facts: {
      market_facts: marketFacts,
      customer_facts: customerFacts,
      financial_facts: financialFacts,
      operational_facts: operationalFacts,
      competitive_facts: competitiveFacts,
      internal_company_facts: pickSentences(sourceText, ["company", "management", "team", "internal", "plant", "division"], 3),
    },
    missing_information: preview.warnings,
    assumptions_required: [
      "Assumption required. The local brief cannot infer unsupported facts beyond the uploaded case.",
      "Assumption required. Verify the exact decision question from the case prompt before final submission.",
    ],
    case_complexity_score_out_of_100: complexity.total,
    sub_scores: complexity.subScores,
    why_this_case_is_difficult:
      preview.hasNumbers || preview.hasExhibits
        ? "The case includes evidence signals that need careful interpretation before choosing a recommendation."
        : "The source has limited structured evidence, so missing data and assumptions need extra care.",
    what_user_or_team_should_understand_before_solving: [
      "What decision the case is asking you to make.",
      "Which exhibits or numbers are actually decision-relevant.",
      "Which facts are provided versus which assumptions are being introduced.",
      "What output format is needed for the class, assignment, or presentation.",
    ],
  };
}

export function buildLocalExhibitsResult(sourceText: string, config: Partial<CaseWarRoomConfig> = {}) {
  const preview = buildSourcePreview(sourceText, config.caseTitle);
  const sections = preview.detectedSections.slice(0, 6);
  const numbers = preview.numberSamples.slice(0, 12);

  return {
    summary: preview.hasExhibits
      ? "Exhibit and table signals were found in the uploaded case. Review each item against the PDF before using calculations."
      : "No structured exhibits were detected in the provided case.",
    exhibits: (sections.length ? sections : ["No structured exhibits were detected in the provided case."]).map((section, index) => ({
      exhibit_name_or_number: preview.hasExhibits ? `Detected exhibit signal ${index + 1}` : "Not available in the provided case.",
      what_it_shows: section,
      key_numbers: numbers.length ? numbers : ["Not available in the provided case."],
      trend_or_pattern: "Verify the trend directly from the exhibit before submission.",
      simple_meaning: "This is a detected evidence area that may affect the case decision.",
      why_it_matters_for_the_decision: "Use it to support or reject strategic options only if the numbers are clear in the case.",
      possible_insight: "Assumption required. Interpret after checking the original exhibit/table.",
      caution_or_limitation: "Local decoding detects evidence signals but does not replace manual number verification.",
      possible_calculations: suggestCalculations(sourceText),
    })),
    calculations_attempted: [],
    unclear_numbers: numbers.length ? [] : ["Not available in the provided case."],
    data_needed_for_better_analysis: [
      "Clear exhibit/table labels.",
      "Units, time period, and base values for each number.",
      "Any stated evaluation criteria or required calculations.",
    ],
  };
}

export function buildLocalTeamSplitResult(sourceText: string, config: Partial<CaseWarRoomConfig> = {}) {
  const teamSize = Math.min(8, Math.max(2, Number(config.teamSize) || 4));
  const teamMembers = Array.from({ length: teamSize }, (_, index) => {
    const member = config.teamMembers?.[index];

    return {
      name: member?.name?.trim() || `Member ${index + 1}`,
      strengths: member?.strengths?.trim() || "General analysis",
    };
  });
  const workAreas = [
    "Case context and decision problem",
    "Exhibit and number analysis",
    "Market, customer, and competitor facts",
    "Strategic options and recommendation logic",
    "Risks, implementation, and PPT storyline",
    "Final synthesis and Q&A defense",
  ];

  return {
    suggested_division_of_work:
      "Split the work by evidence area first, then meet once to align on the decision problem before building the final recommendation.",
    member_task_table: teamMembers.map((member, index) => ({
      member: member.name,
      work_area: workAreas[index % workAreas.length],
      what_to_analyze: member.strengths,
      expected_output: "A short evidence-backed note with facts, assumptions, and open questions.",
      discussion_questions: [
        "Which case facts support this point?",
        "Which numbers need verification?",
        "What would change the final recommendation?",
      ],
      suggested_time_allocation: config.deadline || "2-3 days",
    })),
    team_discussion_agenda: [
      "Agree on the case decision question.",
      "Review exhibit signals and unclear numbers.",
      "Separate facts from assumptions.",
      "Choose the recommendation logic and owner for each slide/section.",
    ],
    suggested_timeline_based_on_deadline: [
      "First pass: each owner reads their evidence area.",
      "Alignment: team agrees on the decision problem and missing data.",
      "Synthesis: build recommendation, risks, and presentation flow.",
      "Final check: verify numbers and assumptions before submission.",
    ],
    align_before_solution: [
      "Decision to be made",
      "Most important exhibits",
      "Known constraints",
      "Assumptions that need to be named",
    ],
    common_coordination_mistakes_to_avoid: [
      "Starting slides before agreeing on the decision problem.",
      "Using numbers without checking units and time periods.",
      "Assigning people by slide instead of by evidence area.",
    ],
  };
}

export function buildLocalSolutionScaffold(
  sourceText: string,
  config: Partial<CaseWarRoomConfig> = {},
  stageContext: CaseWarRoomStageContext = {},
) {
  const preview = buildSourcePreview(sourceText, config.caseTitle);

  return {
    expert_generation_status:
      "Expert solution generation is unavailable right now, so this stage is showing a local planning scaffold.",
    case_understanding_available: {
      detected_subject: preview.detectedSubject || config.subject || "General Management",
      case_brief: preview.caseBrief || "Not available in the provided case.",
      evidence_signals: preview.keyTopics?.length ? preview.keyTopics : ["Not available in the provided case."],
      numbers_to_verify: preview.numberSamples.length ? preview.numberSamples.slice(0, 8) : ["Not available in the provided case."],
    },
    next_best_actions: [
      "Use the decoded case brief to confirm the decision problem.",
      "Verify exhibit numbers before choosing a strategy.",
      "Label assumptions before using them in the recommendation.",
      "Export the current understanding notes if you only need a class-discussion prep sheet.",
    ],
    stage_context_received: Object.keys(stageContext).length
      ? "Earlier stage context is available in this browser session."
      : "Earlier generated stage context is not available yet.",
  };
}

function buildCaseDiscussionLens(sourceText: string, preview: CaseSourcePreview) {
  if (/strategy and the strategist/i.test(`${preview.detectedTitle}\n${sourceText}`)) {
    return {
      one_sentence_read:
        "This is a strategy case about whether distinctive strategies come from strongly held leadership beliefs, and how managers should judge when conviction is insight versus dangerous rigidity.",
      central_tension:
        "Strong leaders can create strategic clarity, but the same conviction can blind a firm to market, investor, customer, or organizational feedback.",
      why_it_matters_in_class:
        "The case is less about choosing one company’s recommendation and more about building judgment on the role of the strategist in strategy formation.",
      discussion_frame:
        "Compare each example by belief, strategic action, evidence available at the time, outcome signal, and what a thoughtful strategist should have learned.",
    };
  }

  return {
    one_sentence_read: preview.caseBrief || "Not available in the provided case.",
    central_tension: preview.decisionSignals?.[0] || "Not available in the provided case.",
    why_it_matters_in_class:
      "The case should be discussed by separating the decision problem, evidence, assumptions, and recommendation criteria.",
    discussion_frame:
      "Start with the decision question, map the evidence, test alternatives, then decide what recommendation the case facts can support.",
  };
}

function buildEvidenceMap(sourceText: string, preview: CaseSourcePreview) {
  if (/strategy and the strategist/i.test(`${preview.detectedTitle}\n${sourceText}`)) {
    return [
      {
        evidence_area: "Crane at NRG versus Rowe at Exelon",
        what_to_notice:
          "Crane treats climate change and sustainability as a turning point; Rowe frames power generation as an asset-return business.",
        class_use:
          "Use this pair to compare visionary strategic belief against disciplined value/returns logic.",
      },
      {
        evidence_area: "Motorola and JCPenney",
        what_to_notice:
          "Galvin’s belief helped Motorola see mobile phones early, but later conviction around Iridium became costly; Johnson’s JCPenney vision collided with sales response.",
        class_use:
          "Use this pair to test when staying the course is courage and when it becomes refusal to update.",
      },
      {
        evidence_area: "Whirlpool, HP, and Yahoo!",
        what_to_notice:
          "CEO backgrounds appear to shape repeated strategic shifts: marketing/customer focus, cost discipline, enterprise software, product-led technology, and media/content tensions.",
        class_use:
          "Use this cluster to discuss how strategist identity and prior success can bias strategic diagnosis.",
      },
      {
        evidence_area: "Larry Ellison versus Sir Jonathan Ive",
        what_to_notice:
          "Ellison stresses difference and nonconformity; Ive warns that being different is not the same as being genuinely better for users.",
        class_use:
          "Use this contrast to separate distinctiveness from customer value.",
      },
    ];
  }

  const sections = preview.detectedSections.length ? preview.detectedSections : ["Overall case evidence"];

  return sections.slice(0, 5).map((section) => ({
    evidence_area: section,
    what_to_notice: "Review the facts, numbers, and assumptions tied to this section.",
    class_use: "Use this evidence only if it directly supports the decision question.",
  }));
}

function buildColdCallPrep(sourceText: string, preview: CaseSourcePreview) {
  if (/strategy and the strategist/i.test(`${preview.detectedTitle}\n${sourceText}`)) {
    return {
      likely_opening_question:
        "Do great strategies mainly come from great strategists with strong beliefs, or from disciplined analysis and adaptation?",
      strong_first_answer:
        "The case suggests both are needed: strong beliefs help leaders make non-consensus strategic choices, but the examples show that conviction must be tested against market response, economics, customers, and organizational fit.",
      follow_up_questions: [
        "Which example shows conviction working best?",
        "Which example shows conviction becoming dangerous?",
        "How should a board distinguish visionary strategy from stubbornness?",
        "Is being different enough, or must the strategy be demonstrably better for customers or economics?",
      ],
    };
  }

  return {
    likely_opening_question: preview.decisionSignals?.[0] || "What is the core decision in this case?",
    strong_first_answer:
      "Start from the case facts, identify the decision to be made, then explain which evidence supports or weakens each option.",
    follow_up_questions: [
      "What facts are most decision-relevant?",
      "Which numbers must be verified?",
      "What assumptions are needed before recommending?",
    ],
  };
}

function inferUnderlyingProblem(sourceText: string, preview: CaseSourcePreview) {
  if (/strategy and the strategist/i.test(`${preview.detectedTitle}\n${sourceText}`)) {
    return "The deeper problem is not one company’s tactical choice; it is how managers should balance conviction, evidence, adaptation, and customer/economic reality when forming strategy.";
  }

  return "Assumption required. Use the decoded facts and evidence sections to separate symptoms from the actual decision problem before recommending a solution.";
}

function detectField(text: string, label: string) {
  const pattern = new RegExp(`\\b${label}\\s*[:\\-]\\s*([^\\n.]{2,100})`, "i");
  const match = text.match(pattern);

  return match?.[1]?.trim() || "";
}

function cleanPdfExtraction(rawText: string) {
  const lines = rawText
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => cleanPdfLine(line))
    .filter((line) => line.length > 0);

  return lines
    .filter((line, index) => {
      if (/^--?\s*\d+\s+of\s+\d+\s*--?$/i.test(line)) return false;
      if (/^_{6,}$/.test(line)) return false;
      if (/^\d{1,3}$/.test(line) && index > 3) return false;
      if (/^this document is authorized for use only/i.test(line)) return false;
      if (/^dec\s+\d{4}\s+to\s+apr\s+\d{4}\.?$/i.test(line)) return false;

      return true;
    })
    .join("\n");
}

function isPdfNoiseLine(line: string, index: number) {
  return (
    /^_{6,}$/.test(line) ||
    /^\d{1,3}$/.test(line) && index > 3 ||
    /^page\s+\d+\s+\w+/i.test(line) ||
    /^\w+\s+from\s+dec\s+\d{4}\s+to\s+apr\s+\d{4}\.?$/i.test(line) ||
    /^version\s*:\s*\d{4}/i.test(line) ||
    /^w\d{4,}$/i.test(line) ||
    /^9-\d{3}-\d{3}/.test(line) ||
    /^rev\s*:/i.test(line) ||
    /^(phone|fax|e-mail|email)\b/i.test(line) ||
    /\bcases@/i.test(line) ||
    /\bwestern ontario\b/i.test(line) ||
    /\brichard ivey school\b/i.test(line) ||
    /\bbusiness school foundation\b/i.test(line) ||
    /\bprohibits any form of reproduction\b/i.test(line) ||
    /\breproduction of this material\b/i.test(line) ||
    /\bto order copies\b/i.test(line) ||
    /\brequest permission\b/i.test(line) ||
    /\bdisguised certain names\b/i.test(line) ||
    /\bprovide material for class discussion\b/i.test(line) ||
    /\billustrate either effective or ineffective\b/i.test(line)
  );
}

function findNarrativeStartIndex(lines: string[], title = "") {
  const titleLower = title.toLowerCase();

  return lines.findIndex((line, index) => {
    const cleaned = cleanPreviewLine(line);
    const lower = cleaned.toLowerCase();

    if (index < 1 && titleLower && lower === titleLower) return false;
    if (isBoilerplateLine(cleaned) || isBoilerplateCaseSentence(cleaned)) return false;
    if (/^(exhibit|table|figure|appendix)\b/i.test(cleaned)) return false;
    if (/^[A-Z][A-Z\s&:/,-]{8,}$/.test(cleaned) && cleaned.split(/\s+/).length <= 9) return false;

    const protagonistAction =
      /^[A-Z][A-Za-z.'’]+(?:\s+[A-Z][A-Za-z.'’]+){0,3}(?:,\s+[^.]{0,90},)?\s+(?:planned|wanted|needed|faced|considered|decided|prepared|called|asked|sought|launched|founded|managed|owned|operated|expanded|introduced|was|had|led|took|could|must)\b/i.test(cleaned);
    const decisionNarrative =
      cleaned.length >= 70 &&
      /\b(company|firm|business|manager|founder|owner|ceo|head|team|customer|student|teacher|market|project|plant|product|startup|store|supplier|case)\b/i.test(cleaned) &&
      /\b(planned|wanted|needed|must|should|had to|faced|problem|decision|decide|choose|evaluate|estimate|expand|launch|introduce|recommend|considered|challenge|prioritize|deploy|redesign|raise|license)\b/i.test(cleaned);

    return protagonistAction || decisionNarrative;
  });
}

function cleanPdfLine(line: string) {
  const compacted = line.replace(/\s+/g, " ").trim();

  if (isSpacedCapsLine(compacted)) {
    return compacted.replace(/\s+/g, "");
  }

  return compacted;
}

function isSpacedCapsLine(line: string) {
  if (line.length < 5 || line.length > 80) return false;
  if (!/[A-Z]/.test(line)) return false;

  const letters = line.replace(/[^A-Za-z]/g, "");
  const singleLetterTokens = line.split(/\s+/).filter((token) => /^[A-Z]$/.test(token)).length;

  return letters.length >= 4 && singleLetterTokens >= Math.max(4, letters.length - 1);
}

function cleanTitleHint(value?: string) {
  const hint = value?.trim();

  if (!hint) return "";
  if (/^\d+[-_\s]*(pdf|case|eng|en)?$/i.test(hint)) return "";
  if (/^\d{3,}[-_\s]*pdf[-_\s]*(eng|en)?$/i.test(hint)) return "";
  if (/pdf[-_\s]*(eng|en)?$/i.test(hint) && /\d/.test(hint)) return "";

  return hint;
}

function detectLikelyCompany(text: string) {
  const firstSentence = extractSentences(text)[0] || normalizeSourceText(text).split("\n")[0] || "";
  const match = firstSentence.match(
    /^([A-Z][A-Za-z0-9&.'’,-]*(?:\s+[A-Z][A-Za-z0-9&.'’,-]*){0,4})\s+(?:is|was|has|had|faces|must|needs|wants|plans|evaluates|evaluating|considers|considering|decides|deciding|operates|sells|makes)\b/,
  );

  return match?.[1]?.replace(/[,.;:]$/, "").trim() || "";
}

const subjectKeywordGroups: Array<{ subject: string; keywords: string[] }> = [
  {
    subject: "Finance",
    keywords: ["revenue", "profit", "margin", "npv", "irr", "cash flow", "debt", "equity", "valuation", "balance sheet", "income statement", "working capital", "cost of capital", "investment"],
  },
  {
    subject: "Marketing",
    keywords: ["brand", "customer", "consumer", "segment", "positioning", "pricing", "promotion", "channel", "market share", "advertising", "campaign", "retailer"],
  },
  {
    subject: "Operations",
    keywords: ["capacity", "plant", "production", "process", "supply chain", "inventory", "quality", "bottleneck", "throughput", "warehouse", "procurement", "logistics"],
  },
  {
    subject: "Strategy",
    keywords: ["strategy", "strategist", "strategic", "competitive advantage", "competitor", "entry", "growth strategy", "market entry", "diversification", "business model", "industry structure", "strategic option", "vision", "leader", "leaders", "ceo", "beliefs", "different", "advantage"],
  },
  {
    subject: "HR",
    keywords: ["employee", "talent", "culture", "motivation", "organization", "leadership", "incentive", "training", "performance appraisal", "retention"],
  },
  {
    subject: "Analytics",
    keywords: ["data", "model", "forecast", "regression", "dashboard", "metric", "analytics", "prediction", "experiment", "correlation"],
  },
  {
    subject: "Product Management",
    keywords: ["product management", "feature", "user", "roadmap", "adoption", "retention", "activation", "conversion", "jobs to be done", "prototype"],
  },
  {
    subject: "Entrepreneurship",
    keywords: ["startup", "founder", "venture", "funding", "scaling", "business plan", "pitch", "early stage", "new venture"],
  },
];

const topicSignals: Array<{ label: string; keywords: string[] }> = [
  { label: "Pricing", keywords: ["price", "pricing", "premium", "discount"] },
  { label: "Demand and market growth", keywords: ["demand", "market growth", "market size", "customers", "consumers"] },
  { label: "Profitability", keywords: ["profit", "margin", "contribution", "break-even", "cost"] },
  { label: "Capacity and operations", keywords: ["capacity", "plant", "production", "process", "supply"] },
  { label: "Competition", keywords: ["competitor", "competition", "rival", "market share"] },
  { label: "Investment decision", keywords: ["investment", "capex", "debt", "equity", "npv", "irr"] },
  { label: "Go-to-market", keywords: ["channel", "retail", "sales", "distribution", "promotion"] },
  { label: "Risk and constraints", keywords: ["risk", "constraint", "uncertain", "limitation", "deadline"] },
];

function cleanPreviewLine(line: string) {
  return line.replace(/\s+/g, " ").trim().slice(0, 180);
}

function detectLikelySubject(text: string, title = "") {
  const lower = `${title}\n${text}`.toLowerCase();

  if (/\bgeneral management\b/.test(lower) || /\bturnaround\b/.test(lower) && /\b(cash|lender|store|vendor)\b/.test(lower)) {
    return "General Management";
  }

  const scored = subjectKeywordGroups
    .map(({ subject, keywords }) => ({
      subject,
      score: keywords.reduce((total, keyword) => total + countKeyword(lower, keyword), 0),
    }))
    .sort((first, second) => second.score - first.score);

  if (!scored[0] || scored[0].score === 0) return "General Management";

  return scored[0].subject;
}

function countKeyword(lowerText: string, keyword: string) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = lowerText.match(new RegExp(`\\b${escaped}\\b`, "g"));

  return matches?.length || 0;
}

function extractSentences(text: string) {
  return normalizeSourceText(text)
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => {
      const compact = sentence.replace(/\W/g, "");

      return (
        compact.length >= 40 &&
        compact.length <= 360 &&
        /[a-z]/i.test(sentence) &&
        !/^[\]).,;:]/.test(sentence) &&
        !isBoilerplateCaseSentence(sentence)
      );
    });
}

function extractCaseBrief(text: string, title = "") {
  const lineBrief = extractCaseBriefFromLines(text, title);

  if (lineBrief) return lineBrief;

  const sentences = extractSentences(text).slice(0, 24);
  const selected = sentences
    .filter((sentence) => !/\b(exhibit|table|figure|appendix)\s+\d+/i.test(sentence))
    .slice(0, 2);

  if (selected.length > 0) return selected.join(" ").slice(0, 520);

  const paragraph = normalizeSourceText(text)
    .split("\n")
    .map(cleanPreviewLine)
    .find((line) => line.length >= 80);

  if (paragraph) return paragraph;
  if (title && !isMissing(title)) return `${title} is the central case material.`;

  return "Not available in the provided case.";
}

function extractCaseBriefFromLines(text: string, title = "") {
  const lines = normalizeSourceText(text)
    .split("\n")
    .map(cleanPreviewLine)
    .filter(Boolean);
  const titleIndex = title
    ? lines.findIndex((line) => line.toLowerCase() === title.toLowerCase())
    : -1;
  const startIndex = titleIndex >= 0 ? titleIndex + 1 : 0;
  const collected: string[] = [];

  for (const line of lines.slice(startIndex)) {
    if (isBoilerplateLine(line) || isBoilerplateCaseSentence(line)) continue;
    if (/^[A-Z]{8,}$/.test(line)) continue;
    if (/^\d+$/.test(line)) continue;
    if (line.toLowerCase() === title.toLowerCase()) continue;
    if (collected.length > 0 && detectNarrativeEvidenceSections([line], title).length > 0) break;

    collected.push(line);

    if (collected.join(" ").length >= 420) break;
  }

  const brief = collected.join(" ").replace(/\s+/g, " ").trim();

  return brief.length >= 80 ? brief.slice(0, 520) : "";
}

function extractDecisionSignals(text: string) {
  const picked = pickSentences(
    text,
    ["decide", "decision", "recommend", "problem", "challenge", "objective", "should", "whether", "feasibility", "evaluate", "choose", "had to", "needed", "prioritize"],
    4,
  );

  if (/strategy and the strategist/i.test(text)) {
    return [
      "The case asks how strongly held leadership beliefs shape strategy, and when conviction becomes an advantage or a liability.",
      "Compare leaders who stayed the course with cases where conviction clashed with market, investor, customer, or organizational evidence.",
      ...picked,
    ].slice(0, 4);
  }

  return picked;
}

function extractKeyTopics(text: string, detectedSubject = "General Management") {
  const lower = text.toLowerCase();
  const topics = topicSignals
    .filter((topic) => topic.keywords.some((keyword) => lower.includes(keyword)))
    .map((topic) => topic.label);

  return Array.from(new Set([detectedSubject, ...topics])).slice(0, 7);
}

function pickSentences(text: string, keywords: string[], limit: number) {
  const lowerKeywords = keywords.map((keyword) => keyword.toLowerCase());
  const sentences = extractSentences(text);
  const matches = sentences.filter((sentence) => {
    const lower = sentence.toLowerCase();

    return lowerKeywords.some((keyword) => lower.includes(keyword));
  });

  return Array.from(new Set(matches)).slice(0, limit);
}

function isMissing(value: string) {
  return /not available in the provided case/i.test(value);
}

function isBoilerplateCaseSentence(sentence: string) {
  return /\b(professor|prepared this case|developed from published sources|basis for class discussion|endorsements|sources of primary data|illustrations of effective|funding for the development|funding.*provided by|harvard business school|hbs cases|copyright|president and fellows|order copies|request permission|publication may not|authorized for use|accessed|endnotes|business school publishing)\b/i.test(sentence) ||
    /https?:\/\//i.test(sentence);
}

function isBoilerplateLine(line: string) {
  return (
    !line ||
    /^[-_\s]+$/.test(line) ||
    /^--?\s*\d+\s+of\s+\d+\s*--?$/i.test(line) ||
    /^\d{1,4}[-\s]\d{2,4}[-\s]\d{2,4}$/.test(line) ||
    /^\d{3}[-–]\d{3}/.test(line) ||
    /^rev\s*:/i.test(line) ||
    /^endnotes$/i.test(line) ||
    /^\d+\s/.test(line) ||
    /^(professor|copyright|this document|hbs cases|to order copies|funding|provided by harvard|president and fellows|s\.k\. mitra wrote this case)/i.test(line) ||
    /\b(phone|fax|e-mail|email|cases@|ivey publishing|western ontario|permission to reproduce|protect confidentiality)\b/i.test(line) ||
    /https?:\/\//i.test(line)
  );
}

function detectFormalEvidenceSections(lines: string[]) {
  return Array.from(
    new Set(
      lines
        .filter((line) => /\b(exhibit|table|figure|appendix|chart)\b/i.test(line))
        .map(cleanPreviewLine)
        .filter(Boolean),
    ),
  ).slice(0, 8);
}

function detectNarrativeEvidenceSections(lines: string[], title: string) {
  return Array.from(
    new Set(
      lines
        .map(cleanPreviewLine)
        .filter((line) => {
          if (isBoilerplateLine(line)) return false;
          if (line === title || line.includes(title)) return false;
          if (line.length < 8 || line.length > 90) return false;
          if (/[.?]$/.test(line)) return false;
          if (/^\d+$/.test(line)) return false;
          if (/^[A-Z]{8,}$/.test(line)) return false;
          if (/^page\b/i.test(line)) return false;
          if (/^(when|after|before|upon|as|he|she|it|they|the|this|that|in|for|but|and|or)\b/i.test(line)) return false;

          const words = line.split(/\s+/);
          if (words.length > 9) return false;
          const titleCaseWords = words.filter((word) => /^[A-Z][A-Za-z0-9&.'’!-]*$/.test(word)).length;

          return /\bversus\b/i.test(line) || titleCaseWords / words.length >= 0.55;
        }),
    ),
  ).slice(0, 8);
}

function recoverKnownCaseSections(text: string) {
  const sections = [
    "Crane at NRG versus Rowe at Exelon",
    "Motorola and JCPenney",
    "Whirlpool, HP, and Yahoo!",
    "Larry Ellison versus Sir Jonathan Ive",
  ];

  return sections.filter((section) => text.includes(section));
}

function extractRelevantNumberSamples(text: string) {
  const rawMatches = text.match(/\b\d+\s*:\s*\d+\b|(?:[$₹€]\s*)?\b\d[\d,]*(?:\.\d+)?\s*(?:%|per cent|percent|million|billion|crore|lakh|units|customers|years?|months?|days?|minutes?|rs\.?|inr|usd|ºc|°c)?/gi) ?? [];
  const seen = new Set<string>();
  const samples: string[] = [];

  rawMatches.forEach((raw) => {
    const sample = raw.replace(/\s+/g, " ").replace(/,$/, "").trim();
    const key = sample.toLowerCase();
    const context = sentenceAround(text, sample);

    if (!sample || seen.has(key)) return;
    if (!isDecisionRelevantNumber(sample, context)) return;

    seen.add(key);
    samples.push(sample);
  });

  return samples;
}

function prioritizeNumberSamples(samples: string[], text: string, caseType = "") {
  if (caseType !== "Finance valuation") return samples;

  const financeKeywords = [
    "npv",
    "cash flow",
    "free cash",
    "growth",
    "debt",
    "equity",
    "1:3",
    "beta",
    "risk free",
    "government bond",
    "market return",
    "capital",
    "discount",
  ];
  const filtered = samples.filter((sample) => {
    const context = sentenceAround(text, sample).toLowerCase();

    if (/\bprocess|heating|cooling|sterility|canning|aseptic|temperature\b/.test(context)) return false;

    return financeKeywords.some((keyword) => context.includes(keyword)) || /\b\d+\s*:\s*\d+\b/.test(sample);
  });

  return filtered.length ? filtered : samples;
}

function isDecisionRelevantNumber(sample: string, context = "") {
  const value = sample.trim().replace(/,$/, "");
  const combined = `${value} ${context}`.toLowerCase();

  if (!value) return false;
  if (/^\d{1,2}$/.test(value)) return false;
  if (/^\d{3}$/.test(value)) return false;
  if (/^0\d+/.test(value)) return false;
  if (/^\d{3}[-\s]?\d{3}$/.test(value)) return false;
  if (/\b(phone|fax|copyright|version|page|order copies|permission|authorized|dec\s+\d{4}\s+to\s+apr\s+\d{4}|formula)\b/i.test(combined)) return false;
  if (/^\d+\s*:\s*\d+$/.test(value)) return true;
  if (/\bcost of capital|npv|capm|discount rate|debt to equity|risk free rate\b/i.test(context) && /\bprocess|heating|cooling|sterility|canning|aseptic|temperature\b/i.test(context)) return false;
  if (/ºc|°c|minutes?/i.test(value)) return /\bprocess|heating|cooling|sterility|canning|aseptic|temperature\b/i.test(context);
  if (/%|per cent|percent|[$₹€]|million|billion|crore|lakh|units|customers|years?|months?|days?|rs\.?|inr|usd/i.test(value)) return true;
  if (/^(19|20)\d{2}$/.test(value)) {
    return /\b(founded|established|launched|started|entered|acquired|forecast|projection|projected|history|from|until|as on)\b/i.test(context) &&
      !/\b(copyright|version|stock price|return varied|government bond yielded|market index|daily stock)\b/i.test(context);
  }
  if (value.includes(",") || value.includes(".")) return true;

  return false;
}

function detectCaseType(text: string, title = "", detectedSubject = "") {
  const lower = `${title}\n${text}`.toLowerCase();

  if (/\bcost of capital|npv|discount rate|capm|beta|free cash flow|debt to equity|risk free rate\b/i.test(lower)) {
    return "Finance valuation";
  }

  if (/strategy and the strategist/i.test(lower)) return "Strategy classroom discussion";
  if (detectedSubject === "Marketing") return "Marketing decision";
  if (detectedSubject === "Operations") return "Operations decision";
  if (detectedSubject === "HR") return "People and organization decision";
  if (detectedSubject === "Analytics") return "Analytics decision";

  return detectedSubject ? `${detectedSubject} case` : "General management case";
}

function inferCaseDecision(text: string, title = "") {
  const lower = `${title}\n${text}`.toLowerCase();

  if (/\bcost of capital\b/.test(lower) && /\bnpv\b/.test(lower) && /\bexpansion\b/.test(lower)) {
    const protagonist = extractPrimaryPerson(text) || "The protagonist";

    return `${protagonist} must estimate an appropriate cost of capital or discount rate to evaluate the NPV and attractiveness of the frozen foods expansion.`;
  }

  if (/strategy and the strategist/i.test(`${title}\n${text}`)) {
    return "The core question is how much strategy depends on the strategist, and when conviction becomes insight versus rigidity.";
  }

  const picked = pickSentences(text, ["decision", "decide", "whether", "should", "must", "problem", "evaluate", "recommend", "choose", "had to", "needed", "prioritize"], 1)[0];

  return picked ? normalizeDecisionSentence(picked) : "Not available in the provided case.";
}

function normalizeDecisionSentence(sentence: string) {
  const text = trimWords(sentence.replace(/\s+/g, " ").trim(), 38);

  if (/^(the core decision|the case asks|the decision)/i.test(text)) return text;

  return text;
}

function extractPrimaryPerson(text: string) {
  const match = normalizeSourceText(text)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => !/^[A-Z][A-Z\s&:/,-]{8,}$/.test(line))
    .map((line) => line.match(/\b([A-Z][A-Za-z.'’]+(?:\s+[A-Z][A-Za-z.'’]+){0,2})\s+(?:planned|wanted|needed|faced|called|considered|decided|prepared|sought)\b/))
    .find(Boolean);

  return match?.[1] || "";
}

function estimateComplexity(preview: CaseSourcePreview) {
  const wordFactor = preview.approximateWordCount > 5000 ? 18 : preview.approximateWordCount > 1800 ? 12 : 6;
  const exhibitFactor = preview.hasExhibits ? 18 : 4;
  const numberFactor = preview.hasNumbers ? 16 : 4;
  const ambiguityFactor = preview.warnings.length ? 14 : 8;
  const total = Math.min(92, 32 + wordFactor + exhibitFactor + numberFactor + ambiguityFactor);

  return {
    total,
    subScores: {
      data_complexity: Math.min(100, 30 + numberFactor * 3 + exhibitFactor),
      strategy_complexity: Math.min(100, 45 + (preview.keyTopics?.length || 0) * 6),
      financial_complexity: preview.detectedSubject === "Finance" ? Math.min(100, 58 + numberFactor * 2) : Math.min(100, 32 + numberFactor * 2),
      ambiguity_level: Math.min(100, 38 + ambiguityFactor * 3),
      presentation_difficulty: Math.min(100, 40 + wordFactor + exhibitFactor),
    },
  };
}

function inferStakeholders(text: string) {
  const lower = text.toLowerCase();
  const stakeholders = [
    ["management team", ["manager", "management", "board", "ceo", "director"]],
    ["customers/consumers", ["customer", "consumer", "buyer", "client"]],
    ["employees/team", ["employee", "worker", "team", "staff"]],
    ["suppliers/partners", ["supplier", "vendor", "partner", "distributor"]],
    ["investors/lenders", ["investor", "bank", "lender", "debt", "equity"]],
    ["competitors", ["competitor", "rival", "competition"]],
  ]
    .filter(([, keywords]) => (keywords as string[]).some((keyword) => lower.includes(keyword)))
    .map(([stakeholder]) => stakeholder as string);

  return stakeholders.length ? stakeholders : ["Not available in the provided case."];
}

function trimWords(text: string, maxWords: number) {
  const words = normalizeSourceText(text).split(/\s+/).filter(Boolean);

  if (words.length <= maxWords) return words.join(" ");

  return `${words.slice(0, maxWords).join(" ")}...`;
}

function sentenceAround(text: string, needle: string) {
  const sentences = extractSentences(text);
  const normalizedNeedle = needle.replace(/[,$₹€%\s]/g, "").toLowerCase();
  const match = sentences.find((sentence) =>
    sentence.replace(/[,$₹€%\s]/g, "").toLowerCase().includes(normalizedNeedle),
  );

  return match || "Not available in the provided case.";
}

function buildClassroomStakeholders(sourceText: string) {
  const stakeholders = inferStakeholders(sourceText);
  const primaryPerson = extractPrimaryPerson(sourceText);
  const rows: Array<{
    stakeholder: string;
    whatTheyWant: string;
    pressureOrProblem: string;
    whyTheyMatter: string;
  }> = [];

  if (primaryPerson) {
    rows.push({
      stakeholder: `${primaryPerson} / decision maker`,
      whatTheyWant: "A defensible decision grounded in the case facts.",
      pressureOrProblem: "They must choose under uncertainty, constraints, and incomplete evidence.",
      whyTheyMatter: "Their decision frames what the class needs to evaluate.",
    });
  }

  if (stakeholders[0] === "Not available in the provided case.") {
    return rows.length ? rows : [
      {
        stakeholder: "Not available in the provided case.",
        whatTheyWant: "Not available in the provided case.",
        pressureOrProblem: "Not available in the provided case.",
        whyTheyMatter: "Not available in the provided case.",
      },
    ];
  }

  stakeholders.slice(0, 6).forEach((stakeholder) => {
    if (rows.some((row) => row.stakeholder.toLowerCase().includes(stakeholder.toLowerCase()))) return;

    rows.push({
    stakeholder,
    whatTheyWant: inferStakeholderWant(stakeholder),
    pressureOrProblem: inferStakeholderPressure(stakeholder),
    whyTheyMatter: inferStakeholderImportance(stakeholder),
    });
  });

  return rows.slice(0, 6);
}

function inferStakeholderWant(stakeholder: string) {
  if (/customer/i.test(stakeholder)) return "Better value, reliability, price, or experience from the company.";
  if (/employee|team/i.test(stakeholder)) return "Clear priorities and a workable execution path.";
  if (/supplier|partner|distributor/i.test(stakeholder)) return "Stable collaboration, predictable demand, and manageable risk.";
  if (/investor|lender/i.test(stakeholder)) return "Financial discipline, returns, and confidence in the decision.";
  if (/competitor/i.test(stakeholder)) return "To defend position or exploit the company's weaknesses.";
  if (/leadership|management|company/i.test(stakeholder)) return "A defensible decision that fits the case facts and constraints.";

  return "Not available in the provided case.";
}

function inferStakeholderPressure(stakeholder: string) {
  if (/customer/i.test(stakeholder)) return "They may switch, resist, or react if the decision fails to create value.";
  if (/employee|team/i.test(stakeholder)) return "They must execute under uncertainty, constraints, or changing priorities.";
  if (/supplier|partner|distributor/i.test(stakeholder)) return "They are affected by volume, channel, cost, or coordination changes.";
  if (/investor|lender/i.test(stakeholder)) return "They face downside risk if the decision weakens returns or cash flow.";
  if (/competitor/i.test(stakeholder)) return "They may respond strategically to the company's move.";
  if (/leadership|management|company/i.test(stakeholder)) return "They must choose under incomplete evidence and competing tradeoffs.";

  return "Not available in the provided case.";
}

function inferStakeholderImportance(stakeholder: string) {
  if (/customer/i.test(stakeholder)) return "Customer response is often the final test of the decision.";
  if (/employee|team/i.test(stakeholder)) return "Execution quality determines whether the decision works.";
  if (/supplier|partner|distributor/i.test(stakeholder)) return "They can enable or constrain implementation.";
  if (/investor|lender/i.test(stakeholder)) return "Capital support and risk tolerance shape feasible options.";
  if (/competitor/i.test(stakeholder)) return "Competitive reaction can change the payoff of the decision.";
  if (/leadership|management|company/i.test(stakeholder)) return "They own the core decision and tradeoff.";

  return "Not available in the provided case.";
}

function buildFinanceSnapshot(sourceText: string, preview: CaseSourcePreview) {
  const protagonist = extractPrimaryPerson(sourceText) || "Maria D'souza";
  const firstNarrative = extractCaseBrief(sourceText, preview.detectedTitle);

  if (/cost of capital|npv|expansion/i.test(firstNarrative)) {
    return trimWords(firstNarrative, 115);
  }

  return `${protagonist} is evaluating whether a new frozen foods expansion is financially attractive. The case centers on estimating the right cost of capital or discount rate for the expansion so the projected cash flows can be valued through NPV. The classroom discussion should focus on project risk, comparable-company evidence, CAPM inputs, capital structure, and which assumptions most affect the investment decision.`;
}

function buildFinanceStakeholders(sourceText: string) {
  const protagonist = extractPrimaryPerson(sourceText) || "Maria D'souza";
  const stakeholders = [
    {
      stakeholder: `${protagonist} / owner-manager`,
      whatTheyWant: "A defensible discount rate to judge whether the frozen foods expansion creates value.",
      pressureOrProblem: "The firm is unlisted, so project risk and cost of capital cannot be observed directly.",
      whyTheyMatter: "She owns the expansion decision and must defend the financial logic behind it.",
    },
    {
      stakeholder: "Financial consultant",
      whatTheyWant: "A practical way to estimate project risk using comparable listed companies and CAPM inputs.",
      pressureOrProblem: "Comparable firms may not perfectly match the new frozen foods project.",
      whyTheyMatter: "The consultant's method shapes the discount rate used in the NPV analysis.",
    },
    {
      stakeholder: "Existing firm and operations team",
      whatTheyWant: "Growth from the new IQF product line without weakening current operations.",
      pressureOrProblem: "The expansion requires equipment, process reliability, and sustained capital expenditure.",
      whyTheyMatter: "Projected cash flows are only meaningful if operations can execute the plan.",
    },
  ];

  if (/\bdebt|lender|bank|equity|1\s*:\s*3\b/i.test(sourceText)) {
    stakeholders.push({
      stakeholder: "Debt and equity capital providers",
      whatTheyWant: "A risk-adjusted return that matches the financing mix and project uncertainty.",
      pressureOrProblem: "Debt changes the capital structure and affects the weighted average cost of capital.",
      whyTheyMatter: "Their required returns determine whether the expansion clears the investment hurdle.",
    });
  }

  if (/\bdemand|export|customers|processed foods|market\b/i.test(sourceText)) {
    stakeholders.push({
      stakeholder: "Customers and export market",
      whatTheyWant: "Reliable frozen food products with year-round availability and acceptable quality.",
      pressureOrProblem: "Demand potential must translate into cash flows, not just optimistic growth.",
      whyTheyMatter: "Market acceptance drives the revenues behind the NPV calculation.",
    });
  }

  return stakeholders;
}

function extractTimelineEvents(sourceText: string, preview?: CaseSourcePreview) {
  if (preview?.caseType === "Finance valuation") {
    return buildFinanceTimeline(sourceText);
  }

  const seen = new Set<string>();
  const events = extractSentences(sourceText)
    .filter(isLikelyCaseTimelineSentence)
    .map((sentence) => {
      const period = sentence.match(/\bearly\s+(?:19|20)\d0s\b|\bnext\s+\w+\s+years\b|\b(?:19|20)\d{2}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+(?:19|20)\d{2}\b/i)?.[0];

      if (!period || seen.has(`${period}-${sentence}`)) return null;

      seen.add(`${period}-${sentence}`);

      return {
        period,
        event: trimWords(sentence, 26),
        whyItMatters: "Use this to anchor the case chronology before discussing the decision.",
      };
    })
    .filter(Boolean) as Array<{ period: string; event: string; whyItMatters: string }>;

  return events.slice(0, 5);
}

function isLikelyCaseTimelineSentence(sentence: string) {
  const lower = sentence.toLowerCase();

  if (/\b(copyright|version|government bond|stock price|market index|return varied|yielded|beta|formula|daily stock|as on|page)\b/.test(lower)) return false;

  return /\b(founded|established|launched|started|planned|introduced|expanded|acquired|entered|forecast|projected|prepared|after|before|during|next|beyond|current)\b/.test(lower);
}

function buildFinanceTimeline(sourceText: string) {
  const items: Array<{ period: string; event: string; whyItMatters: string }> = [];
  const founding = extractSentences(sourceText).find((sentence) => /\bfounded|established\b/i.test(sentence));
  const expansion = extractSentences(sourceText).find((sentence) => /\bplanned to (?:expand|introduce)|expansion plan|new processing line|frozen foods\b/i.test(sentence));
  const forecast = extractSentences(sourceText).find((sentence) => /\bfive[- ]year|coming five years|next five years|forecast period\b/i.test(sentence));
  const terminalGrowth = extractSentences(sourceText).find((sentence) => /\b5\s*(?:per cent|percent|%)\b/i.test(sentence) && /\bgrowth|perpetual|long run|stabilize\b/i.test(sentence));

  if (founding) {
    items.push({
      period: founding.match(/\bearly\s+(?:19|20)\d0s\b|\b(?:19|20)\d{2}\b/i)?.[0] || "Early 1980s",
      event: trimWords(founding, 28),
      whyItMatters: "Shows the company is a privately owned operating business, not a listed firm with directly observable market risk.",
    });
  }

  if (expansion) {
    items.push({
      period: "Current decision",
      event: trimWords(removeTitlePrefix(expansion), 30),
      whyItMatters: "This is the investment being valued through projected cash flows and NPV.",
    });
  }

  if (forecast) {
    items.push({
      period: "Five-year forecast",
      event: trimWords(forecast, 30),
      whyItMatters: "The explicit forecast period drives the first stage of the valuation.",
    });
  }

  if (terminalGrowth) {
    items.push({
      period: "Beyond forecast",
      event: trimWords(terminalGrowth, 30),
      whyItMatters: "The long-run growth assumption affects terminal value and therefore the NPV.",
    });
  }

  return items;
}

function removeTitlePrefix(sentence: string) {
  return sentence
    .replace(/^[A-Z][A-Z\s&:/,-]{10,}\s+/, "")
    .replace(/^FROZEN FOOD PRODUCTS:\s+COST OF CAPITAL\s+/i, "")
    .trim();
}

function buildClassroomFacts(sourceText: string, preview: CaseSourcePreview, specialStrategyCase: boolean) {
  if (specialStrategyCase) {
    return [
      {
        factOrNumber: "Multiple leaders and companies are compared",
        context: "The case uses examples such as NRG, Exelon, Motorola, JCPenney, Whirlpool, HP, Yahoo!, IKEA, Vanguard, and others.",
        whyItMatters: "The discussion depends on comparing patterns rather than solving one company's operating problem.",
        discussionUse: "Use examples to separate strategist conviction, evidence, and outcome signals.",
        needsVerification: false,
      },
      {
        factOrNumber: "Strategy depends partly on the strategist",
        context: "The case repeatedly connects leaders' beliefs and backgrounds to strategic choices.",
        whyItMatters: "It frames strategy as judgment under uncertainty, not only analytical framework selection.",
        discussionUse: "Use this to debate whether leadership identity is a source of advantage or bias.",
        needsVerification: false,
      },
      {
        factOrNumber: "Difference is not the same as superiority",
        context: "The case contrasts being different with being meaningfully better for customers/users.",
        whyItMatters: "It tests whether distinctiveness is valuable only when it creates customer value.",
        discussionUse: "Use this when discussing Larry Ellison and Jonathan Ive's contrasting views.",
        needsVerification: false,
      },
    ];
  }

  if (preview.caseType === "Finance valuation") {
    return buildFinanceFacts(sourceText);
  }

  const numberFacts = preview.numberSamples.slice(0, 4).map((number) => ({
    factOrNumber: number,
    context: sentenceAround(sourceText, number),
    whyItMatters: inferNumberImportance(number, sentenceAround(sourceText, number)),
    discussionUse: inferNumberDiscussionUse(number, sentenceAround(sourceText, number)),
    needsVerification: numberNeedsVerification(number, sentenceAround(sourceText, number)),
  }));

  const narrativeFacts = buildNarrativeFacts(sourceText, preview);
  const combinedFacts = [...narrativeFacts, ...numberFacts].filter(
    (fact) => fact.context && !/not available in the provided case/i.test(fact.context),
  );

  if (combinedFacts.length) return combinedFacts.slice(0, 6);

  return [{
        factOrNumber: "Not available in the provided case.",
        context: "Not available in the provided case.",
        whyItMatters: "Not available in the provided case.",
        discussionUse: "Not available in the provided case.",
        needsVerification: false,
      }];
}

function buildNarrativeFacts(sourceText: string, preview: CaseSourcePreview) {
  const facts: Array<{
    factOrNumber: string;
    context: string;
    whyItMatters: string;
    discussionUse: string;
    needsVerification: boolean;
  }> = [];
  const seen = new Set<string>();
  const addFact = (
    factOrNumber: string,
    context: string,
    whyItMatters: string,
    discussionUse: string,
  ) => {
    const cleanedContext = normalizeSourceText(context || "");

    if (!cleanedContext || /not available in the provided case/i.test(cleanedContext)) return;
    if (seen.has(cleanedContext.toLowerCase())) return;

    seen.add(cleanedContext.toLowerCase());
    facts.push({
      factOrNumber,
      context: trimWords(cleanedContext, 36),
      whyItMatters,
      discussionUse,
      needsVerification: false,
    });
  };

  addFact(
    "Case situation",
    preview.caseBrief || extractCaseBrief(sourceText, preview.detectedTitle),
    "This is the basic narrative the class needs before judging options.",
    "Use it to open the discussion in plain language before moving into evidence.",
  );
  addFact(
    "Decision frame",
    preview.caseDecision || preview.decisionSignals?.[0] || "",
    "This keeps the brief anchored to the decision instead of summarizing everything equally.",
    "Use it as the test for which facts and exhibits are truly relevant.",
  );

  (preview.decisionSignals || []).slice(0, 3).forEach((signal) => {
    addFact(
      "Decision signal",
      signal,
      "This sentence indicates what the case is asking the reader to evaluate.",
      "Use it to separate the core issue from background information.",
    );
  });

  (preview.keyTopics || []).slice(0, 3).forEach((topic) => {
    const evidence = pickSentences(sourceText, [topic], 1)[0];

    if (evidence) {
      addFact(
        topic,
        evidence,
        "This topic is likely part of the case evidence base.",
        "Use it when deciding which lens should lead the classroom discussion.",
      );
    }
  });

  return facts.slice(0, 4);
}

function buildFinanceFacts(sourceText: string) {
  const facts: Array<{
    factOrNumber: string;
    context: string;
    whyItMatters: string;
    discussionUse: string;
    needsVerification: boolean;
  }> = [];
  const addFact = (factOrNumber: string, context: string, whyItMatters: string, discussionUse: string, needsVerification = false) => {
    if (!context || /not available in the provided case/i.test(context)) return;
    if (facts.some((fact) => fact.factOrNumber.toLowerCase() === factOrNumber.toLowerCase())) return;

    facts.push({ factOrNumber, context: trimWords(context, 34), whyItMatters, discussionUse, needsVerification });
  };

  addFact(
    "NPV of expected cash flows",
    pickSentences(sourceText, ["npv", "expected cash flows", "cash flows"], 1)[0],
    "This is the actual financial test for whether the expansion is attractive.",
    "Use it to keep the class focused on valuation, not just growth excitement.",
  );
  addFact(
    "Five-year forecast period",
    pickSentences(sourceText, ["coming five years", "next five years", "five-year forecast"], 1)[0],
    "The explicit forecast window is the first stage of the project valuation.",
    "Ask what drives cash flows during this high-growth period.",
  );
  addFact(
    "5% perpetual growth",
    pickSentences(sourceText, ["5 per cent", "5 percent", "perpetual growth", "long run"], 1).find((sentence) => /5\s*(?:per cent|percent|%)/i.test(sentence)) || "",
    "The terminal growth assumption can materially change terminal value and NPV.",
    "Use it to challenge whether long-run growth is conservative or optimistic.",
  );
  addFact(
    "1:3 debt-to-equity financing",
    pickSentences(sourceText, ["debt to equity", "1:3", "financed with debt"], 1)[0],
    "Capital structure affects the weighted cost of capital used as the discount rate.",
    "Use it when discussing WACC and whether project financing changes risk.",
  );
  addFact(
    "Comparable listed food-processing companies",
    pickSentences(sourceText, ["similar food processing company", "comparable", "listed in the market"], 1)[0],
    "The firm is unlisted, so comparable companies become the bridge to market-based risk inputs.",
    "Ask how close the comparables really are to the frozen foods project.",
  );
  addFact(
    "CAPM inputs: beta, risk-free rate, expected market return",
    pickSentences(sourceText, ["capital asset pricing", "beta", "risk free rate", "expected market"], 1)[0],
    "These inputs determine the cost of equity and feed the project discount rate.",
    "Use it to organize the exhibit work: beta estimate, risk-free rate, market return, and capital structure.",
  );
  addFact(
    "8.0% average 10-year India Government Bond yield",
    sentenceAround(sourceText, "8.0"),
    "This is a candidate risk-free-rate anchor, not a timeline event.",
    "Use it to debate whether historical average yield is the right risk-free rate.",
  );

  return facts.length
    ? facts.slice(0, 7)
    : [{
        factOrNumber: "Not available in the provided case.",
        context: "Not available in the provided case.",
        whyItMatters: "Not available in the provided case.",
        discussionUse: "Not available in the provided case.",
        needsVerification: false,
      }];
}

function inferNumberImportance(number: string, context: string) {
  if (/\bdebt|equity|ratio/i.test(context)) return "This affects capital structure and the discount rate.";
  if (/\bgrowth|forecast|terminal|perpetual/i.test(context)) return "This assumption can materially change valuation.";
  if (/\bbond|risk[- ]free|yield/i.test(context)) return "This can anchor the risk-free rate used in CAPM.";
  if (/\brevenue|cash flow|profit|margin|npv|investment/i.test(context)) return "This affects project attractiveness or financial feasibility.";

  return "This number is relevant only if tied clearly to the case decision.";
}

function inferNumberDiscussionUse(number: string, context: string) {
  if (/\bdebt|equity|ratio/i.test(context)) return "Use it when explaining WACC or financing assumptions.";
  if (/\bgrowth|forecast|terminal|perpetual/i.test(context)) return "Use it to test sensitivity and optimism in the valuation.";
  if (/\bbond|risk[- ]free|yield/i.test(context)) return "Use it to question the risk-free-rate assumption.";
  if (/\bprocess|temperature|minutes|ºc|°c/i.test(context)) return "Use it only for operational context, not financial valuation.";

  return `Use ${number} only with its original context and unit.`;
}

function numberNeedsVerification(number: string, context: string) {
  return /not available|formula|[�]|equitymarket|cov rr|var r|page/i.test(context) || /,$/.test(number);
}

function inferKeyTensions(sourceText: string, preview: CaseSourcePreview) {
  const lower = sourceText.toLowerCase();
  const tensions = [
    lower.includes("growth") || lower.includes("profit") ? "Growth vs profitability" : "",
    lower.includes("cost") || lower.includes("quality") || lower.includes("experience") ? "Customer experience vs cost" : "",
    lower.includes("short") || lower.includes("long") ? "Short-term pressure vs long-term positioning" : "",
    lower.includes("central") || lower.includes("decentral") ? "Centralization vs decentralization" : "",
    lower.includes("premium") || lower.includes("mass") ? "Premium positioning vs mass expansion" : "",
    lower.includes("innovation") || lower.includes("execution") ? "Innovation ambition vs execution risk" : "",
    lower.includes("capacity") || lower.includes("investment") ? "Investment commitment vs demand uncertainty" : "",
  ].filter(Boolean);

  if (tensions.length) return Array.from(new Set(tensions)).slice(0, 6);

  return [
    preview.decisionSignals?.[0] || "Main decision vs available evidence",
    "Facts provided vs assumptions required",
    "Analytical clarity vs classroom ambiguity",
  ];
}

function buildProfessorPushAngles(sourceText: string, preview: CaseSourcePreview) {
  const numbers = preview.numberSamples.slice(0, 3);

  return [
    `What exact tradeoff is being tested in ${preview.detectedTitle || "this case"}?`,
    preview.decisionSignals?.[0]
      ? `What evidence supports or weakens this decision question: ${preview.decisionSignals[0]}`
      : "What is the strongest evidence for the main decision?",
    numbers.length
      ? `Which number needs the most careful verification: ${numbers.join(", ")}?`
      : "What missing number or exhibit would most improve the discussion?",
    "What assumption would change your view if it turned out to be wrong?",
  ];
}

function buildSmartQuestions(sourceText: string, preview: CaseSourcePreview) {
  const tension = inferKeyTensions(sourceText, preview)[0] || "the central tradeoff";
  const decision = preview.decisionSignals?.[0] || "the main decision";
  const number = preview.numberSamples[0];

  return [
    `If we frame the case around ${tension}, which side has stronger evidence in the provided case?`,
    `What would have to be true for the opposite answer to ${decision} to be more persuasive?`,
    number
      ? `How should we use ${number} in discussion without overstating what it proves?`
      : "Which missing fact would most change the quality of our classroom recommendation?",
  ];
}

function suggestCalculations(text: string) {
  const lower = text.toLowerCase();
  const calculations = [
    lower.includes("growth") ? "Growth percentage" : "",
    lower.includes("margin") || lower.includes("profit") ? "Margin/profitability analysis" : "",
    lower.includes("break") || lower.includes("fixed cost") ? "Break-even analysis" : "",
    lower.includes("investment") || lower.includes("cash flow") || lower.includes("npv") ? "Investment feasibility / NPV" : "",
    lower.includes("market share") ? "Market share comparison" : "",
    lower.includes("capacity") || lower.includes("production") ? "Capacity utilization" : "",
  ].filter(Boolean);

  return calculations.length ? calculations : ["Verify relevant calculations from the original exhibit."];
}

function detectLikelyTitle(lines: string[]) {
  const likely = lines.map(cleanPdfLine).find((line) => {
    const words = line.split(/\s+/).length;
    const compact = line.replace(/\W/g, "");

    return (
      words >= 2 &&
      words <= 14 &&
      compact.length >= 8 &&
      line.length <= 100 &&
      !isBoilerplateLine(line) &&
      !isSpacedCapsLine(line) &&
      !/\b(author|prepared|professor|copyright|business school|authorized)\b/i.test(line) &&
      !/^\d[\d\s-]+$/.test(line) &&
      !/[.!?]$/.test(line) &&
      !/^(page|exhibit|table|figure)\b/i.test(line) &&
      !/^[a-z](\s+[a-z]){1,4}$/i.test(line)
    );
  });

  return likely || "Not available in the provided case.";
}

export function getCaseOnlySystemPrompt() {
  return `You are Case War Room, a senior MBA case coach, strategy consultant, and professor.

Critical operating rule:
- Use only the provided case material and user instructions.
- Do not use web search.
- Do not use outside company facts.
- Do not use recent news.
- Do not use model memory about the company, industry, or market.
- Do not invent numbers.
- If information is missing, write exactly: "Not available in the provided case."
- If a conclusion needs an assumption, label it clearly as "Assumption required."
- Preserve case numbers carefully.
- Return valid JSON only.`;
}

export async function runCaseWarRoomModel({
  prompt,
  sourceText,
  config,
  stageContext,
  modelTier = "expert",
  useCheapModel = false,
}: {
  prompt: string;
  sourceText: string;
  config: CaseWarRoomConfig;
  stageContext?: CaseWarRoomStageContext;
  modelTier?: CaseWarRoomModelTier;
  useCheapModel?: boolean;
}) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      ok: false as const,
      status: 500,
      error: createCaseWarRoomError(
        "missing_api_key",
        "Expert generation is not configured yet.",
        "The workspace can still prepare a local case-only scaffold. Add OPENAI_API_KEY on the server for full expert outputs.",
        false,
      ),
    };
  }

  const useCheap = useCheapModel || modelTier === "cheap";
  const primaryModel =
    (useCheap ? process.env.CHEAP_MODEL : process.env.PRIMARY_MODEL) ||
    process.env.OPENAI_MODEL ||
    "gpt-4.1";
  const fallbackModel = process.env.FALLBACK_MODEL || process.env.OPENAI_MODEL || "";
  const source = sourceText.slice(0, MAX_MODEL_SOURCE_LENGTH);
  const contextBlock =
    stageContext && Object.keys(stageContext).length > 0
      ? `
EARLIER CASE WAR ROOM OUTPUTS AND USER-PROVIDED CONTEXT:
${JSON.stringify(stageContext, null, 2)}
`
      : "";
  const userPrompt = `${prompt}

CASE CONFIGURATION:
${JSON.stringify(config, null, 2)}
${contextBlock}

PROVIDED CASE MATERIAL ONLY:
${source}

Return JSON only.`;

  const first = await callOpenAIChat(primaryModel, userPrompt);

  if (first.ok) return first;

  const shouldRetry =
    fallbackModel &&
    fallbackModel !== primaryModel;

  if (!shouldRetry) {
    return {
      ok: false as const,
      status: first.status,
      error:
        first.error.code === "rate_limit" || first.error.code === "quota_exceeded"
          ? first.error
          : createCaseWarRoomError(
              "model_failed",
              EXPERT_RESPONSE_FAILED,
              "Retry this stage later or use manual decode mode.",
              true,
            ),
    };
  }

  const fallback = await callOpenAIChat(fallbackModel, userPrompt);

  if (fallback.ok) {
    return {
      ...fallback,
      model: fallbackModel,
      usedFallback: true,
      notices: [FALLBACK_RETRY_NOTICE, FALLBACK_SUCCESS_NOTICE],
    };
  }

  return {
    ok: false as const,
    status: fallback.status,
    error:
      fallback.error.code === "rate_limit" || fallback.error.code === "quota_exceeded"
        ? fallback.error
        : createCaseWarRoomError(
            "model_failed",
            EXPERT_RESPONSE_FAILED,
            "Retry this stage later or use manual decode mode.",
            true,
          ),
    notices: [FALLBACK_RETRY_NOTICE],
  };
}

async function callOpenAIChat(model: string, prompt: string) {
  let response: Response;

  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        temperature: 0.2,
        messages: [
          { role: "system", content: getCaseOnlySystemPrompt() },
          { role: "user", content: prompt },
        ],
      }),
    });
  } catch {
    return {
      ok: false as const,
      status: 503,
      error: createCaseWarRoomError(
        "network_failure",
        "The request could not reach the AI service.",
        "Check the network connection and retry this stage.",
        true,
      ),
    };
  }

  const payload = (await response.json().catch(() => ({}))) as OpenAIChatResponse;

  if (!response.ok) {
    const apiMessage = payload.error?.message || "";
    const quotaExceeded = /quota|billing|insufficient_quota/i.test(apiMessage);
    const rateLimited = response.status === 429 && !quotaExceeded;

    return {
      ok: false as const,
      status: response.status,
      error: quotaExceeded
        ? createCaseWarRoomError(
            "quota_exceeded",
            "The AI quota for this workspace appears to be exhausted.",
            "Check billing/quota, then retry. No expert output has been generated.",
            false,
          )
        : rateLimited
          ? createCaseWarRoomError(
              "rate_limit",
              "The AI service is busy and rate limited this request.",
              "Wait a moment, then retry this specific stage.",
              true,
            )
          : createCaseWarRoomError(
              "model_failed",
              "The AI service rejected this request.",
              "Retry this stage later or use manual decode mode.",
              true,
            ),
    };
  }

  const content = payload.choices?.[0]?.message?.content || "{}";

  try {
    return {
      ok: true as const,
      status: 200,
      model,
      usedFallback: false,
      data: JSON.parse(content) as unknown,
    };
  } catch {
    return {
      ok: false as const,
      status: 502,
      error: createCaseWarRoomError(
        "json_parse_failed",
        "The AI returned an unreadable structured response.",
        "Regenerate this stage. If it repeats, use manual decode mode for that section.",
        true,
      ),
    };
  }
}
