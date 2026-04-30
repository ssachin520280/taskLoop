import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { buttonClassName } from "@/components/ui/button";
import { escrowTotal, formatEth, type Escrow } from "@/lib/mock-data";

export function EscrowCard({ escrow }: { escrow: Escrow }) {
  return (
    <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
      <CardContent>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusBadge status={escrow.status} />
          <span className="text-xs font-semibold text-[var(--muted)]">{escrow.chain}</span>
        </div>
        <h3 className="mt-4 text-xl font-black text-[var(--ink)]">{escrow.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{escrow.summary}</p>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[var(--muted)]">Total</p>
            <p className="font-black text-[var(--ink)]">{formatEth(escrowTotal(escrow))}</p>
          </div>
          <div>
            <p className="text-[var(--muted)]">Due</p>
            <p className="font-black text-[var(--ink)]">{escrow.dueDate}</p>
          </div>
        </div>
        <Link href={`/escrows/${escrow.id}`} className={buttonClassName("secondary", "mt-5 w-full")}>
          Open escrow
        </Link>
      </CardContent>
    </Card>
  );
}
