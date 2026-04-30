import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { buttonClassName } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";

export default function NotFound() {
  return (
    <PageShell>
      <EmptyState title="Escrow not found" description="This mock escrow does not exist yet." />
      <div className="mt-5 flex justify-center">
        <Link href="/dashboard" className={buttonClassName("yellow")}>
          Back to dashboard
        </Link>
      </div>
    </PageShell>
  );
}
