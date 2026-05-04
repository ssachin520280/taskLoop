"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  createEscrowFormSchema,
  formatAddress,
  formatTokenAmount,
  type CreateEscrowFormInput
} from "@taskloop/shared";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { parseEther } from "viem";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useCreateEscrow } from "@/hooks/use-create-escrow";
import { useEnsAddress } from "@/hooks/use-ens-address";
import { useEnsName } from "@/hooks/use-ens-name";
import { isPotentialEnsName } from "@/lib/ens";

type FormStep = "edit" | "review" | "success";

const defaultValues: CreateEscrowFormInput = {
  freelancer: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
  ensName: "",
  title: "Agent analytics dashboard",
  description: "Deliver a working demo, include evidence links, and pass TaskLoop agent evaluation before payout.",
  milestones: [
    { title: "Scope confirmation", amountEth: "0.10" },
    { title: "Working demo delivery", amountEth: "0.35" }
  ]
};

function getTotalAmount(milestones: CreateEscrowFormInput["milestones"]): bigint {
  return milestones.reduce((total, milestone) => {
    try {
      return total + parseEther(milestone.amountEth || "0");
    } catch {
      return total;
    }
  }, 0n);
}

export function CreateEscrowForm(): ReactNode {
  const form = useForm<CreateEscrowFormInput>({
    resolver: zodResolver(createEscrowFormSchema),
    defaultValues,
    mode: "onBlur"
  });
  const [step, setStep] = useState<FormStep>("edit");
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "milestones"
  });
  const { submitCreateEscrow, isSubmitting, result, error, resetCreateEscrow } = useCreateEscrow();

  const values = form.watch();
  const ensNameInput = form.watch("ensName");
  const freelancerInput = form.watch("freelancer");
  const ensAddress = useEnsAddress(ensNameInput);
  const freelancerEnsName = useEnsName(freelancerInput);
  const totalAmountWei = getTotalAmount(values.milestones);
  const errors = form.formState.errors;

  useEffect(() => {
    if (ensAddress.address && form.getValues("freelancer").toLowerCase() !== ensAddress.address.toLowerCase()) {
      form.setValue("freelancer", ensAddress.address, { shouldDirty: true, shouldValidate: true });
    }
  }, [ensAddress.address, form]);

  useEffect(() => {
    if (!ensNameInput && freelancerEnsName.ensName) {
      form.setValue("ensName", freelancerEnsName.ensName, { shouldDirty: false, shouldValidate: true });
    }
  }, [ensNameInput, form, freelancerEnsName.ensName]);

  async function handleReview(): Promise<void> {
    const isValid = await form.trigger();
    if (isValid) {
      setStep("review");
    }
  }

  async function handleSubmit(valuesToSubmit: CreateEscrowFormInput): Promise<void> {
    await submitCreateEscrow(valuesToSubmit);
    setStep("success");
  }

  if (step === "success" && result) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand)] text-2xl font-black text-[var(--ink)]">
            OK
          </div>
          <h2 className="mt-6 text-3xl font-black text-[var(--ink)]">Escrow created</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
            Escrow submission completed from the factory contract transaction receipt.
          </p>
          <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[#fff7df] p-4 text-sm">
            <p className="font-bold text-[var(--ink)]">{formatAddress(result.escrowAddress)}</p>
            <p className="mt-1 text-[var(--muted)]">Mode: {result.mode}</p>
          </div>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={`/escrows/${result.escrowId}`} className={buttonClassName("yellow")}>
              Open escrow detail
            </Link>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                resetCreateEscrow();
                form.reset(defaultValues);
                setStep("edit");
              }}
            >
              Create another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-[var(--ink)]">
              {step === "review" ? "Review escrow" : "Escrow brief"}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {step === "review"
                ? "Confirm the contract-shaped payload before submission."
                : "Capture enough detail to fund milestones and route future contract writes."}
            </p>
          </div>
          <div className="rounded-full bg-[#fff7df] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[var(--brand-strong)]">
            {step === "review" ? "Step 2 of 2" : "Step 1 of 2"}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5" onSubmit={form.handleSubmit(handleSubmit)}>
          {step === "edit" ? (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Freelancer wallet" error={errors.freelancer?.message}>
                  <input
                    className="field-input"
                    placeholder="0x..."
                    {...form.register("freelancer")}
                  />
                </Field>
                <Field label="Optional ENS name" error={errors.ensName?.message}>
                  <input className="field-input" placeholder="builder.eth" {...form.register("ensName")} />
                  <EnsResolutionHint
                    name={ensNameInput}
                    address={ensAddress.address}
                    isLoading={ensAddress.isLoading}
                    isError={ensAddress.isError}
                    hasNormalizedName={Boolean(ensAddress.normalizedName)}
                  />
                </Field>
              </div>

              <Field label="Project title" error={errors.title?.message}>
                <input className="field-input" {...form.register("title")} />
              </Field>

              <Field label="Project description" error={errors.description?.message}>
                <textarea className="field-input min-h-32" {...form.register("description")} />
              </Field>

              <div className="rounded-2xl border border-[var(--border)] bg-[#fff7df] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-[var(--ink)]">Milestones</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">Add 1 to 3 milestones. Each amount must be greater than zero.</p>
                  </div>
                  <p className="text-sm font-black text-[var(--ink)]">{formatTokenAmount(totalAmountWei)}</p>
                </div>
                <div className="mt-4 grid gap-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="rounded-2xl bg-white/80 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-[var(--ink)]">Milestone {index + 1}</p>
                        <Button type="button" variant="ghost" disabled={fields.length === 1} onClick={() => remove(index)}>
                          Remove
                        </Button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-[1fr_10rem]">
                        <Field label="Label" error={errors.milestones?.[index]?.title?.message}>
                          <input className="field-input" {...form.register(`milestones.${index}.title`)} />
                        </Field>
                        <Field label="Amount" error={errors.milestones?.[index]?.amountEth?.message}>
                          <input className="field-input" inputMode="decimal" {...form.register(`milestones.${index}.amountEth`)} />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-4"
                  disabled={fields.length >= 3}
                  onClick={() => append({ title: `Milestone ${fields.length + 1}`, amountEth: "0.10" })}
                >
                  Add milestone
                </Button>
                {errors.milestones?.root?.message ? (
                  <p className="mt-2 text-sm font-semibold text-red-700">{errors.milestones.root.message}</p>
                ) : null}
              </div>
            </>
          ) : (
            <div className="grid gap-4">
              <ReviewRow
                label="Freelancer"
                value={
                  values.ensName
                    ? `${values.ensName} (${formatAddress(values.freelancer)})`
                    : freelancerEnsName.displayName
                }
              />
              <ReviewRow label="Project" value={values.title} />
              <ReviewRow label="Description" value={values.description} />
              <div className="rounded-2xl border border-[var(--border)] bg-[#fff7df] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black text-[var(--ink)]">Milestone total</p>
                  <p className="font-black text-[var(--ink)]">{formatTokenAmount(totalAmountWei)}</p>
                </div>
                <div className="mt-4 grid gap-2">
                  {values.milestones.map((milestone, index) => (
                    <div key={`${milestone.title}-${index}`} className="flex items-center justify-between gap-3 rounded-xl bg-white/80 p-3 text-sm">
                      <span>
                        {index + 1}. {milestone.title}
                      </span>
                      <strong>{formatTokenAmount(parseEther(milestone.amountEth || "0"))}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-stone-300 bg-white/60 p-4 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
            <span>
              {step === "review"
                ? "Submit with wagmi through the configured factory contract."
                : "Validation runs before the review step so judges see a safe funding preview."}
            </span>
            <div className="flex gap-2">
              {step === "review" ? (
                <Button type="button" variant="secondary" disabled={isSubmitting} onClick={() => setStep("edit")}>
                  Back
                </Button>
              ) : null}
              {step === "review" ? (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Submit escrow"}
                </Button>
              ) : (
                <Button type="button" onClick={handleReview}>
                  Review escrow
                </Button>
              )}
            </div>
          </div>
          {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}

function EnsResolutionHint({
  name,
  address,
  isLoading,
  isError,
  hasNormalizedName
}: {
  name?: string;
  address?: `0x${string}`;
  isLoading: boolean;
  isError: boolean;
  hasNormalizedName: boolean;
}): ReactNode {
  if (!isPotentialEnsName(name)) {
    return null;
  }

  if (!hasNormalizedName) {
    return <span className="text-xs font-semibold text-red-700">ENS name could not be normalized.</span>;
  }

  if (isLoading) {
    return <span className="text-xs text-[var(--muted)]">Resolving ENS on mainnet...</span>;
  }

  if (address) {
    return <span className="text-xs text-emerald-700">Resolved to {formatAddress(address)}</span>;
  }

  if (isError) {
    return <span className="text-xs text-[var(--muted)]">ENS lookup unavailable. You can still paste a wallet.</span>;
  }

  return <span className="text-xs text-[var(--muted)]">No address found for this ENS name.</span>;
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: ReactNode;
}): ReactNode {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[var(--ink)]">
      {label}
      {children}
      {error ? <span className="text-xs font-semibold text-red-700">{error}</span> : null}
    </label>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string }): ReactNode {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{value || "Not provided"}</p>
    </div>
  );
}
