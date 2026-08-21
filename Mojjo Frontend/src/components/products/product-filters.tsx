"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetBody, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { categories, countProductsInCategory } from "@/data/mock/categories";
import { PRICE_RANGES } from "@/lib/products";
import { useQueryParams } from "@/hooks/use-query-params";
import { cn } from "@/lib/utils";

const FILTER_KEYS = ["category", "price", "inStock", "onSale"];

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-border pt-5 first:border-t-0 first:pt-0">
      <legend className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
        {title}
      </legend>
      <div className="flex flex-col gap-3">{children}</div>
    </fieldset>
  );
}

function FilterControls({ hideCategories = false }: { hideCategories?: boolean }) {
  const { searchParams, setParams, clearParams, getList, toggleInList } = useQueryParams();

  const selectedCategories = getList("category");
  const selectedPrices = getList("price");
  const inStockOnly = searchParams.get("inStock") === "true";
  const onSaleOnly = searchParams.get("onSale") === "true";

  const activeCount =
    selectedCategories.length +
    selectedPrices.length +
    (inStockOnly ? 1 : 0) +
    (onSaleOnly ? 1 : 0);

  return (
    <div className="flex flex-col gap-5">
      {!hideCategories && (
        <FilterGroup title="Category">
          {categories.map((category) => (
            <Checkbox
              key={category.id}
              label={category.name}
              hint={countProductsInCategory(category.slug)}
              checked={selectedCategories.includes(category.slug)}
              onCheckedChange={() => toggleInList("category", category.slug)}
            />
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Price">
        {PRICE_RANGES.map((range) => (
          <Checkbox
            key={range.value}
            label={range.label}
            checked={selectedPrices.includes(range.value)}
            onCheckedChange={() => toggleInList("price", range.value)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Availability">
        <Checkbox
          label="In stock only"
          checked={inStockOnly}
          onCheckedChange={(checked) => setParams({ inStock: checked })}
        />
        <Checkbox
          label="On offer"
          checked={onSaleOnly}
          onCheckedChange={(checked) => setParams({ onSale: checked })}
        />
      </FilterGroup>

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" full onClick={() => clearParams(FILTER_KEYS)}>
          Clear {activeCount} filter{activeCount === 1 ? "" : "s"}
        </Button>
      )}
    </div>
  );
}

export interface ProductFiltersProps {
  /** Category page already scopes by category, so that group is hidden there. */
  hideCategories?: boolean;
  /**
   * "sidebar" is the desktop rail with a sheet fallback on small screens.
   * "button" is the trigger alone, for pages whose left edge is already spoken
   * for — the category rail — and which surface filters in a top row instead.
   */
  variant?: "sidebar" | "button";
}

export function ProductFilters({
  hideCategories = false,
  variant = "sidebar",
}: ProductFiltersProps) {
  const [open, setOpen] = React.useState(false);
  const { searchParams, getList } = useQueryParams();

  const activeCount =
    getList("category").length +
    getList("price").length +
    (searchParams.get("inStock") === "true" ? 1 : 0) +
    (searchParams.get("onSale") === "true" ? 1 : 0);

  return (
    <>
      <aside className={cn("hidden w-60 shrink-0", variant === "sidebar" && "lg:block")}>
        <div className="sticky top-24 rounded-xl border border-border bg-surface p-4 shadow-xs">
          <h2 className="mb-4 border-b border-border pb-3 text-sm font-semibold uppercase tracking-wide text-foreground">
            Filters
          </h2>
          <FilterControls hideCategories={hideCategories} />
        </div>
      </aside>

      <div className={cn(variant === "sidebar" && "lg:hidden")}>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <SlidersHorizontal aria-hidden="true" />
          Filters
          {activeCount > 0 && (
            <span
              className="ml-0.5 grid size-5 place-items-center rounded-full bg-secondary text-2xs font-bold text-on-secondary"
              data-numeric
            >
              {activeCount}
            </span>
          )}
        </Button>

        <Sheet
          open={open}
          onOpenChange={setOpen}
          side="left"
          title="Filters"
          description="Narrow the catalogue by category, price and availability"
        >
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>

          <SheetBody>
            <FilterControls hideCategories={hideCategories} />
          </SheetBody>

          <SheetFooter>
            <Button full onClick={() => setOpen(false)}>
              Show results
            </Button>
          </SheetFooter>
        </Sheet>
      </div>
    </>
  );
}
