import type { TokenMarketData } from "~/types";
import { DEFAULT_CHAIN_ID } from "~/config/chains";
import { env } from "~/env";

export interface TokenMarketDataApiResponse {
  data: TokenMarketData;
}

interface GetTokenMarketParams {
  contractAddress: string;
  tokenId: string;
  chainId?: string;
}

export default async function getTokenMarketData({
  contractAddress,
  tokenId,
  chainId = DEFAULT_CHAIN_ID,
}: GetTokenMarketParams) {
  const response = await fetch(
    `${env.NEXT_PUBLIC_MARKETPLACE_API_URL}/tokens/${contractAddress}/${chainId}/${tokenId}/marketdata`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch tokenMarketData");
  }

  const { data } = (await response.json()) as TokenMarketDataApiResponse;

  return data;
}
