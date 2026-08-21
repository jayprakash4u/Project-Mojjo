"use client";

import { X } from "lucide-react";
import { getCategoryBySlug } from "@/data/mock/categories";
import { PRICE_RANGES } from "@/lib/products";
import { useQueryParams } from "@/hooks/use-query-params";
import { cn } from "@/lib/utils";

type Chip = { key: string; label: string; remove: () => void };

/**
 * Shows what is currently narrowing the results and lets each one be undone.
 * Without this, filters set on a previous page are invisible after navigation.
 */
export function ProductActiveFilters({ className }: { className?: string }) {
  const { searchParams, setParams, clearParams, getList, toggleInList } = useQueryParams();

  const chips: Chip[] = [];

  const search = searchParams.get("search");
  if (search) {
    chips.push({
      key: `search-${search}`,
      label: `“${search}”`,
      remove: () => setParams({ search: undefined }),
    });
  }

  for (const slug of getList("category")) {
    chips.push({
      key: `category-${slug}`,
      label: getCategoryBySlug(slug)?.name ?? slug,
      remove: () => toggleInList("category", slug),
    });
  }

  for (const value of getList("price")) {
    const range = PRICE_RANGES.find((item) => item.value === value);
    if (!range) continue;
    chips.push({
      key: `price-${value}`,
      label: range.label,
      remove: () => toggleInList("price", value),
    });
  }

  if (searchParams.get("inStock") === "true") {
    chips.push({
      key: "inStock",
      label: "In stock",
      remove: () => setParams({ inStock: undefined }),
    });
  }

  if (searchParams.get("onSale") === "true") {
    chips.push({
      key: "onSale",
      label: "On offer",
      remove: () => setParams({ onSale: undefined }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="sr-only">Active filters</span>

      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.remove}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface py-1 pl-3 pr-2 text-xs font-medium text-foreground transition-colors hover:border-error hover:text-error"
        >
          {chip.label}
          <X className="size-3" aria-hidden="true" />
          <span className="sr-only">Remove filter</span>
        </button>
      ))}

      {chips.length > 1 && (
        <button
          type="button"
          onClick={() => clearParams(["search", "category", "price", "inStock", "onSale"])}
          className="text-xs font-medium text-muted underline-offset-4 hover:text-foreground hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
