# ABI Sync Plan

Keep ABI syncing simple:

1. Compile contracts:

   ```bash
   pnpm contracts:build
   ```

2. Sync ABIs from Foundry artifacts into `packages/shared`:

   ```bash
   pnpm --filter @taskloop/shared sync:abis
   ```

3. Rebuild or type-check consumers:

   ```bash
   pnpm --filter @taskloop/shared typecheck
   pnpm --filter @taskloop/web typecheck
   ```

## How It Works

The sync script reads:

- `packages/contracts/out/EscrowFactory.sol/EscrowFactory.json`
- `packages/contracts/out/MilestoneEscrow.sol/MilestoneEscrow.json`

Then writes:

- `packages/shared/src/abis/escrowFactory.ts`
- `packages/shared/src/abis/milestoneEscrow.ts`

Run the sync script after every Solidity ABI change. Commit the generated TypeScript ABI files so the web app can import them without needing Foundry installed.
