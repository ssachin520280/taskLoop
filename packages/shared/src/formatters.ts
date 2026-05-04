import type { Address, Milestone } from "./types";

const DISPLAY_DECIMALS = 9;
const DISPLAY_SCALE = 10n ** BigInt(18 - DISPLAY_DECIMALS);
const DISPLAY_DIVISOR = 10n ** BigInt(DISPLAY_DECIMALS);
const INTEGER_GROUP_PATTERN = /\B(?=(\d{3})+(?!\d))/g;
const MIN_DISPLAY_AMOUNT = `0.${"0".repeat(DISPLAY_DECIMALS - 1)}1`;

function formatWholeAmount(amount: bigint): string {
  return amount.toString().replace(INTEGER_GROUP_PATTERN, ",");
}

export function formatAddress(address?: Address | string, visibleChars = 4): string {
  if (!address) {
    return "";
  }

  return `${address.slice(0, visibleChars + 2)}...${address.slice(-visibleChars)}`;
}

export function formatTokenAmount(amountWei: bigint, symbol = "0G"): string {
  const sign = amountWei < 0n ? "-" : "";
  const absoluteAmountWei = amountWei < 0n ? -amountWei : amountWei;
  const roundedAmount = (absoluteAmountWei + DISPLAY_SCALE / 2n) / DISPLAY_SCALE;

  if (absoluteAmountWei > 0n && roundedAmount === 0n) {
    return `${sign}<${MIN_DISPLAY_AMOUNT} ${symbol}`;
  }

  const whole = roundedAmount / DISPLAY_DIVISOR;
  const fraction = roundedAmount % DISPLAY_DIVISOR;
  const fractionLabel = fraction.toString().padStart(DISPLAY_DECIMALS, "0").replace(/0+$/, "");
  const wholeLabel = formatWholeAmount(whole);
  const amountLabel = fractionLabel ? `${sign}${wholeLabel}.${fractionLabel}` : `${sign}${wholeLabel}`;

  return `${amountLabel} ${symbol}`;
}

export function formatMilestoneLabel(milestone: Pick<Milestone, "id" | "title">): string {
  return `Milestone ${milestone.id + 1}: ${milestone.title}`;
}

export function formatMilestoneAmountLabel(milestone: Pick<Milestone, "id" | "title" | "amountWei">): string {
  return `${formatMilestoneLabel(milestone)} - ${formatTokenAmount(milestone.amountWei)}`;
}
