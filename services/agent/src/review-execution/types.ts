import type { MilestoneExecutionResult, MilestoneReleaseInput } from "../execution";
import type { MilestoneReviewInput, StoredMilestoneReview } from "../review";

export type ReviewExecutionInput = MilestoneReviewInput & {
  release?: Omit<MilestoneReleaseInput, "reason"> & {
    reason?: string;
  };
};

export type ReviewExecutionStatus = "executed" | "skipped";

export type ReviewExecutionDecision = {
  status: ReviewExecutionStatus;
  threshold: number;
  reason: string;
  execution?: MilestoneExecutionResult;
  rootHash: string;
  txHash?: string;
};

export type ReviewExecutionResponse = StoredMilestoneReview & {
  execution: ReviewExecutionDecision;
};
