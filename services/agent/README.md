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
