"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatEth } from "@/lib/mock-data";

const defaultMilestones = [
  { title: "Scope confirmation", amount: "0.10" },
  { title: "Working demo delivery", amount: "0.35" },
  { title: "Final handoff", amount: "0.15" }
];

const defaultTotal = defaultMilestones.reduce((sum, milestone) => sum + parseEther(milestone.amount), 0n);

export function CreateEscrowForm() {
  const [role, setRole] = useState("client");

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-black text-[var(--ink)]">Escrow brief</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Mock-first form for demoing the contract flow before writes are enabled.</p>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5">
          <label className="grid gap-2 text-sm font-semibold text-[var(--ink)]">
            Your role
            <select
              className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none focus:border-[var(--brand-strong)] focus:ring-4 focus:ring-yellow-200/60"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="client">Client funding work</option>
              <option value="freelancer">Freelancer proposing work</option>
            </select>
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-[var(--ink)]">
              Project title
              <input
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none focus:border-[var(--brand-strong)] focus:ring-4 focus:ring-yellow-200/60"
                defaultValue="Agent analytics dashboard"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[var(--ink)]">
              Freelancer wallet
              <input
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none focus:border-[var(--brand-strong)] focus:ring-4 focus:ring-yellow-200/60"
                defaultValue="0x8ba1f109551bD432803012645Ac136ddd64DBA72"
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-[var(--ink)]">
            Success criteria
            <textarea
              className="min-h-32 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none focus:border-[var(--brand-strong)] focus:ring-4 focus:ring-yellow-200/60"
              defaultValue="Deliver a working demo, include evidence links, and pass TaskLoop agent evaluation before payout."
            />
          </label>

          <div className="rounded-2xl border border-[var(--border)] bg-[#fff7df] p-4">
            <div className="flex items-center justify-between">
              <p className="font-black text-[var(--ink)]">Milestones</p>
              <p className="text-sm font-black text-[var(--ink)]">{formatEth(defaultTotal)}</p>
            </div>
            <div className="mt-4 grid gap-3">
              {defaultMilestones.map((milestone, index) => (
                <div key={milestone.title} className="flex items-center justify-between rounded-xl bg-white/80 p-3 text-sm">
                  <span>
                    {index + 1}. {milestone.title}
                  </span>
                  <strong>{milestone.amount} ETH</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-stone-300 bg-white/60 p-4 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
            <span>
              {role === "client"
                ? "Next contract step: fund escrow and emit TaskCreated."
                : "Next contract step: send proposal to client for funding."}
            </span>
            <Button type="button">Create mock escrow</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
