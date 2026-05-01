import type { MilestoneReview, MilestoneReviewInput, RecommendedAction, ReviewVerdict } from "./types";

type RuleSignal = {
  passed: boolean;
  reason: string;
  weight: number;
};

const evidenceUriPattern = /^(ipfs:\/\/|ar:\/\/|https?:\/\/|0x[a-fA-F0-9]{32,}|sha256:|bafy)/;
const weakEvidenceTerms = ["todo", "placeholder", "draft only", "not finished", "will upload"];
const strongEvidenceTerms = ["deployment", "commit", "screenshot", "test", "loom", "report", "artifact", "ipfs", "sha256"];

export function buildDeterministicReview(input: MilestoneReviewInput): MilestoneReview {
  const evidence = input.evidenceUri.trim();
  const notes = input.freelancerNotes?.trim() ?? "";
  const combinedText = `${evidence} ${notes}`.toLowerCase();
  const signals = buildSignals(input, combinedText);
  const score = signals.reduce((total, signal) => total + (signal.passed ? signal.weight : -signal.weight), 0);
  const confidence = clamp(0.5 + score, 0.18, 0.95);
  const verdict = chooseVerdict(confidence, signals);
  const recommendedAction = chooseRecommendedAction(verdict);
  const reasons = signals.map((signal) => `${signal.passed ? "Pass" : "Flag"}: ${signal.reason}`);

  return {
    verdict,
    confidence: Number(confidence.toFixed(2)),
    summary: buildSummary(input, verdict, confidence),
    reasons,
    recommendedAction,
    generatedAt: new Date().toISOString()
  };
}

function buildSignals(input: MilestoneReviewInput, combinedText: string): RuleSignal[] {
  return [
    {
      passed: input.evidenceUri.trim().length >= 12,
      reason: "Evidence reference is specific enough to inspect.",
      weight: 0.16
    },
    {
      passed: evidenceUriPattern.test(input.evidenceUri.trim()),
      reason: "Evidence uses a recognizable URI, hash, or content-addressed format.",
      weight: 0.18
    },
    {
      passed: Boolean(input.freelancerNotes && input.freelancerNotes.trim().split(/\s+/).length >= 6),
      reason: "Freelancer notes provide review context.",
      weight: 0.12
    },
    {
      passed: strongEvidenceTerms.some((term) => combinedText.includes(term)),
      reason: "Evidence mentions concrete deliverables such as tests, commits, reports, or deployments.",
      weight: 0.12
    },
    {
      passed: !weakEvidenceTerms.some((term) => combinedText.includes(term)),
      reason: "Evidence does not contain obvious incomplete-work language.",
      weight: 0.18
    },
    {
      passed: input.milestone.title.trim().length > 0 && input.escrow.title.trim().length > 0,
      reason: "Escrow and milestone metadata are present.",
      weight: 0.08
    }
  ];
}

function chooseVerdict(confidence: number, signals: RuleSignal[]): ReviewVerdict {
  const failedCriticalSignal = signals.some((signal) => !signal.passed && signal.weight >= 0.18);

  if (confidence >= 0.76 && !failedCriticalSignal) {
    return "approve";
  }

  if (confidence <= 0.38 || failedCriticalSignal) {
    return "reject";
  }

  return "needs_review";
}

function chooseRecommendedAction(verdict: ReviewVerdict): RecommendedAction {
  if (verdict === "approve") {
    return "release";
  }

  if (verdict === "reject") {
    return "dispute_review";
  }

  return "request_more_info";
}

function buildSummary(input: MilestoneReviewInput, verdict: ReviewVerdict, confidence: number): string {
  return `Review for "${input.milestone.title}" on "${input.escrow.title}" produced verdict "${verdict}" with ${Math.round(
    confidence * 100
  )}% confidence based on evidence format, context, and completion signals.`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
