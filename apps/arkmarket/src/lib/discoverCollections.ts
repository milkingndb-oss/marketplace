import type { CollectionSearchResult, TrendingNow } from "~/types";
import getCollectionSearch from "./getCollectionSearch";
import getHomepageTrendingNow from "./getHomepageTrendingNow";

export interface DiscoveredCollection {
  address: string;
  name: string;
  image: string | null;
  floorPrice: string | null;
  floorDifference: number | null;
  isVerified: boolean;
  tokenCount: number | null;
  source: "trending" | "search";
}

function fromTrending(trending: TrendingNow): DiscoveredCollection {
  return {
    address: trending.collection_address,
    name: trending.collection_name,
    image: trending.collection_image || null,
    floorPrice: trending.floor_price,
    floorDifference: trending.floor_difference,
    isVerified: false,
    tokenCount: null,
    source: "trending",
  };
}

function fromSearch(result: CollectionSearchResult): DiscoveredCollection {
  return {
    address: result.address,
    name: result.name,
    image: result.image,
    floorPrice: null,
    floorDifference: null,
    isVerified: result.is_verified,
    tokenCount: result.token_count,
    source: "search",
  };
}

function dedupeByAddress(
  collections: DiscoveredCollection[],
): DiscoveredCollection[] {
  const seen = new Set<string>();
  const result: DiscoveredCollection[] = [];

  for (const collection of collections) {
    const key = collection.address.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(collection);
  }

  return result;
}

/**
 * Collection discovery backed entirely by the indexer — no hardcoded
 * whitelist. With a query it uses the search endpoint (which covers every
 * indexed collection Starknet-wide); without one it falls back to the
 * trending endpoint so the directory always has content.
 */
export async function discoverCollections({
  query,
}: {
  query?: string;
}): Promise<DiscoveredCollection[]> {
  const trimmedQuery = query?.trim();

  if (trimmedQuery) {
    try {
      const search = await getCollectionSearch({ searchQuery: trimmedQuery });
      return dedupeByAddress(search.data.collections.map(fromSearch));
    } catch {
      // Fall through to trending on search failure.
    }
  }

  try {
    const trending = await getHomepageTrendingNow();
    return dedupeByAddress(trending.data.map(fromTrending));
  } catch {
    return [];
  }
}
