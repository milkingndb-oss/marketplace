import { notFound } from "next/navigation";
import { ChainId, CollectionAddresses, CollectionNames } from "~/config/homepage";
import { isStarknetAddress } from "~/config/chains";
import TokenPage from "~/app/token/[contractAddress]/[tokenId]/page";
import type { Metadata } from "next";
import { env } from "~/env";

interface LegacyTokenPageParams {
  collectionAddress: string;
  tokenId: string;
}

interface GenerateMetadataProps {
  params: Promise<LegacyTokenPageParams>;
}

/**
 * Resolve a legacy `/[slug]/[tokenId]` or `/[address]/[tokenId]` path to a
 * contract address. Raw Starknet addresses are passed through (so any
 * indexed collection works, not only the hardcoded slugs); known slugs are
 * mapped through the static config.
 */
function resolveCollectionAddress(param: string): string | null {
  if (isStarknetAddress(param)) {
    return param;
  }

  const bySlug = CollectionAddresses as Record<
    string,
    Partial<Record<ChainId, string>> | undefined
  >;
  const collection =
    bySlug[param] ?? bySlug[param.toLowerCase()];

  return collection?.[ChainId.SN_MAIN] ?? null;
}

export async function generateMetadata({
  params,
}: GenerateMetadataProps): Promise<Metadata> {
  const { collectionAddress: collectionParam } = await params;
  const collectionAddress = resolveCollectionAddress(collectionParam);
  const platform =
    env.NEXT_PUBLIC_THEME === "unframed" ? "Unframed" : "Ark Market";
  const names = CollectionNames as Record<string, string | undefined>;
  const name = names[collectionParam] ?? "Collection";

  return {
    title: `${name} | ${platform}`,
    openGraph: {
      images: [
        `https://ark-market-unframed.vercel.app/api/og/collection?collection_address=${collectionAddress ?? collectionParam}`,
      ],
    },
  };
}

export default async function TokenPageRoute({
  params,
}: {
  params: LegacyTokenPageParams;
}) {
  const address = resolveCollectionAddress(params.collectionAddress);

  if (!address) {
    return notFound();
  }

  return TokenPage({
    params: { contractAddress: address, tokenId: params.tokenId },
  });
}
