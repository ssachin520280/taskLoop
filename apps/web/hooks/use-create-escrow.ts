"use client";

import { useState } from "react";
import { escrowFactoryAbi, type CreateEscrowFormInput } from "@taskloop/shared";
import { decodeEventLog, type Hex } from "viem";
import { usePublicClient, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useToast } from "@/components/toast-provider";
import { contractAddresses } from "@/lib/contracts/config";
import {
  mockCreateEscrowAdapter,
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
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: transactionHash });
  const { toast } = useToast();

  async function submitCreateEscrow(form: CreateEscrowFormInput): Promise<CreateEscrowResult> {
    setState({ isSubmitting: true });

    try {
      const draft = toCreateEscrowContractDraft(form);
      const result = contractAddresses.escrowFactory
        ? await writeCreateEscrow(draft.freelancer, draft.milestones)
        : await mockCreateEscrowAdapter.createEscrow(draft);

      setState({ isSubmitting: false, result });
      toast({
        title: contractAddresses.escrowFactory ? "Escrow transaction sent" : "Mock escrow created",
        description: contractAddresses.escrowFactory ? result.txHash : "No factory address configured, using demo mode.",
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

    const hash = await writeContractAsync({
      address: contractAddresses.escrowFactory,
      abi: escrowFactoryAbi,
      functionName: "createEscrow",
      args: [freelancer, milestones]
    });

    setTransactionHash(hash);
    const receipt = publicClient ? await publicClient.waitForTransactionReceipt({ hash }) : undefined;
    const escrowAddress = receipt ? readEscrowAddressFromReceipt(receipt.logs) : readEscrowAddressFromHashFallback(hash);

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

function readEscrowAddressFromHashFallback(hash: Hex): `0x${string}` {
  // The transaction receipt parser in the detail flow can replace this after confirmation.
  return `0x${hash.slice(-40)}`;
}
