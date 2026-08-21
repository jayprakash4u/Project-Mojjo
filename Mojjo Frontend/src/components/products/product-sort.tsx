"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { SORT_OPTIONS } from "@/lib/products";
import { useQueryParams } from "@/hooks/use-query-params";

/**
 * A native `<select>` rather than the previous hand-rolled listbox: keyboard
 * and screen-reader behaviour comes for free, and on mobile it opens the
 * platform picker instead of a cramped dropdown.
 */
export function ProductSort() {
  const id = React.useId();
  const { searchParams, setParams } = useQueryParams();
  const current = searchParams.get("sort") ?? "popular";

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="hidden shrink-0 text-sm text-muted sm:block">
        Sort
      </label>

      <div className="relative">
        <select
          id={id}
          aria-label="Sort products"
          value={current}
          onChange={(event) =>
            setParams({ sort: event.target.value === "popular" ? undefined : event.target.value })
          }
          className="h-9 appearance-none rounded-md border border-border bg-surface pl-3 pr-9 text-sm font-medium text-foreground transition-colors hover:border-border-strong focus-visible:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/35"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
