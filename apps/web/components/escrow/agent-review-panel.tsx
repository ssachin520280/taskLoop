import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Escrow } from "@/lib/mock-data";

export function AgentReviewPanel({ escrow }: { escrow: Escrow }) {
  const tone = escrow.agentScore >= 90 ? "bg-emerald-50 text-emerald-800" : "bg-yellow-100 text-yellow-900";

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-black text-[var(--ink)]">Agent review</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Mock evaluator output for the hackathon demo.</p>
      </CardHeader>
      <CardContent>
        <div className={`inline-flex rounded-full px-4 py-2 text-sm font-black ${tone}`}>{escrow.agentScore}% confidence</div>
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{escrow.agentRecommendation}</p>
        <div className="mt-5 grid gap-3">
          {escrow.milestones.map((milestone) => (
            <div key={milestone.id} className="rounded-2xl bg-[#fff7df] p-3">
              <p className="text-sm font-bold text-[var(--ink)]">{milestone.title}</p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{milestone.agentNote}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
