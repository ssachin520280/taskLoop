"use client";

import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { mainnet } from "wagmi/chains";

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || undefined;
const ensRpcUrl = process.env.NEXT_PUBLIC_ENS_RPC_URL || undefined;

const zeroGTestnet = {
  id: 16602,
  name: "0G Galileo Testnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: {
    default: { http: [rpcUrl ?? "https://evmrpc-testnet.0g.ai"] }
  },
  blockExplorers: {
    default: { name: "0G Chain Scan", url: "https://chainscan-galileo.0g.ai" }
  },
  testnet: true
} as const;

export const wagmiConfig = createConfig({
  chains: [zeroGTestnet, mainnet],
  connectors: [injected()],
  transports: {
    [zeroGTestnet.id]: http(rpcUrl ?? zeroGTestnet.rpcUrls.default.http[0]),
    [mainnet.id]: http(ensRpcUrl)
  },
  ssr: true
});
