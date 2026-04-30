import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-12 text-center">
        <p className="text-lg font-semibold text-[var(--ink)]">{title}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">{description}</p>
      </CardContent>
    </Card>
  );
}

export function LoadingState({ label = "Loading TaskLoop data..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white/70 p-4 text-sm text-[var(--muted)]">
      <span className="h-3 w-3 animate-pulse rounded-full bg-[var(--brand)]" />
      {label}
    </div>
  );
}
