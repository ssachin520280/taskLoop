# TaskLoop

Agent-reviewed milestone escrow for crypto freelancers.

TaskLoop helps clients and freelancers move from "work submitted" to "payout released" with less manual review. Milestone evidence is evaluated by an agent, stored as durable review memory, and routed toward reliable onchain execution when the review is confident enough.

## Problem

Crypto freelance work still relies on slow, trust-heavy coordination:

- Clients must manually inspect every milestone before releasing funds.
- Freelancers wait for payouts even when evidence is clear.
- Disputes lack a shared review trail.
- Wallet addresses are hard to recognize during a demo or real workflow.
- Agent decisions often happen offchain without durable provenance.

## Solution

TaskLoop is a milestone escrow system with an agent review layer. Clients create and fund escrow contracts, freelancers submit evidence, and the agent evaluates whether the milestone should be released, escalated, or disputed. Review payloads and execution logs are persisted to 0G, ENS makes identities readable, and KeeperHub is the adapter for reliable payout execution.

## How It Works

1. A client creates an escrow with 1-3 milestones.
2. The client funds the escrow contract.
3. The freelancer submits evidence for a milestone.
4. TaskLoop generates a structured agent review: verdict, confidence, reasons, and recommended action.
5. The review payload is stored in 0G Storage.
6. If the review is `approve` and confidence is above the configured threshold, a trusted execution path can call KeeperHub to release the milestone.
7. The execution decision and provider response are logged back to 0G.

## Architecture

```text
apps/web
  Next.js app, wallet UX, ENS display, escrow pages, review API route

packages/contracts
  Foundry contracts for EscrowFactory and MilestoneEscrow

packages/shared
  Shared TypeScript types, zod schemas, ABI exports, formatters

services/agent
  Review engine, 0G storage adapter, KeeperHub execution adapter,
  review-to-execution orchestration service
```

The web app calls `POST /api/review-milestone`. That route validates input, calls the agent orchestration service, persists review/execution artifacts to 0G, and returns the combined result to the UI.

## Sponsor Integrations

### ENS for Identity

TaskLoop resolves ENS names for wallet addresses and ENS inputs in the escrow flow. This makes client and freelancer identities readable, judge-friendly, and safer than raw address-only UX.

### 0G for Agent Memory and Review Storage

The agent service stores milestone reviews, decision payloads, and execution logs in 0G Storage. Each review returns a root hash that can be shown in the UI and referenced later during disputes or audits.

### KeeperHub for Reliable Execution

TaskLoop includes a `KeeperHubExecutionProvider` behind a generic `ExecutionProvider` interface. When KeeperHub credentials are configured, the agent can route approved milestone releases through KeeperHub. When credentials are missing, the adapter safely falls back to a mock provider for local demos.

## Smart Contracts

`packages/contracts` contains a Foundry project with:

- `EscrowFactory.sol`: deploys and tracks milestone escrow contracts.
- `MilestoneEscrow.sol`: manages client/freelancer roles, milestone funding, evidence submission, approvals, release, disputes, and cancellation refunds.

The contracts use clear events, custom errors, role modifiers, reentrancy protection, and hackathon-friendly milestone settlement logic.

## Tech Stack

- Next.js 15 App Router, React, TypeScript, Tailwind CSS
- wagmi and viem for wallet and contract integration
- ENS resolution via viem/wagmi
- Foundry and Solidity for escrow contracts
- Node.js TypeScript agent service
- Zod for validation
- 0G Storage SDK for persisted review memory
- KeeperHub-ready HTTP adapter for execution
- pnpm workspaces

## Local Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Useful commands:

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm contracts:test
pnpm --filter @taskloop/web dev
pnpm --filter @taskloop/agent dev
```

## Environment Variables

Start from `.env.example`.

```bash
# Web
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.gateway.tenderly.co
NEXT_PUBLIC_ENS_RPC_URL=https://eth.llamarpc.com
NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS=

# Agent service
AGENT_PORT=8787
RPC_URL=https://sepolia.gateway.tenderly.co
PRIVATE_KEY=
OPENAI_API_KEY=

# 0G Storage
ZG_STORAGE_RPC_URL=https://evmrpc-testnet.0g.ai
ZG_STORAGE_INDEXER_URL=https://indexer-storage-testnet-turbo.0g.ai
ZG_STORAGE_PRIVATE_KEY=
TASKLOOP_REVIEW_API_KEY=
TASKLOOP_RELEASE_CONFIDENCE_THRESHOLD=0.85

# KeeperHub execution
KEEPERHUB_API_URL=
KEEPERHUB_API_KEY=
KEEPERHUB_WORKFLOW_ID=taskloop-release-milestone
KEEPERHUB_EXPLORER_BASE_URL=
```

For local demos, KeeperHub env vars can be empty; the execution adapter returns a mock execution result. To trigger trusted release execution through the API route, configure `TASKLOOP_REVIEW_API_KEY` and provide the key from a server-to-server caller.

## Deployment

### Contracts

```bash
cd packages/contracts
forge build
forge test
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast
```

After deployment, set `NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS` and sync ABIs into `packages/shared` using the ABI sync workflow.

### Web App

```bash
pnpm --filter @taskloop/web build
pnpm --filter @taskloop/web start
```

Deploy `apps/web` to Vercel or another Next.js host with the public RPC, ENS RPC, contract address, 0G, and review API env vars configured.

### Agent Service

```bash
pnpm --filter @taskloop/agent build
pnpm --filter @taskloop/agent start
```

Run the agent service anywhere Node.js is supported. Configure 0G credentials for persistent review storage and KeeperHub credentials for real execution routing.

## Demo Flow

1. Open the landing page and connect a wallet.
2. Go to the dashboard and open a demo escrow.
3. Review readable client/freelancer identities with ENS fallbacks.
4. Submit milestone evidence as the freelancer.
5. Request an agent review from the milestone card.
6. Show the verdict, confidence, reasons, 0G review root, and execution log root.
7. Explain that trusted release execution is routed through KeeperHub when the review is approved above threshold.

## Roadmap

- Wallet-signature auth for protected review and execution requests.
- Server-side verification of release details against live contract state.
- Full KeeperHub production workflow integration.
- Richer agent review providers with model selection and reviewer policies.
- Onchain storage of 0G review roots for milestone auditability.
- Arbitration UI for disputed milestones.
- Multi-chain deployments and richer token support.
