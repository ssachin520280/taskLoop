# TaskLoop Agent Service

Node.js TypeScript service for agent evaluation and execution orchestration.

## 0G Storage

The agent can persist lightweight artifacts to 0G Storage:

- Milestone evidence summaries
- Agent review logs
- Decision payloads used before approving or disputing payouts

Required environment variables:

```bash
ZG_STORAGE_RPC_URL=https://evmrpc-testnet.0g.ai
ZG_STORAGE_INDEXER_URL=https://indexer-storage-testnet-turbo.0g.ai
ZG_STORAGE_PRIVATE_KEY=your_agent_wallet_private_key
```

Expected workflow:

1. Build the summary, review log, or decision payload in the agent service.
2. Call `uploadJson(name, data)` for structured payloads or `uploadText(name, text)` for plain summaries.
3. Store the returned `rootHash` with the milestone or agent decision.
4. Call `getFileMetadata(rootHash)` when you need to confirm indexer availability before referencing the artifact.

The implementation lives in `src/storage/zero-g.ts` and intentionally supports only small single-file uploads for hackathon clarity.

## Milestone Review Engine

`src/review` provides a deterministic-first review engine for submitted milestone evidence.

```ts
import { reviewMilestoneEvidence } from "./src/review";

const result = await reviewMilestoneEvidence({
  escrow: {
    escrowId: "0x1234567890abcdef1234567890abcdef12345678",
    title: "Landing page refresh",
    description: "Refresh the landing page"
  },
  milestone: {
    milestoneId: "m2",
    title: "Responsive implementation",
    amountEth: "0.32"
  },
  evidenceUri: "ipfs://...",
  freelancerNotes: "Preview deployment, screenshot diff, and commit hash are included."
});

console.log(result.review.verdict);
console.log(result.rootHash);
```

Output shape:

```ts
{
  review: {
    verdict: "approve" | "needs_review" | "reject",
    confidence: number,
    summary: string,
    reasons: string[],
    recommendedAction: "release" | "request_more_info" | "dispute_review",
    generatedAt: string
  },
  rootHash: string,
  txHash?: string
}
```

The engine starts with deterministic rules and accepts an optional `AgentReviewProvider` so any LLM or agent runtime can refine the draft without coupling TaskLoop to one vendor. The final review payload is persisted to 0G Storage with `uploadJson`.

## KeeperHub Execution Adapter

`src/execution` abstracts reliable onchain execution for milestone payouts.

```ts
import { executeMilestoneRelease } from "./src/execution";

const result = await executeMilestoneRelease({
  chainId: 11155111,
  escrowAddress: "0x1234567890123456789012345678901234567890",
  milestoneId: "m2",
  amount: "320000000000000000",
  reason: "Agent review recommended release."
});

console.log(result.status);
console.log(result.txHash);
```

Optional KeeperHub environment variables:

```bash
KEEPERHUB_API_URL=https://keeperhub.example/api/execute
KEEPERHUB_API_KEY=your_keeperhub_api_key
KEEPERHUB_WORKFLOW_ID=taskloop-release-milestone
KEEPERHUB_EXPLORER_BASE_URL=
```

Expected workflow:

1. Build or load the milestone review decision.
2. Call `executeMilestoneRelease({ chainId, escrowAddress, milestoneId, amount, reason })`, where `amount` is a contract-ready decimal string such as wei.
3. If `KEEPERHUB_API_URL` and `KEEPERHUB_API_KEY` are configured, the adapter sends a generic HTTP request ready for KeeperHub or MCP-backed execution.
4. If KeeperHub config is missing, the adapter returns a failed configuration result instead of fabricating execution.

`KEEPERHUB_EXPLORER_BASE_URL` is optional. Leave it blank to use built-in explorer defaults for supported chains, or set it when KeeperHub returns transactions for a custom chain.

The adapter intentionally does not depend on a fake SDK. Swap the HTTP request body or provider implementation once the real KeeperHub integration contract is available.

## Review-to-Execution Orchestration

`src/review-execution` connects the milestone review engine to the KeeperHub execution adapter.

```ts
import { reviewAndExecuteMilestoneRelease } from "./src/review-execution";

const result = await reviewAndExecuteMilestoneRelease({
  escrow: {
    escrowId: "0x1234567890123456789012345678901234567890",
    title: "Landing page refresh"
  },
  milestone: {
    milestoneId: "m2",
    title: "Responsive implementation",
    amountEth: "0.32"
  },
  evidenceUri: "ipfs://...",
  freelancerNotes: "Preview, screenshots, and commit hash are included.",
  release: {
    chainId: 11155111,
    escrowAddress: "0x1234567890123456789012345678901234567890",
    milestoneId: "m2",
    amount: "320000000000000000"
  }
});

console.log(result.review.verdict);
console.log(result.execution.status);
```

The service flow is:

1. Generate and persist the milestone review.
2. Check `verdict === "approve"` and `confidence >= TASKLOOP_RELEASE_CONFIDENCE_THRESHOLD`.
3. If release details are supplied, call `executeMilestoneRelease` through the execution provider.
4. Persist an execution log to 0G Storage whether execution is triggered or skipped.
5. Return the review, review root hash, execution decision, and execution log root hash.

Optional threshold:

```bash
TASKLOOP_REVIEW_API_KEY=replace_me_for_release_execution
TASKLOOP_RELEASE_CONFIDENCE_THRESHOLD=0.85
```

When release details are omitted, the response still includes a skipped execution log. This keeps review-only runs safe while allowing real contract escrows to trigger KeeperHub-backed payout execution.

The web API route requires `TASKLOOP_REVIEW_API_KEY` before it will accept release execution details. Until a real session or wallet-signature auth layer is added, this prevents an unauthenticated request from triggering KeeperHub execution.

The browser UI currently requests review only and receives a skipped execution log. Trusted server-to-server callers can include the release payload plus the API key header to trigger execution through KeeperHub.
