"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { categories } from "@/data/mock/categories";
import { useQueryParams } from "@/hooks/use-query-params";
import { cn } from "@/lib/utils";

/**
 * The search box writes to the URL, but only after the shopper stops typing —
 * the previous version pushed a route on every keystroke.
 */
function useDebouncedSearch(initial: string, commit: (value: string) => void, delay = 350) {
  const [draft, setDraft] = React.useState(initial);
  const committed = React.useRef(initial);

  // Adopt external changes (back button, a chip being removed).
  React.useEffect(() => {
    if (initial !== committed.current) {
      committed.current = initial;
      setDraft(initial);
    }
  }, [initial]);

  React.useEffect(() => {
    if (draft === committed.current) return;
    const timer = setTimeout(() => {
      committed.current = draft;
      commit(draft);
    }, delay);
    return () => clearTimeout(timer);
  }, [draft, commit, delay]);

  return [draft, setDraft] as const;
}

export function ProductsHeader() {
  const { searchParams, setParams, getList, toggleInList } = useQueryParams();

  const activeCategories = getList("category");
  const commitSearch = React.useCallback(
    (value: string) => setParams({ search: value || undefined }),
    [setParams],
  );
  const [draft, setDraft] = useDebouncedSearch(searchParams.get("search") ?? "", commitSearch);

  return (
    <div className="flex flex-col gap-5">
      <div className="max-w-md">
        <Input
          type="search"
          label="Search the catalogue"
          hideLabel
          placeholder="Search products…"
          value={draft}
          onValueChange={setDraft}
        />
      </div>

      <div className="-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
        <div className="flex w-max items-center gap-2" role="group" aria-label="Filter by category">
          <button
            type="button"
            onClick={() => setParams({ category: undefined })}
            aria-pressed={activeCategories.length === 0}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
              activeCategories.length === 0
                ? "bg-secondary text-on-secondary"
                : "border border-border bg-surface text-foreground hover:border-secondary hover:text-secondary",
            )}
          >
            All
          </button>

          {categories.map((category) => {
            const active = activeCategories.includes(category.slug);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleInList("category", category.slug)}
                aria-pressed={active}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                  active
                    ? "bg-secondary text-on-secondary"
                    : "border border-border bg-surface text-foreground hover:border-secondary hover:text-secondary",
                )}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
