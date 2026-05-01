import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Indexer, ZgFile } from "@0gfoundation/0g-ts-sdk";
import { JsonRpcProvider, Wallet } from "ethers";

export type ZeroGStorageConfig = {
  rpcUrl: string;
  indexerUrl: string;
  privateKey: string;
};

export type ZeroGUploadKind = "json" | "text";

export type ZeroGUploadResult = {
  name: string;
  kind: ZeroGUploadKind;
  rootHash: string;
  txHash: string;
  txSeq?: number;
  contentType: string;
  uploadedAt: string;
};

export type ZeroGFileMetadata = {
  rootHash: string;
  available: boolean;
  locationCount: number;
  locations: Array<{
    url?: string;
    name?: string;
    raw: unknown;
  }>;
  encrypted: boolean;
  checkedAt: string;
};

type SingleUploadResponse = {
  rootHash: string;
  txHash: string;
  txSeq?: number;
};

type UploadEnvelope<T> = {
  name: string;
  contentType: string;
  createdAt: string;
  data: T;
};

type ZeroGClients = {
  config: ZeroGStorageConfig;
  indexer: Indexer;
  signer: Wallet;
};

class ZeroGStorageError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ZeroGStorageError";
  }
}

export async function uploadJson<T>(name: string, data: T): Promise<ZeroGUploadResult> {
  const envelope: UploadEnvelope<T> = {
    name,
    contentType: "application/json",
    createdAt: new Date().toISOString(),
    data
  };

  return uploadBuffer(name, JSON.stringify(envelope, null, 2), "json", "application/json");
}

export async function uploadText(name: string, text: string): Promise<ZeroGUploadResult> {
  const envelope: UploadEnvelope<string> = {
    name,
    contentType: "text/plain",
    createdAt: new Date().toISOString(),
    data: text
  };

  return uploadBuffer(name, JSON.stringify(envelope, null, 2), "text", "text/plain");
}

export async function getFileMetadata(rootHash: string): Promise<ZeroGFileMetadata> {
  const { indexer } = createZeroGClients();

  try {
    const locations = await indexer.getFileLocations(rootHash);
    const [header, headerError] = await indexer.peekHeader(rootHash);

    if (headerError) {
      throw headerError;
    }

    return {
      rootHash,
      available: locations.length > 0,
      locationCount: locations.length,
      locations: locations.map((location) => ({
        url: readUnknownString(location, "url"),
        name: readUnknownString(location, "name"),
        raw: location
      })),
      encrypted: Boolean(header),
      checkedAt: new Date().toISOString()
    };
  } catch (error) {
    throw new ZeroGStorageError(`Unable to read 0G file metadata for ${rootHash}`, { cause: error });
  }
}

async function uploadBuffer(
  name: string,
  content: string,
  kind: ZeroGUploadKind,
  contentType: string
): Promise<ZeroGUploadResult> {
  const { config, indexer, signer } = createZeroGClients();
  const tempDir = await mkdtemp(join(tmpdir(), "taskloop-0g-"));
  const filePath = join(tempDir, `${safeFileName(name)}.${kind === "json" ? "json" : "txt"}`);
  let file: ZgFile | undefined;

  try {
    await writeFile(filePath, content, "utf8");
    file = await ZgFile.fromFilePath(filePath);

    const [tree, treeError] = await file.merkleTree();
    if (treeError) {
      throw treeError;
    }

    const rootHash = tree?.rootHash();
    if (!rootHash) {
      throw new Error("0G SDK did not return a Merkle root hash");
    }

    const [uploadResponse, uploadError] = await indexer.upload(file, config.rpcUrl, signer);
    if (uploadError) {
      throw uploadError;
    }

    const singleUpload = parseSingleUploadResponse(uploadResponse);

    return {
      name,
      kind,
      rootHash: singleUpload.rootHash || rootHash,
      txHash: singleUpload.txHash,
      txSeq: singleUpload.txSeq,
      contentType,
      uploadedAt: new Date().toISOString()
    };
  } catch (error) {
    throw new ZeroGStorageError(`Unable to upload ${name} to 0G Storage`, { cause: error });
  } finally {
    try {
      await file?.close();
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }
}

function createZeroGClients(): ZeroGClients {
  const config = readZeroGStorageConfig();
  const provider = new JsonRpcProvider(config.rpcUrl);
  const signer = new Wallet(config.privateKey, provider);
  const indexer = new Indexer(config.indexerUrl);

  return { config, indexer, signer };
}

function readZeroGStorageConfig(): ZeroGStorageConfig {
  const rpcUrl = process.env.ZG_STORAGE_RPC_URL?.trim();
  const indexerUrl = process.env.ZG_STORAGE_INDEXER_URL?.trim();
  const privateKey = process.env.ZG_STORAGE_PRIVATE_KEY?.trim();
  const missing = [
    ["ZG_STORAGE_RPC_URL", rpcUrl],
    ["ZG_STORAGE_INDEXER_URL", indexerUrl],
    ["ZG_STORAGE_PRIVATE_KEY", privateKey]
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new ZeroGStorageError(`Missing 0G Storage env vars: ${missing.join(", ")}`);
  }

  return {
    rpcUrl: rpcUrl!,
    indexerUrl: indexerUrl!,
    privateKey: privateKey!
  };
}

function parseSingleUploadResponse(response: unknown): SingleUploadResponse {
  if (isSingleUploadResponse(response)) {
    return response;
  }

  throw new ZeroGStorageError("Fragmented 0G uploads are not supported by TaskLoop yet");
}

function isSingleUploadResponse(value: unknown): value is SingleUploadResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "rootHash" in value &&
    "txHash" in value &&
    typeof value.rootHash === "string" &&
    typeof value.txHash === "string" &&
    (!("txSeq" in value) || typeof value.txSeq === "number")
  );
}

function safeFileName(name: string): string {
  const safeName = name.trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return safeName || "taskloop-artifact";
}

function readUnknownString(value: unknown, key: string): string | undefined {
  if (typeof value !== "object" || value === null || !(key in value)) {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  return typeof record[key] === "string" ? record[key] : undefined;
}
