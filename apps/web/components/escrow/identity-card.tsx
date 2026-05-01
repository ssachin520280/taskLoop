"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatAddress } from "@taskloop/shared";
import { useEnsName } from "@/hooks/use-ens-name";

export function IdentityCard({
  label,
  name,
  wallet
}: {
  label: string;
  name: string;
  wallet: `0x${string}`;
}) {
  const { ensName, displayName, isLoading } = useEnsName(wallet);

  return (
    <Card>
      <CardContent>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
        <p className="mt-3 text-xl font-black text-[var(--ink)]">{isLoading ? name : ensName ?? name}</p>
        <p className="mt-1 font-mono text-sm text-[var(--muted)]">
          {ensName ? formatAddress(wallet) : displayName}
        </p>
      </CardContent>
    </Card>
  );
}
