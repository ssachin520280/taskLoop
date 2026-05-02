import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Escrow } from "@/lib/mock-data";

export function AgentReviewPanel({ escrow }: { escrow: Escrow }) {
  const review = escrow.agentReview;
  const confidence = review ? Math.round(review.confidence * 100) : escrow.agentScore;
  const tone = confidence >= 90 ? "bg-emerald-50 text-emerald-800" : "bg-yellow-100 text-yellow-900";

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-black text-[var(--ink)]">Agent review</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Mock evaluator output for the hackathon demo.</p>
      </CardHeader>
      <CardContent>
        <div className={`inline-flex rounded-full px-4 py-2 text-sm font-black ${tone}`}>{confidence}% confidence</div>
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{review?.summary ?? escrow.agentRecommendation}</p>
        {review ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-900">
              Seeded review: {review.verdict}
            </p>
            <div className="mt-2 grid gap-1">
              {review.reasons.map((reason) => (
                <p key={reason} className="text-xs leading-5 text-emerald-800">
                  {reason}
                </p>
              ))}
            </div>
            <p className="mt-3 break-all text-xs font-semibold text-emerald-900">0G root: {review.rootHash}</p>
            {review.execution ? (
              <p className="mt-2 break-all text-xs font-semibold text-emerald-900">
                Execution log: {review.execution.rootHash}
              </p>
            ) : null}
          </div>
        ) : null}
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
