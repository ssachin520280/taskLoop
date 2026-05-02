export type MilestoneReleaseInput = {
  chainId: number;
  escrowAddress: `0x${string}`;
  milestoneId: string;
  amount: string;
  reason: string;
};

export type ExecutionStatus = "queued" | "submitted" | "confirmed" | "failed";

export type MilestoneExecutionResult = {
  status: ExecutionStatus;
  txHash?: `0x${string}`;
  provider: string;
  explorerUrl?: string;
  rawResponse: unknown;
};

export type ExecutionProvider = {
  name: string;
  executeMilestoneRelease: (input: MilestoneReleaseInput) => Promise<MilestoneExecutionResult>;
};
