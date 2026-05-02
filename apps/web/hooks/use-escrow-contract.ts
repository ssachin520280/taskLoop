"use client";

import { milestoneEscrowAbi } from "@taskloop/shared";
import { useMemo, useState } from "react";
import { isAddress, type Hex } from "viem";
import { usePublicClient, useReadContracts, useWriteContract } from "wagmi";
import { useToast } from "@/components/toast-provider";
import type { Escrow, FundingStatus, Milestone, MilestoneStatus } from "@/lib/escrow";
import { escrowTotal } from "@/lib/escrow";

type ChainMilestoneTuple = readonly [string, bigint, string, number, bigint, bigint, bigint];
type ChainMilestoneObject = {
  title: string;
  amount: bigint;
  evidence: string;
  status: number;
  submittedAt: bigint;
  approvedAt: bigint;
  releasedAt: bigint;
};
type ChainMilestone = ChainMilestoneTuple | ChainMilestoneObject;

export type EscrowContractState = {
  escrow?: Escrow;
  isReading: boolean;
  pendingAction?: string;
  error?: string;
  refetch: () => void;
  actions: {
    fundEscrow: () => Promise<void>;
    submitEvidence: (milestoneId: string, evidence: string) => Promise<void>;
    approveMilestone: (milestoneId: string) => Promise<void>;
    releaseMilestone: (milestoneId: string) => Promise<void>;
    disputeMilestone: (milestoneId: string, reason?: string) => Promise<void>;
  };
};

const escrowStatusLabels = ["pending", "funded", "released", "released"] as const;
const milestoneStatusLabels: MilestoneStatus[] = ["pending", "submitted", "approved", "paid", "disputed"];

export function useEscrowContract(escrowId: string): EscrowContractState {
  const address = isAddress(escrowId) ? escrowId : undefined;
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();
  const [pendingAction, setPendingAction] = useState<string>();
  const [error, setError] = useState<string>();

  const readContracts = useMemo(
    () =>
      address
        ? ([
            { address, abi: milestoneEscrowAbi, functionName: "client" },
            { address, abi: milestoneEscrowAbi, functionName: "freelancer" },
            { address, abi: milestoneEscrowAbi, functionName: "totalAmount" },
            { address, abi: milestoneEscrowAbi, functionName: "releasedAmount" },
            { address, abi: milestoneEscrowAbi, functionName: "status" },
            { address, abi: milestoneEscrowAbi, functionName: "getMilestones" }
          ] as const)
        : undefined,
    [address]
  );

  const { data, isLoading, refetch } = useReadContracts({
    contracts: readContracts as NonNullable<Parameters<typeof useReadContracts>[0]>["contracts"],
    query: {
      enabled: Boolean(address)
    }
  });

  const chainEscrow = useMemo(() => {
    if (!address || !data || data.some((item) => item.status !== "success")) {
      return undefined;
    }

    const [client, freelancer, totalAmount, releasedAmount, status, milestones] = data.map((item) => item.result) as [
      `0x${string}`,
      `0x${string}`,
      bigint,
      bigint,
      number,
      ChainMilestone[]
    ];
    const mappedMilestones = (milestones as ChainMilestone[]).map(mapChainMilestone);
    const fundingStatus = mapFundingStatus(Number(status), totalAmount, releasedAmount);

    return {
      id: address,
      title: "Onchain TaskLoop escrow",
      summary: "Live escrow loaded from the MilestoneEscrow contract.",
      description: "This escrow is read directly from chain. Project metadata can be added offchain later.",
      client: "Client wallet",
      clientWallet: client,
      freelancer: "Freelancer wallet",
      freelancerWallet: freelancer,
      role: "client",
      status: escrowStatusLabels[Number(status)] ?? "pending",
      fundingStatus,
      dueDate: "Onchain",
      createdAt: "Onchain",
      agentScore: 0,
      agentRecommendation: "Agent review will run after evidence submission.",
      chain: "Connected chain",
      milestones: mappedMilestones,
      evidence: mappedMilestones.flatMap((milestone) => milestone.evidence),
    } satisfies Escrow;
  }, [address, data]);
  const payableAmountWei = chainEscrow ? escrowTotal(chainEscrow) : 0n;

  async function runWrite(label: string, request: (contractAddress: `0x${string}`) => Promise<Hex>): Promise<void> {
    const contractAddress = address;
    if (!contractAddress) {
      throw new Error("Escrow contract address is required");
    }

    setPendingAction(label);
    setError(undefined);

    try {
      const hash = await request(contractAddress);
      toast({ title: `${label} submitted`, description: hash, tone: "info" });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      await refetch();
      toast({ title: `${label} confirmed`, tone: "success" });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : `${label} failed`;
      setError(message);
      toast({ title: `${label} failed`, description: message, tone: "error" });
      throw caught;
    } finally {
      setPendingAction(undefined);
    }
  }

  return {
    escrow: chainEscrow,
    isReading: isLoading,
    pendingAction,
    error,
    refetch,
    actions: {
      fundEscrow: () =>
        runWrite("Fund escrow", (contractAddress) =>
          writeContractAsync({
            address: contractAddress,
            abi: milestoneEscrowAbi,
            functionName: "fund",
            value: payableAmountWei
          })
        ),
      submitEvidence: (milestoneId, evidence) =>
        runWrite("Submit evidence", (contractAddress) =>
          writeContractAsync({
            address: contractAddress,
            abi: milestoneEscrowAbi,
            functionName: "submitEvidence",
            args: [BigInt(readMilestoneIndex(milestoneId)), evidence]
          })
        ),
      approveMilestone: (milestoneId) =>
        runWrite("Approve milestone", (contractAddress) =>
          writeContractAsync({
            address: contractAddress,
            abi: milestoneEscrowAbi,
            functionName: "approveMilestone",
            args: [BigInt(readMilestoneIndex(milestoneId))]
          })
        ),
      releaseMilestone: (milestoneId) =>
        runWrite("Release milestone", (contractAddress) =>
          writeContractAsync({
            address: contractAddress,
            abi: milestoneEscrowAbi,
            functionName: "approveMilestone",
            args: [BigInt(readMilestoneIndex(milestoneId))]
          })
        ),
      disputeMilestone: (milestoneId, reason = "Manual dispute from TaskLoop UI") =>
        runWrite("Dispute milestone", (contractAddress) =>
          writeContractAsync({
            address: contractAddress,
            abi: milestoneEscrowAbi,
            functionName: "disputeMilestone",
            args: [BigInt(readMilestoneIndex(milestoneId)), reason]
          })
        )
    }
  };
}

function mapChainMilestone(milestone: ChainMilestone, index: number): Milestone {
  const { title, amountWei, evidence, status } = readChainMilestone(milestone);
  const hasEvidence = evidence.length > 0;

  return {
    id: String(index),
    title,
    dueDate: "Onchain",
    amountWei,
    status: milestoneStatusLabels[status] ?? "pending",
    evidenceCount: hasEvidence ? 1 : 0,
    evidence: hasEvidence
      ? [
          {
            id: `${index}-chain-evidence`,
            label: evidence,
            submittedBy: "freelancer",
            submittedAt: "Onchain",
            uri: evidence
          }
        ]
      : [],
    agentNote: hasEvidence ? "Evidence is available for agent review." : "Waiting for freelancer evidence."
  };
}

function readChainMilestone(milestone: ChainMilestone): {
  title: string;
  amountWei: bigint;
  evidence: string;
  status: number;
} {
  if (isChainMilestoneObject(milestone)) {
    return {
      title: milestone.title,
      amountWei: milestone.amount,
      evidence: milestone.evidence,
      status: milestone.status
    };
  }

  const [title, amountWei, evidence, status] = milestone;
  return { title, amountWei, evidence, status };
}

function isChainMilestoneObject(milestone: ChainMilestone): milestone is ChainMilestoneObject {
  return "title" in milestone;
}

function mapFundingStatus(status: number, totalAmount: bigint, releasedAmount: bigint): FundingStatus {
  if (status === 0) {
    return "unfunded";
  }

  if (releasedAmount === totalAmount) {
    return "completed";
  }

  if (releasedAmount > 0n) {
    return "partially_released";
  }

  return "funded";
}

function readMilestoneIndex(milestoneId: string): number {
  if (milestoneId.startsWith("m")) {
    const parsedId = Number(milestoneId.slice(1));
    return Number.isNaN(parsedId) ? 0 : Math.max(parsedId - 1, 0);
  }

  const parsed = Number(milestoneId);
  return Number.isNaN(parsed) ? 0 : parsed;
}
