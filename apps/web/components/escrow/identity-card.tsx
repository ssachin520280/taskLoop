"use client";

import { formatAddress } from "@taskloop/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEnsName } from "@/hooks/use-ens-name";

type IdentityCardProps = {
  label: string;
  name: string;
  role: "client" | "freelancer";
  wallet: `0x${string}`;
};

export function IdentityCard({
  label,
  name,
  role,
  wallet
}: IdentityCardProps) {
  const { ensName, displayName, isError, isLoading } = useEnsName(wallet);
  const primaryName = isLoading ? "Resolving ENS..." : ensName ?? name;
  const secondaryLabel = ensName ? formatAddress(wallet) : displayName;

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
          <Badge tone={role === "client" ? "blue" : "yellow"}>{role}</Badge>
        </div>
        <p className="mt-3 text-xl font-black text-[var(--ink)]">{primaryName}</p>
        <p className="mt-1 font-mono text-sm text-[var(--muted)]">{secondaryLabel}</p>
        <p className="mt-3 text-xs leading-5 text-[var(--muted)]">{getIdentityHint(ensName, isError)}</p>
      </CardContent>
    </Card>
  );
}

function getIdentityHint(ensName: string | undefined, isError: boolean): string {
  if (ensName) {
    return "Primary ENS found. Judges can verify the human-readable identity before funds move.";
  }

  if (isError) {
    return "ENS lookup unavailable. Falling back to the wallet address keeps the flow safe.";
  }

  return "No primary ENS found. Shortened address is shown as the fallback identity.";
}
