export const taskloopChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 16602);

export const zeroGTestnet = {
  id: 16602,
  name: "0G Galileo Testnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL ?? "https://evmrpc-testnet.0g.ai"] }
  },
  blockExplorers: {
    default: { name: "0G Chain Scan", url: "https://chainscan-galileo.0g.ai" }
  },
  testnet: true
} as const;
