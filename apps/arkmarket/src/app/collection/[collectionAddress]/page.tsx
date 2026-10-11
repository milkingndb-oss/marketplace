import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isStarknetAddress, normalizeChainId } from "~/config/chains";
import { env } from "~/env";
import getCollection from "~/lib/getCollection";
import CollectionBanner from "./components/collection-banner";
import CollectionHeader from "./components/collection-header";
import CollectionItems from "./components/collection-items";
import MobileCollectionHeader from "./components/mobile-collection-header";
import CollectionNotIndexed from "./components/collection-not-indexed";

interface GenerateMetadataProps {
  params: Promise<{ collectionAddress: string }>;
  searchParams: Promise<{ chain?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: GenerateMetadataProps): Promise<Metadata> {
  const collectionAddress = (await params).collectionAddress;
  const { chain } = await searchParams;
  const chainId = normalizeChainId(chain);
  const collection = await getCollection({ collectionAddress, chainId });
  const platform =
    env.NEXT_PUBLIC_THEME === "unframed" ? "Unframed" : "Ark Market";
  const name = collection?.name ?? "Collection";

  return {
    title: `${name} | ${platform}`,
    openGraph: {
      images: [
        `https://ark-market-unframed.vercel.app/api/og/collection?collection_address=${collectionAddress}`,
      ],
    },
  };
}

interface CollectionPageProps {
  params: {
    collectionAddress: string;
  };
  searchParams?: {
    chain?: string;
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const { collectionAddress } = params;
  const chainId = normalizeChainId(searchParams?.chain);

  // Resolve any collection the indexer knows about — not just the ones in the
  // hardcoded CollectionDescription map. This is what makes collections
  // discovered Starknet-wide (via /collections or search) actually browsable.
  const collection = await getCollection({ collectionAddress, chainId });

  if (!collection) {
    // The indexer does not know this collection yet. If it looks like a real
    // contract address, surface the on-chain verification / indexing request
    // flow instead of a bare 404 so new deployments can be discovered.
    if (isStarknetAddress(collectionAddress)) {
      return (
        <CollectionNotIndexed
          collectionAddress={collectionAddress}
          chainId={chainId}
        />
      );
    }

    return notFound();
  }

  return (
    <div className="flex min-h-[calc(100vh-var(--site-header-height))] flex-col">
      <CollectionBanner
        className="hidden md:block"
        collectionAddress={collectionAddress}
      />
      <CollectionHeader
        collectionAddress={collectionAddress}
        collection={collection}
      />
      <MobileCollectionHeader
        collectionAddress={collectionAddress}
        collection={collection}
      />
      <CollectionItems
        collectionAddress={collectionAddress}
        collectionTokenCount={collection.token_count}
      />
    </div>
  );
}
