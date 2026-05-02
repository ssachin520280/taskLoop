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
  mode: "contract";
  txHash?: `0x${string}`;
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
