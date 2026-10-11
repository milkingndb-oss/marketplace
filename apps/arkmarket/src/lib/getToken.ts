import type { Token } from "~/types";
import { DEFAULT_CHAIN_ID } from "~/config/chains";
import { env } from "~/env";

export interface TokenApiResponse {
  data: Token;
}

interface GetCollectionTokenProps {
  contractAddress: string;
  tokenId: string;
  chainId?: string;
}
export default async function getToken({
  contractAddress,
  tokenId,
  chainId = DEFAULT_CHAIN_ID,
}: GetCollectionTokenProps) {
  const url = `${env.NEXT_PUBLIC_MARKETPLACE_API_URL}/tokens/${contractAddress}/${chainId}/${tokenId}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch token");
  }

  const { data } = (await response.json()) as TokenApiResponse;

  return data;
}
