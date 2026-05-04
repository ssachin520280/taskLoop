import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { VerificationLink } from "@/components/escrow/verification-link";
import type { Escrow } from "@/lib/escrow";
import type { MilestoneReviewResult } from "@/lib/review-milestone-client";

export function AgentReviewPanel({
  escrow,
  reviews,
  reviewingMilestoneId
}: {
  escrow: Escrow;
  reviews: Record<string, MilestoneReviewResult>;
  reviewingMilestoneId?: string;
}) {
  const reviewedMilestones = escrow.milestones
    .map((milestone) => ({ milestone, result: reviews[milestone.id] }))
    .filter((item): item is { milestone: Escrow["milestones"][number]; result: MilestoneReviewResult } => Boolean(item.result));
  const latestReview = reviewedMilestones.at(-1);
  const confidence = latestReview ? Math.round(latestReview.result.review.confidence * 100) : undefined;
  const statusLabel = reviewingMilestoneId ? "Reviewing..." : confidence === undefined ? "Waiting for review" : `${confidence}% confidence`;
  const tone = getTone(latestReview?.result.review.verdict, Boolean(reviewingMilestoneId));

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-black text-[var(--ink)]">Agent review</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Review each milestone after evidence is submitted. Results are stored on 0G.
        </p>
      </CardHeader>
      <CardContent>
        <div className={`inline-flex rounded-full px-4 py-2 text-sm font-black ${tone}`}>{statusLabel}</div>
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
          {latestReview
            ? latestReview.result.review.summary
            : "Submit evidence on a milestone, then request agent review from that milestone card."}
        </p>
        <div className="mt-5 grid gap-3">
          {escrow.milestones.map((milestone) => (
            <MilestoneReviewRow
              key={milestone.id}
              title={milestone.title}
              hasEvidence={milestone.evidence.length > 0}
              isReviewing={reviewingMilestoneId === milestone.id}
              result={reviews[milestone.id]}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MilestoneReviewRow({
  title,
  hasEvidence,
  isReviewing,
  result
}: {
  title: string;
  hasEvidence: boolean;
  isReviewing: boolean;
  result?: MilestoneReviewResult;
}) {
  const confidence = result ? Math.round(result.review.confidence * 100) : undefined;

  return (
    <div className="rounded-2xl bg-[#fff7df] p-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-bold text-[var(--ink)]">{title}</p>
        {confidence === undefined ? null : (
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-black ${getTone(result?.review.verdict, false)}`}>
            {confidence}%
          </span>
        )}
      </div>
      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{getRowStatus(hasEvidence, isReviewing, result)}</p>
      {result ? (
        <div className="mt-2">
          <VerificationLink label="Review root" value={result.rootHash} />
        </div>
      ) : null}
    </div>
  );
}

function getRowStatus(hasEvidence: boolean, isReviewing: boolean, result: MilestoneReviewResult | undefined): string {
  if (result) {
    return `${result.review.verdict.replace("_", " ")} - ${result.review.recommendedAction.replaceAll("_", " ")}`;
  }

  if (isReviewing) {
    return "Agent review is running.";
  }

  return hasEvidence ? "Evidence submitted. Ready for client review request." : "Waiting for freelancer evidence.";
}

function getTone(verdict: MilestoneReviewResult["review"]["verdict"] | undefined, isReviewing: boolean): string {
  if (isReviewing) {
    return "bg-blue-50 text-blue-800";
  }

  if (verdict === "approve") {
    return "bg-emerald-50 text-emerald-800";
  }

  if (verdict === "reject") {
    return "bg-red-50 text-red-800";
  }

  return "bg-yellow-100 text-yellow-900";
}

