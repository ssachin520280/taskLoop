import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { EscrowStatus, MilestoneStatus } from "@/lib/escrow";

const statusTone: Record<EscrowStatus | MilestoneStatus, BadgeTone> = {
  active: "yellow",
  approved: "blue",
  disputed: "red",
  funded: "yellow",
  in_progress: "blue",
  paid: "green",
  pending: "neutral",
  released: "green",
  review: "blue",
  submitted: "yellow"
};

export function StatusBadge({ status }: { status: EscrowStatus | MilestoneStatus }) {
  return <Badge tone={statusTone[status]}>{status.replace("_", " ")}</Badge>;
}
