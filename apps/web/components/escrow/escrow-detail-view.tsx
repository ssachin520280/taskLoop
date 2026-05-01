"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { isAddress } from "viem";
import { AgentReviewPanel } from "@/components/escrow/agent-review-panel";
import { DisputePanel } from "@/components/escrow/dispute-panel";
import { EnsTrustPanel } from "@/components/escrow/ens-trust-panel";
import { FundingPanel } from "@/components/escrow/funding-panel";
import { IdentityCard } from "@/components/escrow/identity-card";
import { MilestoneWorkflowCard, nextMilestoneStatusAfterEvidence } from "@/components/escrow/milestone-workflow-card";
import { PayoutTimeline } from "@/components/escrow/payout-timeline";
import { PageHeader, PageShell } from "@/components/page-shell";
import { PayoutStatus } from "@/components/payout-status";
import { StatusBadge } from "@/components/status-badge";
import { useToast } from "@/components/toast-provider";
import { buttonClassName } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/ui/state";
import { useEscrowContract } from "@/hooks/use-escrow-contract";
import type { Escrow, EvidenceItem, FundingStatus, Milestone } from "@/lib/mock-data";
import { getEscrow } from "@/lib/mock-data";

export function EscrowDetailView({ escrowId }: { escrowId: string }) {
  const isContractEscrow = isAddress(escrowId);
  const initialEscrow = useMemo(() => getEscrow(escrowId), [escrowId]);
  const [milestones, setMilestones] = useState<Milestone[]>(() => initialEscrow?.milestones ?? []);
  const [fundingStatus, setFundingStatus] = useState<FundingStatus>(initialEscrow?.fundingStatus ?? "unfunded");
  const [dispute, setDispute] = useState<Escrow["dispute"]>(initialEscrow?.dispute);
  const { toast } = useToast();
  const contract = useEscrowContract(escrowId, initialEscrow);

  if (isContractEscrow && contract.isReading && !contract.escrow) {
    return (
      <PageShell>
        <LoadingState label="Reading escrow from chain..." />
      </PageShell>
    );
  }

  if (!initialEscrow && !contract.escrow) {
    return (
      <PageShell>
        <EmptyState title="Escrow not found" description="This mock escrow is not available in the demo data." />
        <div className="mt-5 flex justify-center">
          <Link href="/dashboard" className={buttonClassName("yellow")}>
            Back to dashboard
          </Link>
        </div>
      </PageShell>
    );
  }

  const localEscrow = initialEscrow
    ? {
        ...initialEscrow,
        fundingStatus,
        milestones,
        evidence: milestones.flatMap((milestone) => milestone.evidence),
        dispute,
        status: dispute ? "disputed" : deriveEscrowStatus(fundingStatus, milestones)
      }
    : undefined;
  const escrow = contract.escrow ?? localEscrow!;
  const visibleMilestones = contract.escrow ? escrow.milestones : milestones;
  const visibleFundingStatus = contract.escrow ? escrow.fundingStatus : fundingStatus;

  function handleSubmitEvidence(milestoneId: string, label: string) {
    if (contract.escrow) {
      void contract.actions.submitEvidence(milestoneId, label.trim());
      return;
    }

    setMilestones((current) =>
      current.map((milestone) => {
        if (milestone.id !== milestoneId) {
          return milestone;
        }

        const evidence: EvidenceItem = {
          id: `${milestone.id}-ev-${milestone.evidence.length + 1}`,
          label: label.trim(),
          submittedBy: "freelancer",
          submittedAt: "Just now"
        };
        const evidenceItems = [...milestone.evidence, evidence];

        return {
          ...milestone,
          evidence: evidenceItems,
          evidenceCount: evidenceItems.length,
          status: nextMilestoneStatusAfterEvidence(milestone.status)
        };
      })
    );
    toast({ title: "Evidence submitted", description: "Demo state updated locally.", tone: "success" });
  }

  function updateMilestoneStatus(milestoneId: string, status: Milestone["status"]) {
    setMilestones((current) =>
      current.map((milestone) => (milestone.id === milestoneId ? { ...milestone, status } : milestone))
    );
  }

  function handleDispute(milestoneId: string) {
    if (contract.escrow) {
      void contract.actions.disputeMilestone(milestoneId);
      return;
    }

    updateMilestoneStatus(milestoneId, "disputed");
    setDispute({
      milestoneId,
      reason: "Manual demo dispute: evidence needs a clearer acceptance check.",
      openedBy: "client",
      openedAt: "Just now"
    });
    toast({ title: "Dispute opened", description: "Demo state updated locally.", tone: "info" });
  }

  function handleRelease(milestoneId: string) {
    if (contract.escrow) {
      void contract.actions.releaseMilestone(milestoneId);
      return;
    }

    setMilestones((current) => {
      const updatedMilestones = current.map((milestone) =>
        milestone.id === milestoneId ? { ...milestone, status: "paid" as const } : milestone
      );

      setFundingStatus(updatedMilestones.every((milestone) => milestone.status === "paid") ? "completed" : "partially_released");
      return updatedMilestones;
    });
    toast({ title: "Milestone released", description: "Demo payout state updated locally.", tone: "success" });
  }

  function handleApprove(milestoneId: string) {
    if (contract.escrow) {
      void contract.actions.approveMilestone(milestoneId);
      return;
    }

    updateMilestoneStatus(milestoneId, "approved");
    toast({ title: "Milestone approved", description: "Demo state updated locally.", tone: "success" });
  }

  function handleFund() {
    if (contract.escrow) {
      void contract.actions.fundEscrow();
      return;
    }

    setFundingStatus("funded");
    toast({ title: "Escrow funded", description: "Demo state updated locally.", tone: "success" });
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Escrow detail"
        title={escrow.title}
        description={escrow.description}
        action={
          <Link href="/dashboard" className={buttonClassName("secondary")}>
            Back to dashboard
          </Link>
        }
      />

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <IdentityCard label="Client identity" name={escrow.client} role="client" wallet={escrow.clientWallet} />
        <IdentityCard
          label="Freelancer identity"
          name={escrow.freelancer}
          role="freelancer"
          wallet={escrow.freelancerWallet}
        />
        <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/75 p-5 shadow-sm shadow-black/5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">Current state</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge status={escrow.status} />
            <span className="rounded-full border border-stone-300 bg-stone-100 px-2.5 py-1 text-xs font-semibold capitalize text-stone-700">
              {visibleFundingStatus.replace("_", " ")}
            </span>
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">Due {escrow.dueDate} on {escrow.chain}</p>
        </div>
      </section>

      <section className="mb-6">
        <EnsTrustPanel />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <div className="grid gap-6">
          <FundingPanel escrow={escrow} fundingStatus={visibleFundingStatus} onFund={handleFund} />
          {contract.pendingAction ? (
            <LoadingState label={`${contract.pendingAction} pending wallet confirmation...`} />
          ) : null}
          {contract.error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
              {contract.error}
            </div>
          ) : null}
          <PayoutStatus escrow={escrow} />

          <div className="grid gap-3">
            <div>
              <h2 className="text-xl font-black text-[var(--ink)]">Milestones</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Walk through evidence, approval, release, and dispute states in order.
              </p>
            </div>
            {visibleMilestones.map((milestone, index) => (
              <MilestoneWorkflowCard
                key={milestone.id}
                milestone={milestone}
                index={index}
                onSubmitEvidence={handleSubmitEvidence}
                onApprove={handleApprove}
                onRelease={handleRelease}
                onDispute={handleDispute}
              />
            ))}
          </div>
        </div>

        <aside className="grid h-fit gap-6">
          <AgentReviewPanel escrow={escrow} />
          <PayoutTimeline escrow={escrow} />
          <DisputePanel dispute={dispute} />
        </aside>
      </section>
    </PageShell>
  );
}

function deriveEscrowStatus(fundingStatus: FundingStatus, milestones: Milestone[]): Escrow["status"] {
  if (fundingStatus === "unfunded") {
    return "pending";
  }

  if (milestones.every((milestone) => milestone.status === "paid")) {
    return "released";
  }

  if (milestones.some((milestone) => milestone.status === "submitted")) {
    return "review";
  }

  return "in_progress";
}
