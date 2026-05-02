"use client";

import type { UserRole } from "@/lib/escrow";
import { cn } from "@/lib/utils";

const options: Array<{ value: UserRole; label: string }> = [
  { value: "client", label: "Client view" },
  { value: "freelancer", label: "Freelancer view" }
];

export function RoleToggle({ role, onRoleChange }: { role: UserRole; onRoleChange: (role: UserRole) => void }) {
  return (
    <div className="inline-flex rounded-full border border-[var(--border)] bg-white/70 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold transition",
            role === option.value ? "bg-[var(--ink)] text-white" : "text-[var(--muted)] hover:text-[var(--ink)]"
          )}
          onClick={() => onRoleChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
