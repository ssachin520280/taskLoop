import { Card, CardContent } from "@/components/ui/card";
import { formatAddress } from "@taskloop/shared";

export function IdentityCard({
  label,
  name,
  wallet
}: {
  label: string;
  name: string;
  wallet: `0x${string}`;
}) {
  return (
    <Card>
      <CardContent>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
        <p className="mt-3 text-xl font-black text-[var(--ink)]">{name}</p>
        <p className="mt-1 font-mono text-sm text-[var(--muted)]">{formatAddress(wallet)}</p>
      </CardContent>
    </Card>
  );
}
