"use client";

import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { mainnet, sepolia } from "wagmi/chains";

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || undefined;
const ensRpcUrl = process.env.NEXT_PUBLIC_ENS_RPC_URL || undefined;

export const wagmiConfig = createConfig({
  chains: [sepolia, mainnet],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(rpcUrl),
    [mainnet.id]: http(ensRpcUrl)
  },
  ssr: true
});
