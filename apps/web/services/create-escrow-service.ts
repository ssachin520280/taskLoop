import type { CreateEscrowFormInput } from "@taskloop/shared";
import {
  mockCreateEscrowAdapter,
  toCreateEscrowContractDraft,
  type CreateEscrowAdapter,
  type CreateEscrowResult
} from "@/lib/contracts/create-escrow-adapter";

export type CreateEscrowServiceOptions = {
  adapter?: CreateEscrowAdapter;
};

export async function createEscrow(
  form: CreateEscrowFormInput,
  options: CreateEscrowServiceOptions = {}
): Promise<CreateEscrowResult> {
  const adapter = options.adapter ?? mockCreateEscrowAdapter;
  const draft = toCreateEscrowContractDraft(form);

  return adapter.createEscrow(draft);
}
