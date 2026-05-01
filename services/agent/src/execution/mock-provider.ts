import { createHash } from "node:crypto";
import { buildExplorerUrl } from "./explorer";
import type { ExecutionProvider, MilestoneExecutionResult, MilestoneReleaseInput } from "./types";

export class MockExecutionProvider implements ExecutionProvider {
  readonly name = "mock";

  async executeMilestoneRelease(input: MilestoneReleaseInput): Promise<MilestoneExecutionResult> {
    const txHash = buildMockTxHash(input);

    return {
      status: "mocked",
      txHash,
      provider: this.name,
      explorerUrl: buildExplorerUrl(input.chainId, txHash),
      rawResponse: {
        mode: "local-demo",
        message: "KeeperHub config is missing, so no onchain transaction was submitted.",
        request: input
      }
    };
  }
}

function buildMockTxHash(input: MilestoneReleaseInput): `0x${string}` {
  const digest = createHash("sha256").update(JSON.stringify(input)).digest("hex");

  return `0x${digest}`;
}
