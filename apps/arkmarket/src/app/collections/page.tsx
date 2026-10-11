import type { Metadata } from "next";
import Link from "next/link";

import { shortAddress } from "@ark-market/ui";

import { discoverCollections } from "~/lib/discoverCollections";
import { env } from "~/env";

export const metadata: Metadata = {
  title: "Explore collections",
};

interface CollectionsPageProps {
  searchParams?: {
    q?: string;
  };
}

export default async function CollectionsPage({ searchParams }: CollectionsPageProps) {
  const query = searchParams?.q;
  const collections = await discoverCollections({ query });
  const platform =
    env.NEXT_PUBLIC_THEME === "unframed" ? "Unframed" : "Ark Market";

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 p-6">
      <div className="mb-8 flex flex-col gap-4">
        <h1 className="font-display text-3xl font-semibold">
          Explore collections
        </h1>
        <p className="text-muted-foreground">
          Every collection indexed on {platform} — search by name or address.
        </p>
        <form className="flex w-full max-w-md gap-2" action="/collections">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search collections…"
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <button
            type="submit"
            className="h-10 shrink-0 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Search
          </button>
        </form>
      </div>

      {collections.length === 0 ? (
        <p className="text-muted-foreground">
          {query
            ? `No collections matched “${query}”.`
            : "No collections indexed yet."}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collections.map((collection) => (
            <li key={collection.address}>
              <Link
                href={`/collection/${collection.address}`}
                className="group flex flex-col gap-3 rounded-lg border border-border p-4 transition-colors hover:border-primary"
              >
                {collection.image ? (
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="aspect-square w-full rounded-md object-cover"
                  />
                ) : (
                  <div className="aspect-square w-full rounded-md bg-secondary" />
                )}
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-display text-lg font-semibold group-hover:text-primary">
                    {collection.name}
                  </p>
                  {collection.isVerified && (
                    <span
                      className="shrink-0 text-xs text-primary"
                      title="Verified collection"
                    >
                      ✓
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {shortAddress(collection.address)}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Floor</span>
                  <span>
                    {collection.floorPrice
                      ? `${collection.floorPrice} ETH`
                      : "—"}
                  </span>
                </div>
                {collection.tokenCount !== null && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Items</span>
                    <span>{collection.tokenCount}</span>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
