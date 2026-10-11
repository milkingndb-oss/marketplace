/**
 * Chain configuration for indexer-backed fetches.
 *
 * The marketplace indexer (ArkMarket API) is multi-chain: every collection and
 * token route is scoped by a chain id. Historically each lib function hardcoded
 * Starknet Mainnet (`SN_MAIN`), which made collections deployed on other
 * chains (e.g. Starknet Sepolia, L3 deployments) undiscoverable and unrenderable.
 *
 * This module is the single source of truth for chain ids used by `src/lib/*`.
 */

export const SN_MAIN = "0x534e5f4d41494e";
export const SN_SEPOLIA = "0x534e5f5345504f4c4941";

/** Chain used when a caller does not specify one. */
export const DEFAULT_CHAIN_ID = SN_MAIN;

export const SUPPORTED_CHAIN_IDS = [SN_MAIN, SN_SEPOLIA] as const;

export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];

export function isSupportedChainId(value: string): value is SupportedChainId {
  return (SUPPORTED_CHAIN_IDS as readonly string[]).includes(
    value.toLowerCase(),
  );
}

/**
 * Normalize a user- or config-supplied chain id to the lowercase 0x-prefixed
 * form the indexer expects. Unknown or missing values fall back to mainnet so
 * existing URLs keep resolving.
 */
export function normalizeChainId(value?: string | null): string {
  if (!value) {
    return DEFAULT_CHAIN_ID;
  }

  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return DEFAULT_CHAIN_ID;
  }

  const withPrefix = normalized.startsWith("0x")
    ? normalized
    : `0x${normalized}`;

  if (isSupportedChainId(withPrefix)) {
    return withPrefix;
  }

  return DEFAULT_CHAIN_ID;
}

/**
 * True when the value looks like a Starknet contract address (0x + up to 64
 * hex chars). Used to distinguish raw addresses from legacy collection slugs
 * in routes like `/[collectionAddress]/[tokenId]`.
 */
export function isStarknetAddress(value?: string | null): boolean {
  if (!value) {
    return false;
  }

  return /^0x[0-9a-f]{1,64}$/i.test(value.trim());
}
