import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cn("mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8", className)}>{children}</main>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-[var(--brand-strong)]">{eyebrow}</p>
        ) : null}
        <h1 className="text-3xl font-black tracking-tight text-[var(--ink)] sm:text-5xl">{title}</h1>
        {description ? <p className="mt-4 text-base leading-7 text-[var(--muted)]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
