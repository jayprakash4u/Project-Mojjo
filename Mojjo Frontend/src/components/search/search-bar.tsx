"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { products } from "@/data/mock/products";
import { categories } from "@/data/mock/categories";
import { useDismissable } from "@/hooks/use-dismissable";
import { cn } from "@/lib/utils";

const TRENDING = ["Whisky", "Craft beer", "Red wine", "Mixers", "Dark chocolate"];
const MAX_SUGGESTIONS = 6;

type Suggestion = { label: string; hint: string };

/** Suggestions come from the catalogue itself rather than a hardcoded list. */
function buildSuggestions(query: string): Suggestion[] {
  const term = query.trim().toLowerCase();
  if (!term) return TRENDING.map((label) => ({ label, hint: "Trending" }));

  const matches: Suggestion[] = [];
  const seen = new Set<string>();

  const push = (label: string, hint: string) => {
    const key = label.toLowerCase();
    if (seen.has(key) || matches.length >= MAX_SUGGESTIONS) return;
    seen.add(key);
    matches.push({ label, hint });
  };

  for (const category of categories) {
    if (category.name.toLowerCase().includes(term)) push(category.name, "Category");
    for (const sub of category.subcategories ?? []) {
      if (sub.name.toLowerCase().includes(term)) push(sub.name, category.name);
    }
  }

  for (const product of products) {
    if (product.title.toLowerCase().includes(term)) push(product.title, "Product");
  }

  return matches;
}

export interface SearchBarProps {
  /** Called after a search is submitted — closes the mobile search drawer. */
  onSubmitted?: () => void;
  autoFocus?: boolean;
  className?: string;
  /** Anchors the suggestion list absolutely (desktop) or inline (mobile). */
  layout?: "overlay" | "inline";
}

export function SearchBar({
  onSubmitted,
  autoFocus = false,
  className,
  layout = "overlay",
}: SearchBarProps) {
  const router = useRouter();
  const listboxId = React.useId();

  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const { open, setOpen, containerRef } = useDismissable<HTMLDivElement>();

  const suggestions = React.useMemo(() => buildSuggestions(query), [query]);
  const isOpen = open && suggestions.length > 0;

  const go = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setOpen(false);
    setActiveIndex(-1);
    onSubmitted?.();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!isOpen) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      go(suggestions[activeIndex].label);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          go(query);
        }}
      >
        <Input
          type="search"
          label="Search products"
          hideLabel
          autoFocus={autoFocus}
          placeholder="Search drinks, snacks, cigarettes…"
          value={query}
          onValueChange={(next) => {
            setQuery(next);
            setActiveIndex(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
        />
      </form>

      {isOpen && (
        <div
          className={cn(
            "z-50 overflow-hidden rounded-lg border border-border bg-surface-raised shadow-lg animate-scale-in",
            layout === "overlay" ? "absolute inset-x-0 top-full mt-2" : "mt-2",
          )}
        >
          <ul id={listboxId} role="listbox" aria-label="Search suggestions" className="p-1.5">
            {suggestions.map((suggestion, index) => (
              <li key={suggestion.label} role="none">
                <button
                  type="button"
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => go(suggestion.label)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                    index === activeIndex
                      ? "bg-secondary-soft text-secondary"
                      : "text-foreground hover:bg-surface-sunken",
                  )}
                >
                  {suggestion.hint === "Trending" ? (
                    <TrendingUp className="size-4 shrink-0 text-subtle" aria-hidden="true" />
                  ) : (
                    <Search className="size-4 shrink-0 text-subtle" aria-hidden="true" />
                  )}
                  <span className="flex-1 truncate">{suggestion.label}</span>
                  <span className="shrink-0 text-2xs uppercase tracking-wide text-subtle">
                    {suggestion.hint}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
