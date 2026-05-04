"use client";

import { useState } from "react";
import { VerificationLink } from "@/components/escrow/verification-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import type { EvidenceItem, Milestone, MilestoneStatus } from "@/lib/escrow";
import { formatEth } from "@/lib/escrow";
import type { MilestoneReviewResult } from "@/lib/review-milestone-client";

export function MilestoneWorkflowCard({
  milestone,
  index,
  review,
  isReviewing,
  onSubmitEvidence,
  onApprove,
  onRelease,
  onDispute,
  onRequestReview
}: {
  milestone: Milestone;
  index: number;
  review?: MilestoneReviewResult;
  isReviewing?: boolean;
  onSubmitEvidence: (milestoneId: string, label: string) => void;
  onApprove: (milestoneId: string) => void;
  onRelease: (milestoneId: string) => void;
  onDispute: (milestoneId: string) => void;
  onRequestReview: (milestoneId: string, notes?: string) => void;
}) {
  const [evidenceLabel, setEvidenceLabel] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const canSubmit = milestone.status === "active" || milestone.status === "pending";
  const canApprove = milestone.status === "submitted";
  const canRelease = milestone.status === "approved";
  const canDispute = milestone.status === "submitted" || milestone.status === "active";
  const hasEvidence = milestone.evidence.length > 0;

  return (
    <Card className={milestone.status === "disputed" ? "border-red-200 bg-red-50/60" : undefined}>
      <CardContent className="grid gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-black text-[var(--ink)]">
              {index + 1}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-black text-[var(--ink)]">{milestone.title}</h3>
                <StatusBadge status={milestone.status} />
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Due {milestone.dueDate} - {formatEth(milestone.amountWei)}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{milestone.agentNote}</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--muted)]">Amount</p>
            <p className="mt-1 text-2xl font-black text-[var(--ink)]">{formatEth(milestone.amountWei)}</p>
          </div>
        </div>

        <EvidenceList evidence={milestone.evidence} />
        <StoredRootList milestone={milestone} />
        {review ? <ReviewResult result={review} /> : null}

        <div className="grid gap-3 rounded-2xl border border-dashed border-stone-300 bg-white/70 p-4">
          <textarea
            className="field-input min-h-20"
            placeholder="Paste evidence URI, commit hash, or demo note..."
            value={evidenceLabel}
            disabled={!canSubmit}
            onChange={(event) => setEvidenceLabel(event.target.value)}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[var(--muted)]">Actions submit wallet transactions to the escrow contract.</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={!canSubmit || evidenceLabel.trim().length === 0}
                onClick={() => {
                  onSubmitEvidence(milestone.id, evidenceLabel);
                  setEvidenceLabel("");
                }}
              >
                Submit evidence
              </Button>
              <Button type="button" disabled={!canApprove} onClick={() => onApprove(milestone.id)}>
                Approve
              </Button>
              <Button type="button" variant="yellow" disabled={!canRelease} onClick={() => onRelease(milestone.id)}>
                Release
              </Button>
              <Button type="button" variant="ghost" disabled={!canDispute} onClick={() => onDispute(milestone.id)}>
                Dispute
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[#fff7df] p-4">
          <div>
            <p className="text-sm font-black text-[var(--ink)]">Agent review orchestration</p>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
              Sends milestone metadata and the latest evidence reference to the secure API route, then persists the final review to 0G.
            </p>
          </div>
          <textarea
            className="field-input min-h-16"
            placeholder="Optional reviewer notes for the agent..."
            value={reviewNotes}
            onChange={(event) => setReviewNotes(event.target.value)}
          />
          <Button
            type="button"
            variant="yellow"
            disabled={!hasEvidence || isReviewing}
            onClick={() => onRequestReview(milestone.id, reviewNotes)}
          >
            {isReviewing ? "Reviewing..." : "Request agent review"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function nextMilestoneStatusAfterEvidence(status: MilestoneStatus): MilestoneStatus {
  return status === "pending" || status === "active" ? "submitted" : status;
}

function ReviewResult({ result }: { result: MilestoneReviewResult }) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-black capitalize text-emerald-950">{result.review.verdict.replace("_", " ")}</p>
        <p className="text-xs font-bold text-emerald-800">{Math.round(result.review.confidence * 100)}% confidence</p>
      </div>
      <p className="mt-2 text-sm leading-6 text-emerald-900">{result.review.summary}</p>
      <div className="mt-3 grid gap-1">
        {result.review.reasons.map((reason) => (
          <p key={reason} className="text-xs text-emerald-800">
            {reason}
          </p>
        ))}
      </div>
      <VerificationLink label="Review 0G root" value={result.rootHash} />
      <VerificationLink label="Review upload tx" value={result.txHash} href={result.txUrl} />
      <div className="mt-3 rounded-xl bg-white/70 p-3">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-900">Release execution</p>
        <p className="mt-1 text-xs leading-5 text-emerald-800">{result.execution.reason}</p>
        <VerificationLink label="Execution log root" value={result.execution.rootHash} />
        <VerificationLink label="Execution log upload tx" value={result.execution.txHash} href={result.execution.txUrl} />
        {result.execution.execution ? (
          <p className="mt-1 text-xs text-emerald-800">
            {result.execution.execution.provider} - {result.execution.execution.status}
            {result.execution.execution.txHash ? " - " : ""}
            {result.execution.execution.txHash && result.execution.execution.explorerUrl ? (
              <a
                className="break-all font-semibold underline decoration-emerald-600 underline-offset-2"
                href={result.execution.execution.explorerUrl}
                target="_blank"
                rel="noreferrer"
              >
                {result.execution.execution.txHash}
              </a>
            ) : (
              result.execution.execution.txHash
            )}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function StoredRootList({ milestone }: { milestone: Milestone }) {
  if (!milestone.reviewRootHash && !milestone.executionRootHash) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-900">On-chain 0G pointers</p>
      {milestone.reviewRootHash ? <VerificationLink label="Stored review root" value={milestone.reviewRootHash} /> : null}
      {milestone.executionRootHash ? (
        <VerificationLink label="Stored execution root" value={milestone.executionRootHash} />
      ) : null}
    </div>
  );
}

function EvidenceList({ evidence }: { evidence: EvidenceItem[] }) {
  if (evidence.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-4 text-sm text-[var(--muted)]">
        No evidence submitted yet.
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {evidence.map((item) => (
        <div key={item.id} className="rounded-2xl border border-[var(--border)] bg-white p-3">
          <p className="text-sm font-bold text-[var(--ink)]">{item.label}</p>
          <p className="mt-1 text-xs capitalize text-[var(--muted)]">
            {item.submittedBy} - {item.submittedAt}
          </p>
          {item.uri ? <p className="mt-1 break-all text-xs text-[var(--brand-strong)]">{item.uri}</p> : null}
        </div>
      ))}
    </div>
  );
}
