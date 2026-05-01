import { normalize } from "viem/ens";

export function normalizeEnsName(name?: string): string | undefined {
  const trimmedName = name?.trim();

  if (!trimmedName) {
    return undefined;
  }

  try {
    return normalize(trimmedName);
  } catch {
    return undefined;
  }
}

export function isPotentialEnsName(value?: string): boolean {
  return Boolean(value?.trim().includes("."));
}
