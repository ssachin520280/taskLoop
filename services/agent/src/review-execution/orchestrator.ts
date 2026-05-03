import { createExecutionProvider, type ExecutionProvider, type MilestoneReleaseInput } from "../execution";
import { reviewMilestoneEvidence, type AgentReviewProvider } from "../review";
import { uploadJson } from "../storage/zero-g";
import type { ReviewExecutionDecision, ReviewExecutionInput, ReviewExecutionResponse } from "./types";

export type ReviewExecutionOptions = {
  reviewProvider?: AgentReviewProvider;
  executionProvider?: ExecutionProvider;
  confidenceThreshold?: number;
  persist?: typeof uploadJson;
};

export async function reviewAndExecuteMilestoneRelease(
  input: ReviewExecutionInput,
  options: ReviewExecutionOptions = {}
): Promise<ReviewExecutionResponse> {
  const persist = options.persist ?? uploadJson;
  const storedReview = await reviewMilestoneEvidence(input, {
    provider: options.reviewProvider,
    persist
  });
  const threshold = options.confidenceThreshold ?? readReleaseConfidenceThreshold();
  const execution = await buildExecutionDecision(input, storedReview, threshold, options.executionProvider, persist);

  return {
    ...storedReview,
    execution
  };
}

async function buildExecutionDecision(
  input: ReviewExecutionInput,
  storedReview: Awaited<ReturnType<typeof reviewMilestoneEvidence>>,
  threshold: number,
  executionProvider: ExecutionProvider | undefined,
  persist: typeof uploadJson
): Promise<ReviewExecutionDecision> {
  const release = prepareReleaseExecution(input, storedReview, threshold);

  if (!release.ready) {
    return persistExecutionLog(input, storedReview, threshold, release.reason, undefined, persist);
  }

  const provider = executionProvider ?? createExecutionProvider();
  const execution = await provider.executeMilestoneRelease(release.input);

  return persistExecutionLog(input, storedReview, threshold, release.reason, execution, persist);
}

function prepareReleaseExecution(
  input: ReviewExecutionInput,
  storedReview: Awaited<ReturnType<typeof reviewMilestoneEvidence>>,
  threshold: number
): { ready: true; reason: string; input: MilestoneReleaseInput } | { ready: false; reason: string } {
  const { review } = storedReview;

  if (review.verdict !== "approve") {
    return { ready: false, reason: `Review verdict is ${review.verdict}, so release execution was skipped.` };
  }

  if (review.confidence < threshold) {
    return {
      ready: false,
      reason: `Review confidence ${review.confidence} is below release threshold ${threshold}.`
    };
  }

  if (!input.release) {
    return { ready: false, reason: "Release execution details were not supplied." };
  }

  const reason =
    input.release.reason ??
    `Agent review approved milestone ${input.milestone.milestoneId} with ${Math.round(review.confidence * 100)}% confidence.`;

  return {
    ready: true,
    reason,
    input: {
      ...input.release,
      reason
    }
  };
}

async function persistExecutionLog(
  input: ReviewExecutionInput,
  storedReview: Awaited<ReturnType<typeof reviewMilestoneEvidence>>,
  threshold: number,
  reason: string,
  execution: Awaited<ReturnType<ExecutionProvider["executeMilestoneRelease"]>> | undefined,
  persist: typeof uploadJson
): Promise<ReviewExecutionDecision> {
  const status = execution ? "executed" : "skipped";
  const storedLog = await persist(buildExecutionArtifactName(input), {
    type: "taskloop.milestoneReleaseExecution",
    status,
    threshold,
    reason,
    review: storedReview.review,
    reviewRootHash: storedReview.rootHash,
    release: input.release,
    execution: execution
      ? {
          status: execution.status,
          txHash: execution.txHash,
          provider: execution.provider,
          explorerUrl: execution.explorerUrl
        }
      : undefined
  });

  return {
    status,
    threshold,
    reason,
    execution,
    rootHash: storedLog.rootHash,
    txHash: storedLog.txHash,
    txUrl: storedLog.txUrl
  };
}

function buildExecutionArtifactName(input: ReviewExecutionInput): string {
  return `execution-${input.escrow.escrowId}-${input.milestone.milestoneId}`;
}

function readReleaseConfidenceThreshold(): number {
  const rawThreshold = Number(process.env.TASKLOOP_RELEASE_CONFIDENCE_THRESHOLD ?? 0.85);

  if (Number.isNaN(rawThreshold)) {
    return 0.85;
  }

  return Math.min(Math.max(rawThreshold, 0), 1);
}
