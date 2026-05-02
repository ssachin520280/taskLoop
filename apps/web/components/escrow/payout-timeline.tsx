import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import type { Escrow } from "@/lib/escrow";
import { escrowTotal, formatEth } from "@/lib/escrow";

export function PayoutTimeline({ escrow }: { escrow: Escrow }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-black text-[var(--ink)]">Payout timeline</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">A video-friendly view of what has happened and what comes next.</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          <TimelineItem label="Escrow created" detail={`${escrow.client} opened on ${escrow.createdAt}`} complete />
          <TimelineItem
            label="Funding"
            detail={escrow.fundingStatus === "unfunded" ? "Waiting for client deposit" : `${formatEth(escrowTotal(escrow))} locked`}
            complete={escrow.fundingStatus !== "unfunded"}
          />
          {escrow.milestones.map((milestone) => (
            <TimelineItem
              key={milestone.id}
              label={milestone.title}
              detail={`${formatEth(milestone.amountWei)} - ${milestone.evidence.length} evidence item${
                milestone.evidence.length === 1 ? "" : "s"
              }`}
              status={milestone.status}
              complete={milestone.status === "paid"}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineItem({
  label,
  detail,
  complete,
  status
}: {
  label: string;
  detail: string;
  complete: boolean;
  status?: Escrow["milestones"][number]["status"];
}) {
  return (
    <div className="flex gap-3 rounded-2xl bg-white/75 p-3">
      <span
        className={`mt-1 h-3 w-3 shrink-0 rounded-full ${complete ? "bg-emerald-500" : "bg-[var(--brand)]"}`}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-black text-[var(--ink)]">{label}</p>
          {status ? <StatusBadge status={status} /> : null}
        </div>
        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{detail}</p>
      </div>
    </div>
  );
}
