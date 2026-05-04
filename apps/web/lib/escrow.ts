import { formatEther } from "viem";

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
  txHash?: string;
  txUrl?: string;
  execution?: {
    status: "executed" | "skipped";
    reason: string;
    rootHash: string;
    txHash?: string;
    txUrl?: string;
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
  reviewRootHash?: string;
  executionRootHash?: string;
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

export function formatEth(amountWei: bigint): string {
  return `${Number(formatEther(amountWei)).toFixed(2)} 0G`;
}

export function escrowTotal(escrow: Escrow): bigint {
  return escrow.milestones.reduce((total, milestone) => total + milestone.amountWei, 0n);
}
