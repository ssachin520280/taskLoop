import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const tones = {
  neutral: "border-stone-300 bg-stone-100 text-stone-700",
  yellow: "border-yellow-300 bg-yellow-100 text-yellow-900",
  green: "border-emerald-300 bg-emerald-50 text-emerald-800",
  blue: "border-sky-300 bg-sky-50 text-sky-800",
  red: "border-red-300 bg-red-50 text-red-800"
};

export type BadgeTone = keyof typeof tones;

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
