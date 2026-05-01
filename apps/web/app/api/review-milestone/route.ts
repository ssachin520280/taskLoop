import { reviewMilestoneEvidence } from "@taskloop/agent/review";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const reviewMilestoneRequestSchema = z.object({
  escrow: z.object({
    escrowId: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    client: z.string().optional(),
    freelancer: z.string().optional()
  }),
  milestone: z.object({
    milestoneId: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    amountEth: z.string().optional(),
    dueDate: z.string().optional()
  }),
  evidenceUri: z.string().trim().min(1).max(1000),
  freelancerNotes: z.string().trim().max(2000).optional()
});

class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized review request");
    this.name = "UnauthorizedError";
  }
}

export async function POST(request: NextRequest) {
  try {
    assertAuthorized(request);

    const body = await request.json();
    const input = reviewMilestoneRequestSchema.parse(body);
    const result = await reviewMilestoneEvidence(input);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid review request",
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Review orchestration failed"
      },
      { status: 500 }
    );
  }
}

function assertAuthorized(request: NextRequest): void {
  const expectedKey = process.env.TASKLOOP_REVIEW_API_KEY?.trim();

  if (!expectedKey) {
    return;
  }

  const bearerToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const headerKey = request.headers.get("x-taskloop-review-key");

  if (bearerToken !== expectedKey && headerKey !== expectedKey) {
    throw new UnauthorizedError();
  }
}
