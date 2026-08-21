"use client";

import * as React from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

/**
 * Catches render errors inside the storefront while keeping the navbar and
 * footer in place, so the shopper is never stranded on a bare error screen.
 */
export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Replace with the real error reporter once one is wired up.
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex flex-col items-center gap-6 py-20 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-error-soft text-error">
        <TriangleAlert className="size-6" aria-hidden="true" />
      </span>

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted">
          That page failed to load. Trying again usually fixes it.
        </p>
        {error.digest && (
          <p className="text-xs text-subtle">
            Reference: <span className="font-mono">{error.digest}</span>
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Go home
        </Link>
      </div>
    </div>
  );
}
