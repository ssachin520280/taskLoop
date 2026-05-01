"use client";

import { mainnet } from "wagmi/chains";
import { useEnsName as useWagmiEnsName } from "wagmi";
import { formatAddress } from "@taskloop/shared";
import { isAddress, type Address } from "viem";

export type UseEnsNameResult = {
  ensName?: string;
  displayName: string;
  isLoading: boolean;
  isError: boolean;
  error?: Error;
};

export function useEnsName(address?: Address | string): UseEnsNameResult {
  const normalizedAddress: Address | undefined = typeof address === "string" && isAddress(address) ? address : undefined;
  const { data, error, isError, isLoading } = useWagmiEnsName({
    address: normalizedAddress,
    chainId: mainnet.id,
    query: {
      enabled: Boolean(normalizedAddress),
      retry: false
    }
  });

  return {
    ensName: data ?? undefined,
    displayName: data ?? formatAddress(normalizedAddress),
    isLoading,
    isError,
    error: error ?? undefined
  };
}
