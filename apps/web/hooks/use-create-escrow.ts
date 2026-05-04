"use client";

import { escrowFactoryAbi, type CreateEscrowFormInput } from "@taskloop/shared";
import { useState } from "react";
import { decodeEventLog, type Hex } from "viem";
import { useAccount, usePublicClient, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useToast } from "@/components/toast-provider";
import { taskloopChainId } from "@/lib/chains";
import { contractAddresses } from "@/lib/contracts/config";
import {
  toCreateEscrowContractDraft,
  type CreateEscrowResult
} from "@/lib/contracts/create-escrow-adapter";

export type CreateEscrowState = {
  isSubmitting: boolean;
  result?: CreateEscrowResult;
  error?: string;
};

export type UseCreateEscrowResult = CreateEscrowState & {
  submitCreateEscrow: (form: CreateEscrowFormInput) => Promise<CreateEscrowResult>;
  resetCreateEscrow: () => void;
  transactionHash?: Hex;
};

export function useCreateEscrow(): UseCreateEscrowResult {
  const [state, setState] = useState<CreateEscrowState>({ isSubmitting: false });
  const [transactionHash, setTransactionHash] = useState<Hex>();
  const { chainId } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient({ chainId: taskloopChainId });
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ chainId: taskloopChainId, hash: transactionHash });
  const { toast } = useToast();

  async function submitCreateEscrow(form: CreateEscrowFormInput): Promise<CreateEscrowResult> {
    setState({ isSubmitting: true });

    try {
      const draft = toCreateEscrowContractDraft(form);
      const result = await writeCreateEscrow(draft.freelancer, draft.milestones);

      setState({ isSubmitting: false, result });
      toast({
        title: "Escrow transaction sent",
        description: result.txHash,
        tone: "success"
      });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create escrow";
      setState({ isSubmitting: false, error: message });
      toast({ title: "Create escrow failed", description: message, tone: "error" });
      throw error;
    }
  }

  function resetCreateEscrow(): void {
    setState({ isSubmitting: false });
  }

  return {
    ...state,
    isSubmitting: state.isSubmitting || isConfirming,
    submitCreateEscrow,
    resetCreateEscrow,
    transactionHash
  };

  async function writeCreateEscrow(
    freelancer: `0x${string}`,
    milestones: Array<{ title: string; amount: bigint }>
  ): Promise<CreateEscrowResult> {
    if (!contractAddresses.escrowFactory) {
      throw new Error("Missing NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS");
    }

    if (chainId !== taskloopChainId) {
      await switchChainAsync({ chainId: taskloopChainId });
    }

    const hash = await writeContractAsync({
      address: contractAddresses.escrowFactory,
      abi: escrowFactoryAbi,
      chainId: taskloopChainId,
      functionName: "createEscrow",
      args: [freelancer, milestones]
    });

    setTransactionHash(hash);
    if (!publicClient) {
      throw new Error("A public client is required to read the escrow creation receipt");
    }

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const escrowAddress = readEscrowAddressFromReceipt(receipt.logs);

    return {
      escrowId: escrowAddress,
      escrowAddress,
      mode: "contract",
      txHash: hash
    };
  }
}

function readEscrowAddressFromReceipt(logs: Array<{ topics: readonly Hex[]; data: Hex }>): `0x${string}` {
  for (const log of logs) {
    try {
      const event = decodeEventLog({
        abi: escrowFactoryAbi,
        data: log.data,
        topics: [...log.topics] as [] | [Hex, ...Hex[]]
      });

      if (event.eventName === "EscrowCreated") {
        return event.args.escrow;
      }
    } catch {
      // Ignore logs emitted by other contracts in the same transaction.
    }
  }

  throw new Error("EscrowCreated event was not found in the transaction receipt");
}

