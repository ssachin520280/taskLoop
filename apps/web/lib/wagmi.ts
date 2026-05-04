"use client";

import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { mainnet } from "wagmi/chains";
import { zeroGTestnet } from "@/lib/chains";

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || undefined;
const ensRpcUrl = process.env.NEXT_PUBLIC_ENS_RPC_URL || undefined;

export const wagmiConfig = createConfig({
  chains: [zeroGTestnet, mainnet],
  connectors: [injected()],
  transports: {
    [zeroGTestnet.id]: http(rpcUrl ?? zeroGTestnet.rpcUrls.default.http[0]),
    [mainnet.id]: http(ensRpcUrl)
  },
  ssr: true
});
