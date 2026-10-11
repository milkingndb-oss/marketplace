import { describe, expect, it } from "vitest";

import {
  DEFAULT_CHAIN_ID,
  SN_MAIN,
  SN_SEPOLIA,
  isStarknetAddress,
  isSupportedChainId,
  normalizeChainId,
} from "~/config/chains";

describe("normalizeChainId", () => {
  it("defaults to SN_MAIN when missing", () => {
    expect(normalizeChainId(undefined)).toBe(SN_MAIN);
    expect(normalizeChainId(null)).toBe(SN_MAIN);
    expect(normalizeChainId("")).toBe(SN_MAIN);
  });

  it("lowercases and prefixes supported ids", () => {
    expect(normalizeChainId("0x534e5f4d41494e")).toBe(SN_MAIN);
    expect(normalizeChainId(SN_SEPOLIA.toUpperCase().replace("0X", "0x"))).toBe(
      SN_SEPOLIA,
    );
  });

  it("accepts unprefixed hex", () => {
    expect(normalizeChainId("534e5f4d41494e")).toBe(SN_MAIN);
  });

  it("falls back to mainnet for unknown chains", () => {
    expect(normalizeChainId("0xdeadbeef")).toBe(DEFAULT_CHAIN_ID);
  });
});

describe("isSupportedChainId", () => {
  it("accepts mainnet and sepolia", () => {
    expect(isSupportedChainId(SN_MAIN)).toBe(true);
    expect(isSupportedChainId(SN_SEPOLIA)).toBe(true);
  });

  it("rejects unknown ids", () => {
    expect(isSupportedChainId("0x1")).toBe(false);
  });
});

describe("isStarknetAddress", () => {
  it("accepts 0x hex addresses", () => {
    expect(isStarknetAddress(SN_MAIN)).toBe(true);
    expect(
      isStarknetAddress(
        "0x07ae27a31bb6526e3de9cf02f081f6ce0615ac12a6d7b85ee58b8ad7947a2809",
      ),
    ).toBe(true);
  });

  it("rejects slugs and empty values", () => {
    expect(isStarknetAddress("realms")).toBe(false);
    expect(isStarknetAddress("")).toBe(false);
    expect(isStarknetAddress(undefined)).toBe(false);
    expect(isStarknetAddress("0xZZZZ")).toBe(false);
  });
});
