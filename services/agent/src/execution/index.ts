import { KeeperHubExecutionProvider } from "./keeperhub-provider";
import type { ExecutionProvider, MilestoneExecutionResult, MilestoneReleaseInput } from "./types";

export function createExecutionProvider(): ExecutionProvider {
  return new KeeperHubExecutionProvider();
}

export async function executeMilestoneRelease(input: MilestoneReleaseInput): Promise<MilestoneExecutionResult> {
  return createExecutionProvider().executeMilestoneRelease(input);
}

export { KeeperHubExecutionProvider, readKeeperHubConfig } from "./keeperhub-provider";
export { MockExecutionProvider } from "./mock-provider";
export type { ExecutionProvider, ExecutionStatus, MilestoneExecutionResult, MilestoneReleaseInput } from "./types";
