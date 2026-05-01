"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import type { EvidenceItem, Milestone, MilestoneStatus } from "@/lib/mock-data";
import { formatEth } from "@/lib/mock-data";

export function MilestoneWorkflowCard({
  milestone,
  index,
  onSubmitEvidence,
  onApprove,
  onRelease,
  onDispute
}: {
  milestone: Milestone;
  index: number;
  onSubmitEvidence: (milestoneId: string, label: string) => void;
  onApprove: (milestoneId: string) => void;
  onRelease: (milestoneId: string) => void;
  onDispute: (milestoneId: string) => void;
}) {
  const [evidenceLabel, setEvidenceLabel] = useState("");
  const canSubmit = milestone.status === "active" || milestone.status === "pending";
  const canApprove = milestone.status === "submitted";
  const canRelease = milestone.status === "approved";
  const canDispute = milestone.status === "submitted" || milestone.status === "active";

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

        <div className="grid gap-3 rounded-2xl border border-dashed border-stone-300 bg-white/70 p-4">
          <textarea
            className="field-input min-h-20"
            placeholder="Paste evidence URI, commit hash, or demo note..."
            value={evidenceLabel}
            disabled={!canSubmit}
            onChange={(event) => setEvidenceLabel(event.target.value)}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[var(--muted)]">Mock actions update this page only. Contract writes plug in later.</p>
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
      </CardContent>
    </Card>
  );
}

export function nextMilestoneStatusAfterEvidence(status: MilestoneStatus): MilestoneStatus {
  return status === "pending" || status === "active" ? "submitted" : status;
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
