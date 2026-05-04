import { Card, CardContent } from "@/components/ui/card";

export function EnsTrustPanel() {
  return (
    <Card className="border-yellow-200 bg-[#fff7df]">
      <CardContent className="grid gap-4 md:grid-cols-[0.85fr_1.15fr] md:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand-strong)]">ENS identity layer</p>
          <h2 className="mt-3 text-2xl font-black text-[var(--ink)]">Readable parties make escrow safer to demo.</h2>
        </div>
        <div className="grid gap-3 text-sm leading-6 text-[var(--muted)]">
          <p>
            TaskLoop resolves primary ENS names for the client and freelancer when available, then falls back to shortened
            wallet addresses.
          </p>
          <p>
            The same identity layer reduces mistakes in the highest-risk moments: approving evidence, releasing a
            milestone, or opening a dispute.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
