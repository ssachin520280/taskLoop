import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Escrow } from "@/lib/mock-data";

export function DisputePanel({ dispute }: { dispute?: Escrow["dispute"] }) {
  if (!dispute) {
    return (
      <Card>
        <CardContent>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">No dispute</p>
          <p className="mt-2 text-sm text-[var(--muted)]">All active milestones are eligible for normal review flow.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200 bg-red-50/70">
      <CardHeader>
        <h2 className="text-lg font-black text-red-950">Dispute open</h2>
        <p className="mt-1 text-sm text-red-800">Milestone {dispute.milestoneId} needs review before release.</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-semibold text-red-950">{dispute.reason}</p>
        <p className="mt-2 text-xs capitalize text-red-800">
          Opened by {dispute.openedBy} - {dispute.openedAt}
        </p>
      </CardContent>
    </Card>
  );
}
