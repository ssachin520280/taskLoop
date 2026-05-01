export function buildExplorerUrl(chainId: number, txHash: `0x${string}`): string | undefined {
  const explorerBaseUrl = process.env.KEEPERHUB_EXPLORER_BASE_URL?.trim() || defaultExplorerBaseUrl(chainId);

  return explorerBaseUrl ? `${explorerBaseUrl.replace(/\/$/, "")}/tx/${txHash}` : undefined;
}

function defaultExplorerBaseUrl(chainId: number): string | undefined {
  if (chainId === 1) {
    return "https://etherscan.io";
  }

  if (chainId === 11155111) {
    return "https://sepolia.etherscan.io";
  }

  return undefined;
}
