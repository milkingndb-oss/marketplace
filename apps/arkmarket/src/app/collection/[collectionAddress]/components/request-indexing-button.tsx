"use client";

import { useState } from "react";
import { Button } from "@ark-market/ui/button";
import { cn, focusableStyles } from "@ark-market/ui";

import { env } from "~/env";

interface RequestIndexingButtonProps {
  contractAddress: string;
  className?: string;
}

/**
 * Ask the indexer to index a contract it has not seen yet. The metadata
 * refresh endpoint accepts a contract address; once the indexer picks the
 * collection up, the collection page resolves normally.
 */
export default function RequestIndexingButton({
  contractAddress,
  className,
}: RequestIndexingButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );

  async function requestIndexing() {
    setStatus("loading");

    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_MARKETPLACE_API_URL}/metadata/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ contract_address: contractAddress }),
        },
      );

      if (!response.ok) {
        throw new Error(`Indexer responded ${response.status}`);
      }

      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        disabled={status === "loading" || status === "done"}
        onClick={requestIndexing}
        className={cn(className, focusableStyles)}
      >
        {status === "loading"
          ? "Requesting…"
          : status === "done"
            ? "Indexing requested"
            : "Request indexing"}
      </Button>
      {status === "done" && (
        <p className="text-sm text-muted-foreground">
          The indexer will pick this collection up shortly. Reload this page in
          a few minutes.
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-destructive">
          Could not reach the indexer. Try again later.
        </p>
      )}
    </div>
  );
}
