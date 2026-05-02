"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { UserRole } from "@/lib/escrow";

export function EvidenceSubmission({ role }: { role: UserRole }) {
  const [value, setValue] = useState("");
  const isFreelancer = role === "freelancer";

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-black text-[var(--ink)]">Evidence submission</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {isFreelancer
            ? "Attach proof for the client and TaskLoop agent to review."
            : "Clients can review submitted proof before approving payout."}
        </p>
      </CardHeader>
      <CardContent>
        <textarea
          className="min-h-28 w-full rounded-2xl border border-[var(--border)] bg-white p-4 text-sm outline-none transition placeholder:text-stone-400 focus:border-[var(--brand-strong)] focus:ring-4 focus:ring-yellow-200/60"
          placeholder="Paste a demo URL, commit hash, screenshot link, or short completion note..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={!isFreelancer}
        />
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-[var(--muted)]">
            {isFreelancer ? "Submit evidence to the escrow contract." : "Switch to freelancer view to submit."}
          </p>
          <Button disabled={!isFreelancer || value.trim().length === 0}>Submit evidence</Button>
        </div>
      </CardContent>
    </Card>
  );
}
