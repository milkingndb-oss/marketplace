import type { Collection } from "~/types";
import { DEFAULT_CHAIN_ID } from "~/config/chains";
import { env } from "~/env";

interface GetCollectionParams {
  collectionAddress: string;
  chainId?: string;
}

export interface CollectionApiResponse {
  data: Collection;
}

export default async function getCollection({
  collectionAddress,
  chainId = DEFAULT_CHAIN_ID,
}: GetCollectionParams) {
  const response = await fetch(
    `${env.NEXT_PUBLIC_MARKETPLACE_API_URL}/collections/${collectionAddress}/${chainId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    console.error("Failed to fetch collection data");
    return null;
  }

  const { data } = (await response.json()) as CollectionApiResponse;

  return data;
}
