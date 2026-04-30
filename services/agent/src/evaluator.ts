import { agentEvaluationSchema, type AgentEvaluation, type AgentTask } from "@taskloop/shared";

export function evaluateTask(task: AgentTask): AgentEvaluation {
  const hasActionablePrompt = task.prompt.trim().split(/\s+/).length >= 3;
  const score = hasActionablePrompt ? 0.82 : 0.35;

  return agentEvaluationSchema.parse({
    taskId: task.id,
    score,
    rationale: hasActionablePrompt
      ? "Prompt has enough context for a first-pass agent execution."
      : "Prompt needs more detail before execution.",
    shouldExecute: score >= 0.7
  });
}
