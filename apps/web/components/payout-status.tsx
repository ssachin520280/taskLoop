import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { escrowTotal, formatEth, type Escrow } from "@/lib/mock-data";

export function PayoutStatus({ escrow }: { escrow: Escrow }) {
  const paidCount = escrow.milestones.filter((milestone) => milestone.status === "paid").length;
  const submittedCount = escrow.milestones.filter((milestone) => milestone.status === "submitted").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[var(--ink)]">Payout status</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">Funds are mocked until contract integration is connected.</p>
          </div>
          <StatusBadge status={escrow.status} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Escrowed</p>
          <p className="mt-2 text-2xl font-black text-[var(--ink)]">{formatEth(escrowTotal(escrow))}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Paid milestones</p>
          <p className="mt-2 text-2xl font-black text-[var(--ink)]">
            {paidCount}/{escrow.milestones.length}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Needs review</p>
          <p className="mt-2 text-2xl font-black text-[var(--ink)]">{submittedCount}</p>
        </div>
      </CardContent>
    </Card>
  );
}
