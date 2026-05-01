import { isAddress } from "viem";

export type ContractAddresses = {
  escrowFactory?: `0x${string}`;
};

function readAddress(value: string | undefined): `0x${string}` | undefined {
  const address = value?.trim();
  return address && isAddress(address) ? address : undefined;
}

export const contractAddresses: ContractAddresses = {
  escrowFactory: readAddress(process.env.NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS)
};

export function hasEscrowFactoryAddress(): boolean {
  return Boolean(contractAddresses.escrowFactory);
}
