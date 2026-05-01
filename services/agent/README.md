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
    escrowId: "escrow-101",
    title: "Landing page refresh",
    description: "Refresh the demo landing page"
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
