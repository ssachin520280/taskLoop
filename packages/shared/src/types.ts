export enum TaskStatus {
  Open = "open",
  Running = "running",
  Completed = "completed",
  Failed = "failed"
}

export enum EscrowStatus {
  Created = "created",
  Funded = "funded",
  Cancelled = "cancelled",
  Completed = "completed"
}

export enum MilestoneStatus {
  Pending = "pending",
  EvidenceSubmitted = "evidence_submitted",
  Approved = "approved",
  Released = "released",
  Disputed = "disputed"
}

export type Address = `0x${string}`;

export type Milestone = {
  id: number;
  title: string;
  amountWei: bigint;
  evidence?: string;
  status: MilestoneStatus;
  submittedAt?: number;
  approvedAt?: number;
  releasedAt?: number;
};

export type Escrow = {
  id: string;
  contractAddress: Address;
  client: Address;
  freelancer: Address;
  totalAmountWei: bigint;
  releasedAmountWei: bigint;
  status: EscrowStatus;
  milestones: Milestone[];
  createdAt?: number;
  chainId?: number;
};

export type AgentTask = {
  id: string;
  prompt: string;
  requester: Address;
  status: TaskStatus;
  createdAt: string;
};

export type AgentEvaluation = {
  taskId: string;
  score: number;
  rationale: string;
  shouldExecute: boolean;
};

export type ExecutionResult = {
  taskId: string;
  status: TaskStatus.Completed | TaskStatus.Failed;
  output: string;
  resultHash?: `0x${string}`;
};
