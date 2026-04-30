import Link from "next/link";
import { notFound } from "next/navigation";
import { EvidenceSubmission } from "@/components/evidence-submission";
import { MilestoneCard } from "@/components/milestone-card";
import { PageHeader, PageShell } from "@/components/page-shell";
import { PayoutStatus } from "@/components/payout-status";
import { StatusBadge } from "@/components/status-badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state";
import { getEscrow } from "@/lib/mock-data";

export default async function EscrowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const escrow = getEscrow(id);

  if (!escrow) {
    notFound();
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Escrow detail"
        title={escrow.title}
        description={escrow.summary}
        action={
          <Link href="/dashboard" className={buttonClassName("secondary")}>
            Back to dashboard
          </Link>
        }
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <div className="grid gap-6">
          <PayoutStatus escrow={escrow} />

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-[var(--ink)]">Milestones</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">Each milestone maps to one review and release decision.</p>
                </div>
                <StatusBadge status={escrow.status} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-3">
              {escrow.milestones.map((milestone, index) => (
                <MilestoneCard key={milestone.id} milestone={milestone} index={index} />
              ))}
            </CardContent>
          </Card>

          <EvidenceSubmission role={escrow.role} />
        </div>

        <aside className="grid h-fit gap-6">
          <Card className="bg-[#fff7df]">
            <CardContent>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand-strong)]">Role-aware flow</p>
              <h2 className="mt-3 text-2xl font-black text-[var(--ink)]">
                {escrow.role === "client" ? "Client review mode" : "Freelancer delivery mode"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                {escrow.role === "client"
                  ? "Approve submitted evidence, request changes, or release the next milestone."
                  : "Submit proof, track review state, and prepare the next milestone handoff."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-black text-[var(--ink)]">Evidence log</h2>
            </CardHeader>
            <CardContent>
              {escrow.evidence.length > 0 ? (
                <div className="grid gap-3">
                  {escrow.evidence.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-[var(--border)] bg-white p-3">
                      <p className="text-sm font-bold text-[var(--ink)]">{item.label}</p>
                      <p className="mt-1 text-xs capitalize text-[var(--muted)]">
                        {item.submittedBy} - {item.submittedAt}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No evidence yet" description="Freelancer proof will appear here once submitted." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--muted)]">Agent score</p>
              <p className="mt-3 text-5xl font-black text-[var(--ink)]">{escrow.agentScore}%</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Mock confidence score for demoing automated review.</p>
            </CardContent>
          </Card>
        </aside>
      </section>
    </PageShell>
  );
}
