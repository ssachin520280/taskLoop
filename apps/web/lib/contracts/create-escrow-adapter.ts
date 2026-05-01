import type { CreateEscrowFormInput } from "@taskloop/shared";
import { parseEther } from "viem";

export type CreateEscrowMilestoneArg = {
  title: string;
  amount: bigint;
};

export type CreateEscrowContractDraft = {
  freelancer: `0x${string}`;
  milestones: CreateEscrowMilestoneArg[];
  totalAmountWei: bigint;
};

export type CreateEscrowResult = {
  escrowId: string;
  escrowAddress: `0x${string}`;
  mode: "mock" | "contract";
  txHash?: `0x${string}`;
};

export type CreateEscrowAdapter = {
  createEscrow: (draft: CreateEscrowContractDraft) => Promise<CreateEscrowResult>;
};

export function toCreateEscrowContractDraft(form: CreateEscrowFormInput): CreateEscrowContractDraft {
  const milestones = form.milestones.map((milestone) => ({
    title: milestone.title,
    amount: parseEther(milestone.amountEth)
  }));

  return {
    freelancer: form.freelancer,
    milestones,
    totalAmountWei: milestones.reduce((total, milestone) => total + milestone.amount, 0n)
  };
}

export const mockCreateEscrowAdapter: CreateEscrowAdapter = {
  async createEscrow(draft) {
    await new Promise((resolve) => setTimeout(resolve, 650));

    return {
      escrowId: "escrow-101",
      escrowAddress: `0x${"1".repeat(40)}`,
      mode: "mock",
      txHash: `0x${draft.totalAmountWei.toString(16).padStart(64, "0").slice(0, 64)}`
    };
  }
};

export const contractCreateEscrowAdapter: CreateEscrowAdapter = {
  async createEscrow() {
    throw new Error("Contract create escrow adapter is not wired yet. Plug wagmi writeContract here.");
  }
};
