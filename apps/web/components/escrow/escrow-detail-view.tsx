"use client";

import Link from "next/link";
import { useState } from "react";
import { isAddress } from "viem";
import { AgentReviewPanel } from "@/components/escrow/agent-review-panel";
import { DisputePanel } from "@/components/escrow/dispute-panel";
import { EnsTrustPanel } from "@/components/escrow/ens-trust-panel";
import { FundingPanel } from "@/components/escrow/funding-panel";
import { IdentityCard } from "@/components/escrow/identity-card";
import { MilestoneWorkflowCard } from "@/components/escrow/milestone-workflow-card";
import { PayoutTimeline } from "@/components/escrow/payout-timeline";
import { PageHeader, PageShell } from "@/components/page-shell";
import { PayoutStatus } from "@/components/payout-status";
import { StatusBadge } from "@/components/status-badge";
import { useToast } from "@/components/toast-provider";
import { buttonClassName } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/ui/state";
import { useEscrowContract } from "@/hooks/use-escrow-contract";
import { formatEth } from "@/lib/escrow";
import { requestMilestoneReview, type MilestoneReviewResult } from "@/lib/review-milestone-client";

export function EscrowDetailView({ escrowId }: { escrowId: string }) {
  const isContractEscrow = isAddress(escrowId);
  const [reviewResults, setReviewResults] = useState<Record<string, MilestoneReviewResult>>({});
  const [reviewingMilestoneId, setReviewingMilestoneId] = useState<string>();
  const { toast } = useToast();
  const contract = useEscrowContract(escrowId);

  if (!isContractEscrow) {
    return (
      <PageShell>
        <EmptyState title="Escrow not found" description="Escrow detail requires a deployed escrow contract address." />
        <div className="mt-5 flex justify-center">
          <Link href="/dashboard" className={buttonClassName("yellow")}>
            Back to dashboard
          </Link>
        </div>
      </PageShell>
    );
  }

  if (contract.isReading && !contract.escrow) {
    return (
      <PageShell>
        <LoadingState label="Reading escrow from chain..." />
      </PageShell>
    );
  }

  if (!contract.escrow) {
    return (
      <PageShell>
        <EmptyState title="Escrow not found" description="No escrow contract data could be read for this address." />
        <div className="mt-5 flex justify-center">
          <Link href="/dashboard" className={buttonClassName("yellow")}>
            Back to dashboard
          </Link>
        </div>
      </PageShell>
    );
  }

  const escrow = contract.escrow;
  const visibleMilestones = escrow.milestones;
  const visibleFundingStatus = escrow.fundingStatus;

  function handleSubmitEvidence(milestoneId: string, label: string) {
    void contract.actions.submitEvidence(milestoneId, label.trim());
  }

  function handleDispute(milestoneId: string) {
    void contract.actions.disputeMilestone(milestoneId);
  }

  function handleRelease(milestoneId: string) {
    void contract.actions.releaseMilestone(milestoneId);
  }

  function handleApprove(milestoneId: string) {
    void contract.actions.approveMilestone(milestoneId);
  }

  function handleFund() {
    void contract.actions.fundEscrow();
  }

  async function handleRequestReview(milestoneId: string, notes?: string) {
    const milestone = visibleMilestones.find((item) => item.id === milestoneId);
    const latestEvidence = milestone?.evidence.at(-1);

    if (!milestone || !latestEvidence) {
      toast({ title: "Evidence required", description: "Submit evidence before requesting agent review.", tone: "error" });
      return;
    }

    setReviewingMilestoneId(milestoneId);

    try {
      const result = await requestMilestoneReview({
        escrow: {
          escrowId: escrow.id,
          title: escrow.title,
          description: escrow.description,
          client: escrow.client,
          freelancer: escrow.freelancer
        },
        milestone: {
          milestoneId: milestone.id,
          title: milestone.title,
          description: milestone.agentNote,
          amountEth: formatEth(milestone.amountWei),
          amountWei: milestone.amountWei.toString(),
          dueDate: milestone.dueDate
        },
        evidenceUri: latestEvidence.uri ?? latestEvidence.label,
        freelancerNotes: notes?.trim() || undefined
      });

      setReviewResults((current) => ({ ...current, [milestoneId]: result }));
      toast({ title: "Agent review stored", description: `Verify tx: ${result.txHash}`, tone: "success" });

      try {
        await contract.actions.attachReviewRoots(milestoneId, result.rootHash, result.execution.rootHash);
      } catch (attachError) {
        toast({
          title: "0G roots not attached on-chain",
          description: attachError instanceof Error ? attachError.message : "The review was stored, but the chain pointer was not updated.",
          tone: "error"
        });
      }
    } catch (error) {
      toast({
        title: "Agent review failed",
        description: error instanceof Error ? error.message : "Unable to run review",
        tone: "error"
      });
    } finally {
      setReviewingMilestoneId(undefined);
    }
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
                review={reviewResults[milestone.id]}
                isReviewing={reviewingMilestoneId === milestone.id}
                onSubmitEvidence={handleSubmitEvidence}
                onApprove={handleApprove}
                onRelease={handleRelease}
                onDispute={handleDispute}
                onRequestReview={handleRequestReview}
              />
            ))}
          </div>
        </div>

        <aside className="grid h-fit gap-6">
          <AgentReviewPanel escrow={escrow} />
          <PayoutTimeline escrow={escrow} />
          <DisputePanel dispute={escrow.dispute} />
        </aside>
      </section>
    </PageShell>
  );
}
