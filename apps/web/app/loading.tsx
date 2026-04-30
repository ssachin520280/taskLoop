import { PageShell } from "@/components/page-shell";
import { LoadingState } from "@/components/ui/state";

export default function Loading() {
  return (
    <PageShell>
      <LoadingState />
    </PageShell>
  );
}
