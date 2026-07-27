export type TopicCandidate = {
  topic: string;
  angle: string;
  timeliness: number;
  audienceRelevance: number;
  nonObviousness: number;
  engagementPotential: number;
  journalDepthPotential: number;
  personalBrandFit: number;
  riskLevel: "low" | "medium" | "high";
  totalScore: number;
};

export type AutomationSource = {
  title: string;
  url: string;
  publisher?: string;
  claimSupported?: string;
};

export type ContentQualityScores = {
  eyebrowRaise: number;
  novelty: number;
  intellectualTension: number;
  reflection: number;
  commentPotential: number;
  memorability: number;
  mbaDepth: number;
  humanness: number;
  escalation: number;
  shareability: number;
  insightDensity: number;
  contrarianStrength: number;
  frameworkQuality: number;
  evidenceCredibility: number;
  boardroomRelevance: number;
  discussionLongevity: number;
  quoteability: number;
  patternRecognition: number;
  perspectiveShift: number;
  neverThoughtThatWay: number;
};

export type LinkedInAutomationRun = {
  id: string;
  cycleType: "tuesday_market" | "thursday_reflection";
  topic: string;
  selectedWhy: string;
  riskLevel: "low" | "medium" | "high";
  journalTitle: string;
  journalSlug: string;
  journalUrl: string;
  journalPreview?: string;
  journalPath: string;
  linkedinDraftPath: string;
  linkedinDraft: string;
  predictedPostAt: string;
  createdAt: string;
  expiresAt: string;
  status:
    | "pending_review"
    | "pending_approval"
    | "regenerated"
    | "rejected"
    | "journal_approved"
    | "journal_published"
    | "linkedin_manual_ready"
    | "failed";
  candidateTopics: TopicCandidate[];
  sourceLinks: AutomationSource[];
  qualityScores?: ContentQualityScores;
  scores: {
    linkedinFinal: number;
    journalQuality: number;
    risk: number;
  };
  approvalEmailSentAt?: string;
  approvalTokenHash?: string;
  rejectTokenHash?: string;
  approvedAt?: string;
  journalApprovedAt?: string;
  journalPublishedAt?: string;
  rejectedAt?: string;
  linkedinManualReadyAt?: string;
  finalLinkedInDraft?: string;
  failureReason?: string;
  performanceEmailSentAt?: string;
};

export type AutomationConfigStatus = {
  canSendEmail: boolean;
  canUseApprovalTokens: boolean;
  canPersistApprovalState: boolean;
  canPublishJournalAutomatically: boolean;
  canPostToLinkedIn: boolean;
  missing: string[];
};
