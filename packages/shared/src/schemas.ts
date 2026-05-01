import { z } from "zod";
import { EscrowStatus, MilestoneStatus, TaskStatus } from "./types";

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

export const tokenAmountSchema = z
  .string()
  .trim()
  .min(1, "Amount is required")
  .regex(/^\d+(\.\d{1,18})?$/, "Use a valid ETH amount")
  .refine((value) => Number(value) > 0, "Amount must be greater than zero");

export const createEscrowMilestoneSchema = z.object({
  title: z.string().trim().min(1, "Milestone title is required").max(120),
  amountEth: tokenAmountSchema
});

export const ensNameSchema = z
  .string()
  .trim()
  .max(120)
  .refine((value) => value.length === 0 || /^\S+\.\S+$/.test(value), "Use a valid ENS name");

export const createEscrowFormSchema = z
  .object({
    freelancer: addressSchema,
    ensName: ensNameSchema.optional(),
    title: z.string().trim().min(1, "Project title is required").max(120),
    description: z.string().trim().min(1, "Project description is required").max(1000),
    milestones: z.array(createEscrowMilestoneSchema).min(1, "Add at least one milestone").max(3, "Use up to 3 milestones")
  })
  .refine(
    (value) => value.milestones.some((milestone) => Number(milestone.amountEth) > 0),
    "Milestone total must be greater than zero"
  );

export const evidenceSubmissionFormSchema = z.object({
  milestoneId: z.coerce.number().int().min(0),
  evidence: z.string().trim().min(1, "Evidence hash or URI is required").max(500)
});

export const milestoneSchema = z.object({
  id: z.number().int().min(0),
  title: z.string().min(1),
  amountWei: z.bigint().nonnegative(),
  evidence: z.string().optional(),
  status: z.nativeEnum(MilestoneStatus),
  submittedAt: z.number().int().nonnegative().optional(),
  approvedAt: z.number().int().nonnegative().optional(),
  releasedAt: z.number().int().nonnegative().optional()
});

export const escrowSchema = z.object({
  id: z.string().min(1),
  contractAddress: addressSchema,
  client: addressSchema,
  freelancer: addressSchema,
  totalAmountWei: z.bigint().nonnegative(),
  releasedAmountWei: z.bigint().nonnegative(),
  status: z.nativeEnum(EscrowStatus),
  milestones: z.array(milestoneSchema),
  createdAt: z.number().int().nonnegative().optional(),
  chainId: z.number().int().positive().optional()
});

export type AgentTaskInput = z.infer<typeof agentTaskSchema>;
export type AgentEvaluationInput = z.infer<typeof agentEvaluationSchema>;
export type ExecutionResultInput = z.infer<typeof executionResultSchema>;
export type CreateEscrowFormInput = z.infer<typeof createEscrowFormSchema>;
export type EvidenceSubmissionFormInput = z.infer<typeof evidenceSubmissionFormSchema>;
