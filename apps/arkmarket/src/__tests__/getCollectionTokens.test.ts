import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("~/env", () => ({
  env: {
    NEXT_PUBLIC_MARKETPLACE_API_URL: "https://api.example.test",
    NEXT_PUBLIC_IMAGE_CDN_URL: "https://cdn.example.test",
    NEXT_PUBLIC_IMAGE_PROXY_URL: "https://imgproxy.example.test",
    NEXT_PUBLIC_IPFS_GATEWAY: "https://ipfs.example.test",
  },
}));

// nuqs/server imports React's `cache`, unavailable in the jsdom test env.
vi.mock("nuqs/server", () => ({
  createSearchParamsCache: () => ({ parse: () => ({}) }),
  parseAsStringLiteral: () => ({ withDefault: (d: unknown) => d }),
}));

import { getCollectionTokens } from "~/lib/getCollectionTokens";

describe("getCollectionTokens", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockClear();
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [], next_page: null, token_count: 0 }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("targets the requested chain, defaulting to SN_MAIN", async () => {
    await getCollectionTokens({ collectionAddress: "0xabc" });
    expect(fetchMock.mock.calls[0]?.[0]).toContain(
      "/collections/0xabc/0x534e5f4d41494e/tokens?",
    );

    await getCollectionTokens({
      collectionAddress: "0xabc",
      chainId: "0x534e5f5345504f4c4941",
    });
    expect(fetchMock.mock.calls[1]?.[0]).toContain(
      "/collections/0xabc/0x534e5f5345504f4c4941/tokens?",
    );
  });

  it("sends direction independently of sortBy (sortDirection guard fix)", async () => {
    await getCollectionTokens({
      collectionAddress: "0xabc",
      sortBy: "price",
      sortDirection: "desc",
    });
    const urlWithBoth = String(fetchMock.mock.calls[0]?.[0]);
    expect(urlWithBoth).toContain("sort=price");
    expect(urlWithBoth).toContain("direction=desc");

    fetchMock.mockClear();
    await getCollectionTokens({
      collectionAddress: "0xabc",
      sortDirection: "desc",
    });
    const urlDirectionOnly = String(fetchMock.mock.calls[0]?.[0]);
    expect(urlDirectionOnly).toContain("direction=desc");
    expect(urlDirectionOnly).not.toContain("sort=");
  });

  it("returns an empty result on non-ok responses", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404 });
    await expect(
      getCollectionTokens({ collectionAddress: "0xabc" }),
    ).resolves.toEqual({ data: [], next_page: null, token_count: 0 });
  });
});
