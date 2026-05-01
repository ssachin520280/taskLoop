# TaskLoop

TaskLoop is an ETHGlobal Open Agents hackathon monorepo for agent task evaluation and execution orchestration.

## Stack

- `apps/web`: Next.js 15, TypeScript, Tailwind CSS
- `packages/contracts`: Foundry smart contracts
- `packages/shared`: shared TypeScript types, ABIs, and zod schemas
- `services/agent`: Node.js TypeScript orchestration service

## Quick Start

```bash
pnpm install
cp .env.example .env
pnpm dev
```

## Scripts

- `pnpm dev`: run the web app and agent service in parallel
- `pnpm build`: build every workspace package
- `pnpm test`: run tests across workspaces
- `pnpm lint`: lint every workspace package
- `pnpm typecheck`: type-check every workspace package
- `pnpm contracts:test`: run Foundry tests

## Project Layout

```text
apps/
  web/
packages/
  contracts/
  shared/
services/
  agent/
```

## Hackathon Notes

This scaffold is intentionally small. Add only what helps validate the loop: task creation, agent evaluation, execution, and onchain settlement.

## 0G Storage

`services/agent` includes a small 0G Storage module for persisting milestone evidence summaries, agent review logs, and decision payloads. Configure `ZG_STORAGE_RPC_URL`, `ZG_STORAGE_INDEXER_URL`, and `ZG_STORAGE_PRIVATE_KEY`, then use `uploadJson`, `uploadText`, and `getFileMetadata` from `services/agent/src/storage/zero-g.ts`.
