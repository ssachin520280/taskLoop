"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import type { Escrow, FundingStatus } from "@/lib/escrow";
import { escrowTotal, formatEth } from "@/lib/escrow";

const fundingCopy: Record<FundingStatus, string> = {
  completed: "All milestones have been paid out.",
  funded: "Escrow is funded and ready for milestone review.",
  partially_released: "Some funds have already been released.",
  unfunded: "Client needs to fund escrow before work begins."
};

export function FundingPanel({
  escrow,
  fundingStatus,
  onFund
}: {
  escrow: Escrow;
  fundingStatus: FundingStatus;
  onFund: () => void;
}) {
  const canFund = fundingStatus === "unfunded";

  return (
    <Card className="bg-[#fff7df]">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[var(--ink)]">Funding status</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{fundingCopy[fundingStatus]}</p>
          </div>
          <StatusBadge status={escrow.status} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--muted)]">Escrow total</p>
          <p className="mt-2 text-4xl font-black text-[var(--ink)]">{formatEth(escrowTotal(escrow))}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Chain: {escrow.chain} - Created {escrow.createdAt}
          </p>
        </div>
        <Button type="button" disabled={!canFund} onClick={onFund}>
          {canFund ? "Fund escrow" : "Funded"}
        </Button>
      </CardContent>
    </Card>
  );
}
