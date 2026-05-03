import { uploadJson } from "../storage/zero-g";
import { buildDeterministicReview } from "./rules";
import type { AgentReviewProvider, MilestoneReview, MilestoneReviewInput, StoredMilestoneReview } from "./types";

export type ReviewEngineOptions = {
  provider?: AgentReviewProvider;
  persist?: typeof uploadJson;
};

export async function reviewMilestoneEvidence(
  input: MilestoneReviewInput,
  options: ReviewEngineOptions = {}
): Promise<StoredMilestoneReview> {
  const draft = buildDeterministicReview(input);
  const review = await applyProviderReview(input, draft, options.provider);
  const persist = options.persist ?? uploadJson;
  const stored = await persist(buildReviewArtifactName(input), {
    type: "taskloop.milestoneReview",
    input,
    review
  });

  return {
    review,
    rootHash: stored.rootHash,
    txHash: stored.txHash,
    txUrl: stored.txUrl
  };
}

async function applyProviderReview(
  input: MilestoneReviewInput,
  draft: MilestoneReview,
  provider?: AgentReviewProvider
): Promise<MilestoneReview> {
  if (!provider) {
    return draft;
  }

  const providerPatch = await provider.reviewMilestoneEvidence(input, draft);

  return {
    ...draft,
    ...providerPatch,
    confidence: clampConfidence(providerPatch.confidence ?? draft.confidence),
    reasons: providerPatch.reasons?.length ? providerPatch.reasons : draft.reasons,
    generatedAt: providerPatch.generatedAt ?? new Date().toISOString()
  };
}

function buildReviewArtifactName(input: MilestoneReviewInput): string {
  return `review-${input.escrow.escrowId}-${input.milestone.milestoneId}`;
}

function clampConfidence(confidence: number): number {
  return Math.min(Math.max(confidence, 0), 1);
}

export type {
  AgentReviewProvider,
  MilestoneReview,
  MilestoneReviewInput,
  RecommendedAction,
  ReviewEscrowMetadata,
  ReviewMilestoneMetadata,
  ReviewVerdict,
  StoredMilestoneReview
} from "./types";
