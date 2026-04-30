"use client";

import Link from "next/link";
import { useState } from "react";
import { EscrowCard } from "@/components/escrow-card";
import { PageHeader, PageShell } from "@/components/page-shell";
import { RoleToggle } from "@/components/role-toggle";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state";
import { escrowTotal, escrows, formatEth, type UserRole } from "@/lib/mock-data";

export function DashboardView() {
  const [role, setRole] = useState<UserRole>("client");
  const visibleEscrows = escrows.filter((escrow) => escrow.role === role);
  const activeValue = visibleEscrows.reduce((total, escrow) => total + escrowTotal(escrow), 0n);
  const reviewCount = visibleEscrows.filter((escrow) => escrow.status === "review").length;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Demo dashboard"
        title={role === "client" ? "Track funded work and release with confidence." : "Submit proof and keep payouts moving."}
        description="Use the role switcher to demo how TaskLoop changes the escrow workflow for clients and freelancers."
        action={<RoleToggle role={role} onRoleChange={setRole} />}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Active value" value={formatEth(activeValue)} />
        <Metric label={role === "client" ? "Needs approval" : "Awaiting review"} value={String(reviewCount)} />
        <Metric label="Agent confidence" value="88%" />
      </section>

      <div className="mt-8 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[var(--ink)]">Escrows</h2>
          <p className="text-sm text-[var(--muted)]">
            {role === "client" ? "Client-funded workstreams ready for review." : "Freelancer assignments with milestone proof."}
          </p>
        </div>
        <Link href="/escrows/new" className={buttonClassName("yellow")}>
          New escrow
        </Link>
      </div>

      {visibleEscrows.length > 0 ? (
        <section className="mt-5 grid gap-4 lg:grid-cols-3">
          {visibleEscrows.map((escrow) => (
            <EscrowCard key={escrow.id} escrow={escrow} />
          ))}
        </section>
      ) : (
        <div className="mt-5">
          <EmptyState title="No escrows yet" description="Create a mock escrow to walk judges through the TaskLoop flow." />
        </div>
      )}
    </PageShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
        <p className="mt-3 text-3xl font-black text-[var(--ink)]">{value}</p>
      </CardContent>
    </Card>
  );
}
