import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = dirname(fileURLToPath(import.meta.url));
const sharedDir = resolve(packageDir, "..");
const repoRoot = resolve(sharedDir, "../..");

const contracts = [
  {
    name: "EscrowFactory",
    artifact: "packages/contracts/out/EscrowFactory.sol/EscrowFactory.json",
    output: "src/abis/escrowFactory.ts",
    exportName: "escrowFactoryAbi"
  },
  {
    name: "MilestoneEscrow",
    artifact: "packages/contracts/out/MilestoneEscrow.sol/MilestoneEscrow.json",
    output: "src/abis/milestoneEscrow.ts",
    exportName: "milestoneEscrowAbi"
  }
];

for (const contract of contracts) {
  const artifactPath = resolve(repoRoot, contract.artifact);
  const outputPath = resolve(sharedDir, contract.output);
  const artifact = JSON.parse(await readFile(artifactPath, "utf8"));

  if (!Array.isArray(artifact.abi)) {
    throw new Error(`${contract.name} artifact is missing an ABI array`);
  }

  const source = `export const ${contract.exportName} = ${JSON.stringify(artifact.abi, null, 2)} as const;\n`;
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, source);

  console.log(`Synced ${contract.name} ABI -> ${contract.output}`);
}
