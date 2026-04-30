import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-[var(--ink)] text-white shadow-sm hover:bg-black",
  secondary: "border border-[var(--border)] bg-white/70 text-[var(--ink)] hover:bg-white",
  yellow: "bg-[var(--brand)] text-[var(--ink)] shadow-sm hover:bg-[#ffd84d]",
  ghost: "text-[var(--muted)] hover:bg-black/5 hover:text-[var(--ink)]"
};

export function buttonClassName(variant: keyof typeof variants = "primary", className?: string) {
  return cn(
    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    className
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return <button className={buttonClassName(variant, className)} {...props} />;
}
