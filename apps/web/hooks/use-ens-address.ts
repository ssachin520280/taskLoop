"use client";

import { mainnet } from "wagmi/chains";
import { useEnsAddress as useWagmiEnsAddress } from "wagmi";
import type { Address } from "viem";
import { normalizeEnsName } from "@/lib/ens";

export type UseEnsAddressResult = {
  address?: Address;
  normalizedName?: string;
  isLoading: boolean;
  isError: boolean;
  error?: Error;
};

export function useEnsAddress(name?: string): UseEnsAddressResult {
  const normalizedName = normalizeEnsName(name);
  const { data, error, isError, isLoading } = useWagmiEnsAddress({
    name: normalizedName,
    chainId: mainnet.id,
    query: {
      enabled: Boolean(normalizedName),
      retry: false
    }
  });

  return {
    address: data ?? undefined,
    normalizedName,
    isLoading,
    isError,
    error: error ?? undefined
  };
}
