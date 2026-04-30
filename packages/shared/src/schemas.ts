import { z } from "zod";
import { TaskStatus } from "./types";

export const addressSchema = z.custom<`0x${string}`>(
  (value) => typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value),
  "Expected an EVM address"
);

export const agentTaskSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  requester: addressSchema,
  status: z.nativeEnum(TaskStatus),
  createdAt: z.string().datetime()
});

export const agentEvaluationSchema = z.object({
  taskId: z.string().min(1),
  score: z.number().min(0).max(1),
  rationale: z.string().min(1),
  shouldExecute: z.boolean()
});

export const executionResultSchema = z.object({
  taskId: z.string().min(1),
  status: z.union([z.literal(TaskStatus.Completed), z.literal(TaskStatus.Failed)]),
  output: z.string(),
  resultHash: z.custom<`0x${string}`>((value) => typeof value === "string" && /^0x[a-fA-F0-9]{64}$/.test(value)).optional()
});

export type AgentTaskInput = z.infer<typeof agentTaskSchema>;
export type AgentEvaluationInput = z.infer<typeof agentEvaluationSchema>;
export type ExecutionResultInput = z.infer<typeof executionResultSchema>;
