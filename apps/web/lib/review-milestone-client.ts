export type ReviewVerdict = "approve" | "needs_review" | "reject";

export type RecommendedAction = "release" | "request_more_info" | "dispute_review";

export type ReleaseExecutionStatus = "queued" | "submitted" | "confirmed" | "failed";

export type MilestoneReviewRequest = {
  escrow: {
    escrowId: string;
    title: string;
    description?: string;
    client?: string;
    freelancer?: string;
  };
  milestone: {
    milestoneId: string;
    title: string;
    description?: string;
    amountEth?: string;
    amountWei?: string;
    dueDate?: string;
  };
  evidenceUri: string;
  freelancerNotes?: string;
  release?: {
    chainId: number;
    escrowAddress: `0x${string}`;
    milestoneId: string;
    amount: string;
    reason?: string;
  };
};

export type MilestoneReviewResult = {
  review: {
    verdict: ReviewVerdict;
    confidence: number;
    summary: string;
    reasons: string[];
    recommendedAction: RecommendedAction;
    generatedAt: string;
  };
  rootHash: string;
  txHash: string;
  txUrl: string;
  execution: {
    status: "executed" | "skipped";
    threshold: number;
    reason: string;
    execution?: {
      status: ReleaseExecutionStatus;
      txHash?: `0x${string}`;
      provider: string;
      explorerUrl?: string;
      rawResponse: unknown;
    };
    rootHash: string;
    txHash: string;
    txUrl: string;
  };
};

export async function requestMilestoneReview(input: MilestoneReviewRequest): Promise<MilestoneReviewResult> {
  const response = await fetch("/api/review-milestone", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(input)
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(typeof body?.error === "string" ? body.error : "Agent review failed");
  }

  return body as MilestoneReviewResult;
}
