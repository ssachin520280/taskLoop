"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { truncateAddress } from "@/lib/utils";

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const connector = connectors[0];

  function handleConnect() {
    if (!connector) {
      return;
    }

    connect({ connector });
  }

  if (isConnected) {
    return (
      <Button variant="secondary" onClick={() => disconnect()} title={address}>
        {truncateAddress(address)}
      </Button>
    );
  }

  return (
    <Button variant="yellow" disabled={!connector || isPending} onClick={handleConnect}>
      {isPending ? "Connecting..." : "Connect wallet"}
    </Button>
  );
}
