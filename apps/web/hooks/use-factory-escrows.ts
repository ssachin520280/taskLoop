"use client";

import { escrowFactoryAbi, milestoneEscrowAbi } from "@taskloop/shared";
import { useMemo } from "react";
import type { Address } from "viem";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import type { Escrow, EscrowStatus, FundingStatus, Milestone, MilestoneStatus, UserRole } from "@/lib/escrow";
import { contractAddresses } from "@/lib/contracts/config";

type ChainMilestone = readonly [string, bigint, string, number, bigint, bigint, bigint];

type FactoryEscrowRecord = {
  escrow: Address;
  client: Address;
  freelancer: Address;
  totalAmount: bigint;
  milestoneCount: bigint;
  createdAt: bigint;
};

type ContractReadResult = {
  status: string;
  result?: unknown;
};

export type FactoryEscrowDashboardState = {
  allEscrows: Escrow[];
  clientEscrows: Escrow[];
  freelancerEscrows: Escrow[];
  totalEscrows: bigint;
  accountEscrowCount: number;
  isConfigured: boolean;
  isConnected: boolean;
  isLoading: boolean;
  error?: string;
  refetch: () => void;
};

const MAX_DASHBOARD_ESCROWS = 50;
const ESCROW_DETAIL_FIELD_COUNT = 3;
const escrowDetailFields = {
  releasedAmount: 0,
  status: 1,
  milestones: 2
} as const;
const escrowStatusLabels: EscrowStatus[] = ["pending", "funded", "released", "released"];
const milestoneStatusLabels: MilestoneStatus[] = ["pending", "submitted", "approved", "paid", "disputed"];

export function useFactoryEscrows(): FactoryEscrowDashboardState {
  const factoryAddress = contractAddresses.escrowFactory;
  const { address: accountAddress, isConnected } = useAccount();

  const countRead = useReadContract({
    address: factoryAddress,
    abi: escrowFactoryAbi,
    functionName: "escrowCount",
    query: {
      enabled: Boolean(factoryAddress)
    }
  });

  const accountEscrowsRead = useReadContract({
    address: factoryAddress,
    abi: escrowFactoryAbi,
    functionName: "getEscrowsByAccount",
    args: accountAddress ? [accountAddress] : undefined,
    query: {
      enabled: Boolean(factoryAddress && accountAddress)
    }
  });

  const recordIndexes = useMemo(() => {
    const count = countRead.data ?? 0n;
    const visibleCount = Math.min(Number(count), MAX_DASHBOARD_ESCROWS);

    return Array.from({ length: visibleCount }, (_, index) => BigInt(index));
  }, [countRead.data]);

  const recordContracts = useMemo(
    () =>
      factoryAddress
        ? recordIndexes.map(
            (escrowId) =>
              ({
                address: factoryAddress,
                abi: escrowFactoryAbi,
                functionName: "getEscrow",
                args: [escrowId]
              }) as const
          )
        : [],
    [factoryAddress, recordIndexes]
  );

  const recordsRead = useReadContracts({
    contracts: recordContracts as NonNullable<Parameters<typeof useReadContracts>[0]>["contracts"],
    query: {
      enabled: Boolean(factoryAddress && recordContracts.length > 0)
    }
  });

  const records = useMemo(
    () =>
      (recordsRead.data ?? [])
        .filter((item) => item.status === "success")
        .map((item) => normalizeFactoryRecord(item.result))
        .filter((record): record is FactoryEscrowRecord => Boolean(record)),
    [recordsRead.data]
  );

  const detailContracts = useMemo(
    () =>
      records.flatMap((record) => [
        {
          address: record.escrow,
          abi: milestoneEscrowAbi,
          functionName: "releasedAmount"
        } as const,
        {
          address: record.escrow,
          abi: milestoneEscrowAbi,
          functionName: "status"
        } as const,
        {
          address: record.escrow,
          abi: milestoneEscrowAbi,
          functionName: "getMilestones"
        } as const
      ]),
    [records]
  );

  const detailsRead = useReadContracts({
    contracts: detailContracts as NonNullable<Parameters<typeof useReadContracts>[0]>["contracts"],
    query: {
      enabled: detailContracts.length > 0
    }
  });

  const allEscrows = useMemo(
    () =>
      records.map((record, index) => {
        const releasedAmount = readDetail<bigint>(detailsRead.data, index, escrowDetailFields.releasedAmount) ?? 0n;
        const status = readDetail<number>(detailsRead.data, index, escrowDetailFields.status) ?? 0;
        const milestones = readDetail<ChainMilestone[]>(detailsRead.data, index, escrowDetailFields.milestones)?.map(
          mapChainMilestone
        );

        return mapFactoryRecordToEscrow({
          record,
          index,
          accountAddress,
          status,
          releasedAmount,
          milestones
        });
      }),
    [accountAddress, detailsRead.data, records]
  );

  const clientEscrows = useMemo(
    () => (accountAddress ? allEscrows.filter((escrow) => sameAddress(escrow.clientWallet, accountAddress)) : []),
    [accountAddress, allEscrows]
  );
  const freelancerEscrows = useMemo(
    () => (accountAddress ? allEscrows.filter((escrow) => sameAddress(escrow.freelancerWallet, accountAddress)) : []),
    [accountAddress, allEscrows]
  );

  return {
    allEscrows,
    clientEscrows,
    freelancerEscrows,
    totalEscrows: countRead.data ?? 0n,
    accountEscrowCount: accountEscrowsRead.data?.length ?? 0,
    isConfigured: Boolean(factoryAddress),
    isConnected,
    isLoading: countRead.isLoading || recordsRead.isLoading || detailsRead.isLoading || accountEscrowsRead.isLoading,
    error:
      countRead.error?.message ??
      recordsRead.error?.message ??
      detailsRead.error?.message ??
      accountEscrowsRead.error?.message,
    refetch: () => {
      void countRead.refetch();
      void recordsRead.refetch();
      void detailsRead.refetch();
      void accountEscrowsRead.refetch();
    }
  };
}

function mapFactoryRecordToEscrow({
  record,
  index,
  accountAddress,
  status,
  releasedAmount,
  milestones
}: {
  record: FactoryEscrowRecord;
  index: number;
  accountAddress?: Address;
  status: number;
  releasedAmount: bigint;
  milestones?: Milestone[];
}): Escrow {
  const visibleMilestones = getVisibleMilestones(record, milestones);
  const milestoneLabel = formatMilestoneCount(record.milestoneCount);

  return {
    id: record.escrow,
    title: `Escrow #${index + 1}`,
    summary: `Factory escrow for ${shortAddress(record.freelancer)} with ${milestoneLabel}.`,
    description: "This escrow was created by the TaskLoop factory and is read directly from chain.",
    client: sameAddress(record.client, accountAddress) ? "You" : "Client wallet",
    clientWallet: record.client,
    freelancer: sameAddress(record.freelancer, accountAddress) ? "You" : "Freelancer wallet",
    freelancerWallet: record.freelancer,
    role: sameAddress(record.freelancer, accountAddress) ? "freelancer" : ("client" satisfies UserRole),
    status: escrowStatusLabels[status] ?? "pending",
    fundingStatus: mapFundingStatus(status, record.totalAmount, releasedAmount),
    dueDate: "Onchain",
    createdAt: formatChainDate(record.createdAt),
    agentScore: 0,
    agentRecommendation: "Agent review will run after evidence submission.",
    chain: "Sepolia",
    milestones: visibleMilestones,
    evidence: visibleMilestones.flatMap((milestone) => milestone.evidence)
  };
}

function getVisibleMilestones(record: FactoryEscrowRecord, milestones?: Milestone[]): Milestone[] {
  if (milestones && milestones.length > 0) {
    return milestones;
  }

  return [
    {
      id: "0",
      title: formatOnchainMilestoneCount(record.milestoneCount),
      dueDate: "Onchain",
      amountWei: record.totalAmount,
      status: "pending",
      evidenceCount: 0,
      evidence: [],
      agentNote: "Milestone details are loading from the escrow contract."
    }
  ];
}

function formatMilestoneCount(count: bigint): string {
  return `${count.toString()} milestone${count === 1n ? "" : "s"}`;
}

function formatOnchainMilestoneCount(count: bigint): string {
  return `${count.toString()} onchain milestone${count === 1n ? "" : "s"}`;
}

function mapChainMilestone(milestone: ChainMilestone, index: number): Milestone {
  const [title, amountWei, evidence, status, submittedAt] = milestone;
  const hasEvidence = evidence.length > 0;

  return {
    id: String(index),
    title,
    dueDate: "Onchain",
    amountWei,
    status: milestoneStatusLabels[status] ?? "pending",
    evidenceCount: hasEvidence ? 1 : 0,
    evidence: hasEvidence
      ? [
          {
            id: `${index}-chain-evidence`,
            label: evidence,
            submittedBy: "freelancer",
            submittedAt: formatChainDate(submittedAt),
            uri: evidence
          }
        ]
      : [],
    agentNote: hasEvidence ? "Evidence is available for agent review." : "Waiting for freelancer evidence."
  };
}

function normalizeFactoryRecord(record: unknown): FactoryEscrowRecord | undefined {
  const tuple = record as readonly unknown[] & Partial<FactoryEscrowRecord>;
  const escrow = tuple.escrow ?? tuple[0];
  const client = tuple.client ?? tuple[1];
  const freelancer = tuple.freelancer ?? tuple[2];
  const totalAmount = tuple.totalAmount ?? tuple[3];
  const milestoneCount = tuple.milestoneCount ?? tuple[4];
  const createdAt = tuple.createdAt ?? tuple[5];

  if (
    typeof escrow !== "string" ||
    typeof client !== "string" ||
    typeof freelancer !== "string" ||
    typeof totalAmount !== "bigint" ||
    typeof milestoneCount !== "bigint" ||
    typeof createdAt !== "bigint"
  ) {
    return undefined;
  }

  return {
    escrow: escrow as Address,
    client: client as Address,
    freelancer: freelancer as Address,
    totalAmount,
    milestoneCount,
    createdAt
  };
}

function readDetail<T>(data: readonly ContractReadResult[] | undefined, recordIndex: number, fieldIndex: number): T | undefined {
  const item = data?.[recordIndex * ESCROW_DETAIL_FIELD_COUNT + fieldIndex];

  return item?.status === "success" ? (item.result as T) : undefined;
}

function mapFundingStatus(status: number, totalAmount: bigint, releasedAmount: bigint): FundingStatus {
  if (status === 0) {
    return "unfunded";
  }

  if (releasedAmount === totalAmount) {
    return "completed";
  }

  if (releasedAmount > 0n) {
    return "partially_released";
  }

  return "funded";
}

function sameAddress(left: Address | undefined, right: Address | undefined): boolean {
  return Boolean(left && right && left.toLowerCase() === right.toLowerCase());
}

function shortAddress(address: Address): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatChainDate(timestamp: bigint): string {
  if (timestamp === 0n) {
    return "Onchain";
  }

  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit" }).format(new Date(Number(timestamp) * 1000));
}
