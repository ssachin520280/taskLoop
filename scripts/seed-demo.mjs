import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const outputPath = resolve("apps/web/lib/demo-seed.json");
const generatedAt = "2026-05-02T04:30:00.000Z";

const clientAddress = addressFromLabel("TaskLoop demo client");
const freelancerAddress = addressFromLabel("TaskLoop demo freelancer");

const seed = {
  generatedAt,
  escrow: {
    id: "demo-seeded-escrow",
    title: "Seeded AI launch page escrow",
    summary: "A polished three-milestone demo deal with evidence, agent review, and payout-ready state.",
    description:
      "Build a launch page for an AI agent startup. The client funds three milestones, the freelancer submits proof, and TaskLoop uses an agent review before payout execution.",
    client: "Atlas Labs",
    clientWallet: clientAddress,
    freelancer: "Nova Studio",
    freelancerWallet: freelancerAddress,
    role: "client",
    status: "review",
    fundingStatus: "funded",
    dueDate: "May 06",
    createdAt: "May 02",
    agentScore: 94,
    agentRecommendation:
      "Approve milestone 2. Evidence includes a live preview, commit hash, screenshots, and a concise delivery summary.",
    chain: "Sepolia",
    milestones: [
      {
        id: "seed-m1",
        title: "Scope, copy, and wireframe",
        dueDate: "May 03",
        amountEth: "0.12",
        status: "paid",
        agentNote: "Brief, copy, and wireframe match the acceptance criteria.",
        evidence: [
          {
            id: "seed-ev1",
            label: "Wireframe and copy deck",
            submittedBy: "freelancer",
            submittedAt: "May 03, 10:15",
            uri: "ipfs://taskloop-demo/wireframe-copy"
          },
          {
            id: "seed-ev2",
            label: "Client approval note",
            submittedBy: "agent",
            submittedAt: "May 03, 10:24",
            uri: "0g://taskloop-demo/m1-review"
          }
        ]
      },
      {
        id: "seed-m2",
        title: "Responsive landing page implementation",
        dueDate: "May 05",
        amountEth: "0.28",
        status: "submitted",
        agentNote: "Evidence is complete and ready for agent-approved release.",
        evidence: [
          {
            id: "seed-ev3",
            label: "Live preview deployment",
            submittedBy: "freelancer",
            submittedAt: "May 05, 14:05",
            uri: "https://taskloop-demo.vercel.app"
          },
          {
            id: "seed-ev4",
            label: "Git commit hash",
            submittedBy: "freelancer",
            submittedAt: "May 05, 14:08",
            uri: "https://github.com/taskloop/demo/commit/4f9c2a7"
          },
          {
            id: "seed-ev5",
            label: "Screenshot diff bundle",
            submittedBy: "freelancer",
            submittedAt: "May 05, 14:11",
            uri: "ipfs://taskloop-demo/screenshot-diff"
          }
        ]
      },
      {
        id: "seed-m3",
        title: "Final QA and handoff",
        dueDate: "May 06",
        amountEth: "0.18",
        status: "active",
        agentNote: "Waiting for final QA checklist and handoff notes.",
        evidence: []
      }
    ],
    agentReview: {
      verdict: "approve",
      confidence: 0.94,
      summary:
        "Milestone 2 evidence is strong: the preview is live, the implementation commit is linked, and screenshots show the requested responsive states.",
      reasons: [
        "Live preview URL is present.",
        "Commit evidence is linked.",
        "Screenshot diff supports the delivery claim.",
        "Freelancer notes are specific enough for payout review."
      ],
      recommendedAction: "release",
      generatedAt,
      rootHash: "0x5eeded0a00000000000000000000000000000000000000000000000000000001",
      execution: {
        status: "skipped",
        reason: "Local demo seed includes review memory only. Trusted KeeperHub execution requires API-key auth.",
        rootHash: "0x5eeded0b00000000000000000000000000000000000000000000000000000002"
      }
    }
  }
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(seed, null, 2)}\n`, "utf8");

console.log(`Wrote demo seed to ${outputPath}`);
console.log(`Client:     ${clientAddress}`);
console.log(`Freelancer: ${freelancerAddress}`);

function addressFromLabel(label) {
  return `0x${createHash("sha256").update(label).digest("hex").slice(0, 40)}`;
}
