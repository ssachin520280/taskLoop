export enum TaskStatus {
  Open = "open",
  Running = "running",
  Completed = "completed",
  Failed = "failed"
}

export type AgentTask = {
  id: string;
  prompt: string;
  requester: `0x${string}`;
  status: TaskStatus;
  createdAt: string;
};

export type AgentEvaluation = {
  taskId: string;
  score: number;
  rationale: string;
  shouldExecute: boolean;
};

export type ExecutionResult = {
  taskId: string;
  status: TaskStatus.Completed | TaskStatus.Failed;
  output: string;
  resultHash?: `0x${string}`;
};
