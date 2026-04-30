import { formatEther, parseEther } from "viem";

export type UserRole = "client" | "freelancer";

export type EscrowStatus = "funded" | "in_progress" | "review" | "released" | "disputed";

export type MilestoneStatus = "pending" | "active" | "submitted" | "approved" | "paid";

export type Milestone = {
  id: string;
  title: string;
  dueDate: string;
  amountWei: bigint;
  status: MilestoneStatus;
  evidenceCount: number;
};

export type Escrow = {
  id: string;
  title: string;
  summary: string;
  client: string;
  freelancer: string;
  role: UserRole;
  status: EscrowStatus;
  dueDate: string;
  createdAt: string;
  agentScore: number;
  chain: string;
  milestones: Milestone[];
  evidence: Array<{
    id: string;
    label: string;
    submittedBy: UserRole;
    submittedAt: string;
  }>;
};

export const demoAddress = "0x8ba1f109551bD432803012645Ac136ddd64DBA72" as const;

export const escrows: Escrow[] = [
  {
    id: "escrow-101",
    title: "Agent landing page refresh",
    summary: "Ship a polished TaskLoop demo landing page with wallet-aware CTAs and a short execution report.",
    client: "BuildGuild Labs",
    freelancer: "Maya Chen",
    role: "client",
    status: "review",
    dueDate: "May 04",
    createdAt: "Apr 30",
    agentScore: 92,
    chain: "Sepolia",
    milestones: [
      {
        id: "m1",
        title: "Design direction and copy",
        dueDate: "May 01",
        amountWei: parseEther("0.18"),
        status: "paid",
        evidenceCount: 2
      },
      {
        id: "m2",
        title: "Responsive implementation",
        dueDate: "May 03",
        amountWei: parseEther("0.32"),
        status: "submitted",
        evidenceCount: 3
      },
      {
        id: "m3",
        title: "Final demo polish",
        dueDate: "May 04",
        amountWei: parseEther("0.15"),
        status: "active",
        evidenceCount: 0
      }
    ],
    evidence: [
      {
        id: "ev1",
        label: "Preview deployment and Loom walkthrough",
        submittedBy: "freelancer",
        submittedAt: "May 03, 11:20"
      },
      {
        id: "ev2",
        label: "Agent evaluator scorecard",
        submittedBy: "freelancer",
        submittedAt: "May 03, 11:31"
      }
    ]
  },
  {
    id: "escrow-102",
    title: "Smart contract test suite",
    summary: "Add Foundry tests for task creation, status transitions, and settlement edge cases.",
    client: "TaskLoop Core",
    freelancer: "Ravi Patel",
    role: "freelancer",
    status: "in_progress",
    dueDate: "May 02",
    createdAt: "Apr 29",
    agentScore: 86,
    chain: "Sepolia",
    milestones: [
      {
        id: "m1",
        title: "Happy path coverage",
        dueDate: "May 01",
        amountWei: parseEther("0.22"),
        status: "approved",
        evidenceCount: 1
      },
      {
        id: "m2",
        title: "Edge case coverage",
        dueDate: "May 02",
        amountWei: parseEther("0.28"),
        status: "active",
        evidenceCount: 0
      }
    ],
    evidence: [
      {
        id: "ev1",
        label: "Foundry test output",
        submittedBy: "freelancer",
        submittedAt: "May 01, 18:10"
      }
    ]
  },
  {
    id: "escrow-103",
    title: "Agent evaluation prompt pack",
    summary: "Create reusable prompts for screening task scope, risk, and release recommendations.",
    client: "Open Operators",
    freelancer: "Nia Brooks",
    role: "client",
    status: "funded",
    dueDate: "May 05",
    createdAt: "Apr 30",
    agentScore: 78,
    chain: "Sepolia",
    milestones: [
      {
        id: "m1",
        title: "Prompt map",
        dueDate: "May 02",
        amountWei: parseEther("0.16"),
        status: "active",
        evidenceCount: 0
      },
      {
        id: "m2",
        title: "Evaluation rubric",
        dueDate: "May 05",
        amountWei: parseEther("0.24"),
        status: "pending",
        evidenceCount: 0
      }
    ],
    evidence: []
  }
];

export function getEscrow(id: string): Escrow | undefined {
  return escrows.find((escrow) => escrow.id === id);
}

export function formatEth(amountWei: bigint): string {
  return `${Number(formatEther(amountWei)).toFixed(2)} ETH`;
}

export function escrowTotal(escrow: Escrow): bigint {
  return escrow.milestones.reduce((total, milestone) => total + milestone.amountWei, 0n);
}
