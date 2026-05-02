import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { formatEth, type Milestone } from "@/lib/escrow";

export function MilestoneCard({ milestone, index }: { milestone: Milestone; index: number }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-black text-[var(--ink)]">
            {index + 1}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-[var(--ink)]">{milestone.title}</h3>
              <StatusBadge status={milestone.status} />
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Due {milestone.dueDate} - {milestone.evidenceCount} evidence item
              {milestone.evidenceCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <p className="text-lg font-black text-[var(--ink)]">{formatEth(milestone.amountWei)}</p>
      </CardContent>
    </Card>
  );
}
