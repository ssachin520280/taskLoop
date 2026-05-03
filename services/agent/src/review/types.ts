export type ReviewVerdict = "approve" | "needs_review" | "reject";

export type RecommendedAction = "release" | "request_more_info" | "dispute_review";

export type ReviewEscrowMetadata = {
  escrowId: string;
  title: string;
  description?: string;
  client?: string;
  freelancer?: string;
};

export type ReviewMilestoneMetadata = {
  milestoneId: string;
  title: string;
  description?: string;
  amountEth?: string;
  dueDate?: string;
};

export type MilestoneReviewInput = {
  escrow: ReviewEscrowMetadata;
  milestone: ReviewMilestoneMetadata;
  evidenceUri: string;
  freelancerNotes?: string;
};

export type MilestoneReview = {
  verdict: ReviewVerdict;
  confidence: number;
  summary: string;
  reasons: string[];
  recommendedAction: RecommendedAction;
  generatedAt: string;
};

export type StoredMilestoneReview = {
  review: MilestoneReview;
  rootHash: string;
  txHash: string;
  txUrl: string;
};

export type AgentReviewProvider = {
  name: string;
  reviewMilestoneEvidence: (input: MilestoneReviewInput, draft: MilestoneReview) => Promise<Partial<MilestoneReview>>;
};
