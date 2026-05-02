"use client";

import Link from "next/link";
import { type ReactElement, useState } from "react";
import { EscrowCard } from "@/components/escrow-card";
import { PageHeader, PageShell } from "@/components/page-shell";
import { RoleToggle } from "@/components/role-toggle";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, LoadingState } from "@/components/ui/state";
import { useFactoryEscrows } from "@/hooks/use-factory-escrows";
import { escrowTotal, formatEth, type Escrow, type UserRole } from "@/lib/escrow";

type DashboardFactory = ReturnType<typeof useFactoryEscrows>;

export function DashboardView(): ReactElement {
  const [role, setRole] = useState<UserRole>("client");
  const factory = useFactoryEscrows();
  const roleEscrows = role === "client" ? factory.clientEscrows : factory.freelancerEscrows;
  const visibleEscrows = factory.isConnected ? roleEscrows : factory.allEscrows;
  const activeValue = visibleEscrows.reduce((total, escrow) => total + escrowTotal(escrow), 0n);
  const actionCount = visibleEscrows.filter((escrow) => escrow.status === "pending" || escrow.status === "funded").length;
  const title = getDashboardTitle(role);
  const headerDescription = getHeaderDescription(factory.isConnected);
  const escrowDescription = getEscrowDescription(factory.isConnected, role);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Live dashboard"
        title={title}
        description={headerDescription}
        action={<RoleToggle role={role} onRoleChange={setRole} />}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Total escrows" value={factory.isConfigured ? factory.totalEscrows.toString() : "Not configured"} />
        <Metric label="Escrows as client" value={factory.isConnected ? String(factory.clientEscrows.length) : "Connect"} />
        <Metric label="Escrows as freelancer" value={factory.isConnected ? String(factory.freelancerEscrows.length) : "Connect"} />
      </section>

      <div className="mt-8 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[var(--ink)]">Escrows</h2>
          <p className="text-sm text-[var(--muted)]">{escrowDescription}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Active value {formatEth(activeValue)} / {actionCount} active / {factory.accountEscrowCount} account-linked
          </p>
        </div>
        <Link href="/escrows/new" className={buttonClassName("yellow")}>
          New escrow
        </Link>
      </div>

      <EscrowContent factory={factory} role={role} visibleEscrows={visibleEscrows} />
    </PageShell>
  );
}

function EscrowContent({
  factory,
  role,
  visibleEscrows
}: {
  factory: DashboardFactory;
  role: UserRole;
  visibleEscrows: Escrow[];
}): ReactElement {
  if (!factory.isConfigured) {
    return (
      <div className="mt-5">
        <EmptyState
          title="Factory address missing"
          description="Set NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS to read escrow records from the deployed factory."
        />
      </div>
    );
  }

  if (factory.isLoading && visibleEscrows.length === 0) {
    return (
      <div className="mt-5">
        <LoadingState label="Reading escrow records from the factory..." />
      </div>
    );
  }

  if (factory.error) {
    return (
      <div className="mt-5">
        <EmptyState title="Could not read factory escrows" description={factory.error} />
      </div>
    );
  }

  if (visibleEscrows.length === 0) {
    return (
      <div className="mt-5">
        <EmptyState title="No escrows yet" description={getEmptyEscrowDescription(factory.isConnected, role)} />
      </div>
    );
  }

  return (
    <section className="mt-5 grid gap-4 lg:grid-cols-3">
      {visibleEscrows.map((escrow) => (
        <EscrowCard key={escrow.id} escrow={escrow} />
      ))}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <Card>
      <CardContent>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
        <p className="mt-3 text-3xl font-black text-[var(--ink)]">{value}</p>
      </CardContent>
    </Card>
  );
}

function getDashboardTitle(role: UserRole): string {
  return role === "client" ? "Track factory escrows and release with confidence." : "Submit proof and keep payouts moving.";
}

function getHeaderDescription(isConnected: boolean): string {
  if (isConnected) {
    return "Factory records are grouped by your connected wallet role.";
  }

  return "Connect a wallet to split factory escrows by client and freelancer role.";
}

function getEscrowDescription(isConnected: boolean, role: UserRole): string {
  if (!isConnected) {
    return "All recent escrow records from the factory contract.";
  }

  return role === "client"
    ? "Factory escrows where your wallet is the client."
    : "Factory escrows where your wallet is the freelancer.";
}

function getEmptyEscrowDescription(isConnected: boolean, role: UserRole): string {
  if (isConnected) {
    return `No factory escrows found for this wallet as ${role}.`;
  }

  return "No escrow records were found on the configured factory.";
}
