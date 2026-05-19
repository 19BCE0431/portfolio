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

export type LinkedInAutomationRun = {
  id: string;
  topic: string;
  selectedWhy: string;
  riskLevel: "low" | "medium" | "high";
  journalTitle: string;
  journalSlug: string;
  journalUrl: string;
  journalPath: string;
  linkedinDraftPath: string;
  linkedinDraft: string;
  predictedPostAt: string;
  createdAt: string;
  expiresAt: string;
  status: "pending_approval" | "approved" | "rejected" | "posted" | "blocked" | "failed";
  candidateTopics: TopicCandidate[];
  sourceLinks: AutomationSource[];
  scores: {
    linkedinFinal: number;
    journalQuality: number;
    risk: number;
  };
  approvalEmailSentAt?: string;
  approvalTokenHash?: string;
  rejectTokenHash?: string;
  approvedAt?: string;
  rejectedAt?: string;
  postedAt?: string;
  linkedInPostId?: string;
  linkedInPostUrl?: string;
  postingBlockedReason?: string;
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
