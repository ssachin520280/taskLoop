import { CreateEscrowForm } from "@/components/create-escrow-form";
import { PageHeader, PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";

const checklist = [
  "Define objective and acceptance criteria",
  "Split work into payout milestones",
  "Fund escrow after wallet confirmation",
  "Let the agent score evidence before release"
];

export default function CreateEscrowPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Create escrow"
        title="Set up a clean milestone loop in under a minute."
        description="This is a mock-first creation flow so the hackathon demo can show the full UX before contract writes are connected."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <CreateEscrowForm />
        <Card className="h-fit bg-[#fff7df]">
          <CardContent>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand-strong)]">Demo checklist</p>
            <h2 className="mt-3 text-2xl font-black text-[var(--ink)]">What judges should see</h2>
            <div className="mt-5 grid gap-3">
              {checklist.map((item, index) => (
                <div key={item} className="flex gap-3 rounded-2xl bg-white/75 p-3 text-sm text-[var(--muted)]">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] font-black text-[var(--ink)]">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
