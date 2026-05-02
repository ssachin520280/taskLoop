import { buildExplorerUrl } from "./explorer";
import type { ExecutionProvider, ExecutionStatus, MilestoneExecutionResult, MilestoneReleaseInput } from "./types";

export type KeeperHubConfig = {
  apiUrl?: string;
  apiKey?: string;
  workflowId?: string;
};

type KeeperHubResponse = {
  status?: string;
  txHash?: string;
  transactionHash?: string;
  explorerUrl?: string;
  [key: string]: unknown;
};

export class KeeperHubExecutionProvider implements ExecutionProvider {
  readonly name = "keeperhub";
  private readonly config: KeeperHubConfig;

  constructor(config: KeeperHubConfig = readKeeperHubConfig()) {
    this.config = config;
  }

  async executeMilestoneRelease(input: MilestoneReleaseInput): Promise<MilestoneExecutionResult> {
    const { apiUrl, apiKey, workflowId } = this.config;

    if (!apiUrl || !apiKey) {
      return {
        status: "failed",
        provider: this.name,
        rawResponse: {
          error: "KEEPERHUB_API_URL and KEEPERHUB_API_KEY are required for release execution."
        }
      };
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        workflowId,
        action: "releaseMilestone",
        chainId: input.chainId,
        escrowAddress: input.escrowAddress,
        milestoneId: input.milestoneId,
        amount: input.amount,
        reason: input.reason
      })
    });

    const rawResponse = (await readKeeperHubResponse(response)) as KeeperHubResponse;

    if (!response.ok) {
      return {
        status: "failed",
        provider: this.name,
        rawResponse
      };
    }

    const txHash = normalizeTxHash(rawResponse.txHash ?? rawResponse.transactionHash);

    return {
      status: normalizeStatus(rawResponse.status, txHash),
      txHash,
      provider: this.name,
      explorerUrl: rawResponse.explorerUrl ?? (txHash ? buildExplorerUrl(input.chainId, txHash) : undefined),
      rawResponse
    };
  }
}

export function readKeeperHubConfig(): KeeperHubConfig {
  return {
    apiUrl: process.env.KEEPERHUB_API_URL?.trim(),
    apiKey: process.env.KEEPERHUB_API_KEY?.trim(),
    workflowId: process.env.KEEPERHUB_WORKFLOW_ID?.trim()
  };
}

async function readKeeperHubResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return { statusCode: response.status };
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      statusCode: response.status,
      body: text
    };
  }
}

function normalizeStatus(status: string | undefined, txHash?: `0x${string}`): ExecutionStatus {
  const normalizedStatus = status?.toLowerCase();

  if (
    normalizedStatus === "queued" ||
    normalizedStatus === "submitted" ||
    normalizedStatus === "confirmed" ||
    normalizedStatus === "failed"
  ) {
    return normalizedStatus;
  }

  return txHash ? "submitted" : "queued";
}

function normalizeTxHash(txHash: string | undefined): `0x${string}` | undefined {
  return txHash?.startsWith("0x") ? (txHash as `0x${string}`) : undefined;
}
