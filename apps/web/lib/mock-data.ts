import { formatEther, parseEther } from "viem";
import demoSeed from "./demo-seed.json";

export type UserRole = "client" | "freelancer";

export type EscrowStatus = "pending" | "funded" | "in_progress" | "review" | "released" | "disputed";

export type MilestoneStatus = "pending" | "active" | "submitted" | "approved" | "paid" | "disputed";

export type FundingStatus = "unfunded" | "funded" | "partially_released" | "completed";

export type EvidenceItem = {
  id: string;
  label: string;
  submittedBy: UserRole | "agent";
  submittedAt: string;
  uri?: string;
};

export type AgentReviewPayload = {
  verdict: "approve" | "needs_review" | "reject";
  confidence: number;
  summary: string;
  reasons: string[];
  recommendedAction: "release" | "request_more_info" | "dispute_review";
  generatedAt: string;
  rootHash: string;
  execution?: {
    status: "executed" | "skipped";
    reason: string;
    rootHash: string;
  };
};

export type Milestone = {
  id: string;
  title: string;
  dueDate: string;
  amountWei: bigint;
  status: MilestoneStatus;
  evidenceCount: number;
  evidence: EvidenceItem[];
  agentNote: string;
};

export type Escrow = {
  id: string;
  title: string;
  summary: string;
  description: string;
  client: string;
  clientWallet: `0x${string}`;
  freelancer: string;
  freelancerWallet: `0x${string}`;
  role: UserRole;
  status: EscrowStatus;
  fundingStatus: FundingStatus;
  dueDate: string;
  createdAt: string;
  agentScore: number;
  agentRecommendation: string;
  chain: string;
  milestones: Milestone[];
  evidence: EvidenceItem[];
  agentReview?: AgentReviewPayload;
  dispute?: {
    milestoneId: string;
    reason: string;
    openedBy: UserRole | "system";
    openedAt: string;
  };
};

export const demoAddress = "0x8ba1f109551bD432803012645Ac136ddd64DBA72" as const;

export const escrows: Escrow[] = [
  toEscrow(demoSeed.escrow as DemoSeedEscrow),
  {
    id: "escrow-101",
    title: "Agent landing page refresh",
    summary: "Ship a polished TaskLoop demo landing page with wallet-aware CTAs and a short execution report.",
    description:
      "Refresh the TaskLoop landing page for the hackathon recording. The freelancer should deliver a responsive page, proof links, and a concise summary that the agent can evaluate before milestone payout.",
    client: "BuildGuild Labs",
    clientWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    freelancer: "Maya Chen",
    freelancerWallet: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    role: "client",
    status: "review",
    fundingStatus: "funded",
    dueDate: "May 04",
    createdAt: "Apr 30",
    agentScore: 92,
    agentRecommendation: "Approve milestone 2 after checking the preview link and screenshot diff.",
    chain: "Sepolia",
    milestones: [
      {
        id: "m1",
        title: "Design direction and copy",
        dueDate: "May 01",
        amountWei: parseEther("0.18"),
        status: "paid",
        evidenceCount: 2,
        evidence: [
          {
            id: "ev1",
            label: "Copy deck and wireframe link",
            submittedBy: "freelancer",
            submittedAt: "May 01, 10:15",
            uri: "ipfs://taskloop/copy-wireframe"
          },
          {
            id: "ev2",
            label: "Agent quality check passed",
            submittedBy: "agent",
            submittedAt: "May 01, 10:24"
          }
        ],
        agentNote: "Scope and copy match the client brief."
      },
      {
        id: "m2",
        title: "Responsive implementation",
        dueDate: "May 03",
        amountWei: parseEther("0.32"),
        status: "disputed",
        evidenceCount: 3,
        evidence: [
          {
            id: "ev3",
            label: "Preview deployment",
            submittedBy: "freelancer",
            submittedAt: "May 03, 11:20",
            uri: "https://demo.taskloop.local"
          },
          {
            id: "ev4",
            label: "Loom walkthrough",
            submittedBy: "freelancer",
            submittedAt: "May 03, 11:31"
          },
          {
            id: "ev5",
            label: "Agent evaluator scorecard",
            submittedBy: "agent",
            submittedAt: "May 03, 11:36"
          }
        ],
        agentNote: "Evidence is complete. Client approval can release this milestone."
      },
      {
        id: "m3",
        title: "Final demo polish",
        dueDate: "May 04",
        amountWei: parseEther("0.15"),
        status: "active",
        evidenceCount: 0,
        evidence: [],
        agentNote: "Waiting for final polish evidence."
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
    description:
      "Expand contract confidence for TaskLoop by covering escrow creation, funding, milestone submission, dispute, and cancellation paths in Forge tests.",
    client: "TaskLoop Core",
    clientWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    freelancer: "Ravi Patel",
    freelancerWallet: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    role: "freelancer",
    status: "in_progress",
    fundingStatus: "partially_released",
    dueDate: "May 02",
    createdAt: "Apr 29",
    agentScore: 86,
    agentRecommendation: "Submit edge-case evidence before requesting final approval.",
    chain: "Sepolia",
    milestones: [
      {
        id: "m1",
        title: "Happy path coverage",
        dueDate: "May 01",
        amountWei: parseEther("0.22"),
        status: "paid",
        evidenceCount: 1,
        evidence: [
          {
            id: "ev1",
            label: "Foundry happy path output",
            submittedBy: "freelancer",
            submittedAt: "May 01, 18:10"
          }
        ],
        agentNote: "Happy path tests compile and cover core funding behavior."
      },
      {
        id: "m2",
        title: "Edge case coverage",
        dueDate: "May 02",
        amountWei: parseEther("0.28"),
        status: "active",
        evidenceCount: 0,
        evidence: [],
        agentNote: "Edge case coverage is still pending."
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
    description:
      "Draft a reusable prompt pack that helps the TaskLoop agent evaluate evidence quality, payout readiness, dispute risk, and recommended next steps.",
    client: "Open Operators",
    clientWallet: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    freelancer: "Nia Brooks",
    freelancerWallet: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
    role: "client",
    status: "disputed",
    fundingStatus: "funded",
    dueDate: "May 05",
    createdAt: "Apr 30",
    agentScore: 78,
    agentRecommendation: "Pause release until the rubric milestone has clearer acceptance criteria.",
    chain: "Sepolia",
    milestones: [
      {
        id: "m1",
        title: "Prompt map",
        dueDate: "May 02",
        amountWei: parseEther("0.16"),
        status: "submitted",
        evidenceCount: 1,
        evidence: [
          {
            id: "ev1",
            label: "Prompt map draft",
            submittedBy: "freelancer",
            submittedAt: "May 02, 09:12"
          }
        ],
        agentNote: "Prompt map is usable, but release depends on resolving dispute notes."
      },
      {
        id: "m2",
        title: "Evaluation rubric",
        dueDate: "May 05",
        amountWei: parseEther("0.24"),
        status: "pending",
        evidenceCount: 0,
        evidence: [],
        agentNote: "Not started."
      }
    ],
    evidence: [],
    dispute: {
      milestoneId: "m1",
      reason: "Acceptance rubric is too broad for automatic release.",
      openedBy: "system",
      openedAt: "May 02, 09:18"
    }
  }
];

type DemoSeedEscrow = Omit<Escrow, "milestones" | "evidence"> & {
  milestones: Array<Omit<Milestone, "amountWei" | "evidenceCount"> & { amountEth: string }>;
};

function toEscrow(seedEscrow: DemoSeedEscrow): Escrow {
  const milestones = seedEscrow.milestones.map((milestone) => ({
    ...milestone,
    amountWei: parseEther(milestone.amountEth),
    evidenceCount: milestone.evidence.length
  }));

  return {
    ...seedEscrow,
    milestones,
    evidence: milestones.flatMap((milestone) => milestone.evidence)
  };
}

export function getEscrow(id: string): Escrow | undefined {
  return escrows.find((escrow) => escrow.id === id);
}

export function formatEth(amountWei: bigint): string {
  return `${Number(formatEther(amountWei)).toFixed(2)} ETH`;
}

export function escrowTotal(escrow: Escrow): bigint {
  return escrow.milestones.reduce((total, milestone) => total + milestone.amountWei, 0n);
}
