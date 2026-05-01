"use client";

import { useState } from "react";
import type { CreateEscrowFormInput } from "@taskloop/shared";
import type { CreateEscrowAdapter, CreateEscrowResult } from "@/lib/contracts/create-escrow-adapter";
import { createEscrow } from "@/services/create-escrow-service";

export type CreateEscrowState = {
  isSubmitting: boolean;
  result?: CreateEscrowResult;
  error?: string;
};

export type UseCreateEscrowResult = CreateEscrowState & {
  submitCreateEscrow: (form: CreateEscrowFormInput) => Promise<CreateEscrowResult>;
  resetCreateEscrow: () => void;
};

export function useCreateEscrow(adapter?: CreateEscrowAdapter): UseCreateEscrowResult {
  const [state, setState] = useState<CreateEscrowState>({ isSubmitting: false });

  async function submitCreateEscrow(form: CreateEscrowFormInput): Promise<CreateEscrowResult> {
    setState({ isSubmitting: true });

    try {
      const result = await createEscrow(form, { adapter });
      setState({ isSubmitting: false, result });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create escrow";
      setState({ isSubmitting: false, error: message });
      throw error;
    }
  }

  function resetCreateEscrow(): void {
    setState({ isSubmitting: false });
  }

  return {
    ...state,
    submitCreateEscrow,
    resetCreateEscrow
  };
}
