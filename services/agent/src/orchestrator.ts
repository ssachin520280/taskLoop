import { createHash } from "node:crypto";
import {
  executionResultSchema,
  TaskStatus,
  type AgentEvaluation,
  type AgentTask,
  type ExecutionResult
} from "@taskloop/shared";

export async function executeTask(task: AgentTask, evaluation: AgentEvaluation): Promise<ExecutionResult> {
  if (!evaluation.shouldExecute) {
    return executionResultSchema.parse({
      taskId: task.id,
      status: TaskStatus.Failed,
      output: evaluation.rationale
    });
  }

  const output = `Executed task "${task.prompt}" with score ${evaluation.score}.`;
  const resultHash = `0x${createHash("sha256").update(output).digest("hex")}` as `0x${string}`;

  return executionResultSchema.parse({
    taskId: task.id,
    status: TaskStatus.Completed,
    output,
    resultHash
  });
}
