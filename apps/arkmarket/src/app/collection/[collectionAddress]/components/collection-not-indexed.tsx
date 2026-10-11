import { Contract } from "starknet";

import { shortAddress } from "@ark-market/ui";

import { getL2Rpc } from "~/lib/rpc";
import RequestIndexingButton from "./request-indexing-button";

// Minimal ABI: just the ERC-721 / SNIP-5 style `name` getter every NFT
// collection contract exposes. Enough to verify on-chain existence and show
// the real collection name before the indexer has indexed it.
const NAME_ABI = [
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ type: "core::felt252" }],
    stateMutability: "view",
  },
] as const;

interface CollectionNotIndexedProps {
  collectionAddress: string;
  chainId: string;
}

async function readOnChainName(collectionAddress: string) {
  try {
    const provider = getL2Rpc();
    const contract = new Contract(
      NAME_ABI as never,
      collectionAddress,
      provider,
    );
    const nameReader = contract.name as () => Promise<unknown>;
    const raw = await nameReader();

    if (typeof raw === "string" && raw.length > 0) {
      // felt252-encoded ASCII (short string) — strip trailing nulls.
      return raw.replace(/\0+$/, "");
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Shown when a collection address resolves on Starknet but the indexer has
 * not indexed it yet. Verifies the contract on-chain (reads its `name`) and
 * offers a one-click indexing request, so brand-new collections are
 * discoverable without waiting for a hardcoded config update.
 */
export default async function CollectionNotIndexed({
  collectionAddress,
  chainId,
}: CollectionNotIndexedProps) {
  const onChainName = await readOnChainName(collectionAddress);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-var(--site-header-height))] max-w-xl flex-col items-start justify-center gap-4 p-8">
      <h1 className="font-display text-3xl font-semibold">
        {onChainName ?? "Collection not indexed yet"}
      </h1>
      <p className="text-muted-foreground">
        Contract{" "}
        <code className="rounded bg-secondary px-1 py-0.5 text-foreground">
          {shortAddress(collectionAddress)}
        </code>{" "}
        {onChainName
          ? "exists on Starknet but is not in the marketplace index yet."
          : "could not be verified on Starknet — check the address and chain."}
      </p>
      <p className="text-sm text-muted-foreground">
        Chain: <code className="rounded bg-secondary px-1">{chainId}</code>
      </p>
      <RequestIndexingButton contractAddress={collectionAddress} />
    </div>
  );
}
