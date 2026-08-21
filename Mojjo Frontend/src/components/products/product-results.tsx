import Link from "next/link";
import { SearchX } from "lucide-react";
import type { Product } from "@/types";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductSort } from "@/components/products/product-sort";
import { ProductPagination } from "@/components/products/product-pagination";
import { ProductActiveFilters } from "@/components/products/product-active-filters";
import { EmptyState } from "@/components/common/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { pluralize } from "@/lib/format";
import { queryProducts, type ProductQuery } from "@/lib/products";
import { cn } from "@/lib/utils";

export interface ProductResultsProps {
  /** The catalogue to search within — all products, or one category's slice. */
  source: Product[];
  query: ProductQuery;
  hideCategoryFilter?: boolean;
  /**
   * "sidebar" keeps the desktop filter rail. "row" collapses filters and sort
   * into a scrollable chip row above the grid, for pages whose left edge is
   * taken by the subcategory rail.
   */
  filterLayout?: "sidebar" | "row";
}

/**
 * Filter → sort → paginate happens here, on the server, from the URL. Client
 * components below only ever write query params.
 *
 * Layout follows the marketplace convention: a persistent filter rail in its
 * own panel, results in a second panel beside it.
 */
export function ProductResults({
  source,
  query,
  hideCategoryFilter = false,
  filterLayout = "sidebar",
}: ProductResultsProps) {
  const { items, total, page, totalPages } = queryProducts(source, query);
  const asRow = filterLayout === "row";

  return (
    <div className={cn("flex flex-col gap-3", !asRow && "lg:flex-row lg:gap-4")}>
      {!asRow && <ProductFilters hideCategories={hideCategoryFilter} />}

      <div className="min-w-0 flex-1 rounded-xl border border-border bg-surface p-4 shadow-xs sm:p-5">
        <div
          className={cn(
            "mb-4 flex items-center gap-3 border-b border-border pb-4",
            asRow
              ? // One scrollable row on narrow screens rather than wrapping
                // controls onto a second line and pushing the grid down.
                "-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0"
              : "flex-wrap justify-between",
          )}
        >
          {asRow && (
            <ProductFilters hideCategories={hideCategoryFilter} variant="button" />
          )}

          {/* Kept for assistive tech only: filtering changes the result set
              silently otherwise, and the count is visible in the footer line. */}
          <p className="sr-only" aria-live="polite" data-numeric>
            {total} {total === 1 ? "product" : "products"}
          </p>

          {/* The count used to hold the right-hand edge; without it sort has to
              claim the space itself. In the chip row it stays beside filters. */}
          <div className={cn("shrink-0", !asRow && "ml-auto")}>
            <ProductSort />
          </div>
        </div>

        <ProductActiveFilters className="mb-4" />

        {items.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Nothing matched those filters"
            description="Try widening the price range, or clear the filters to see the full catalogue."
            action={
              <Link href="/products" className={buttonVariants({ variant: "outline" })}>
                Clear all filters
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-6">
            <ProductGrid products={items} eagerFirstRow />
            <ProductPagination currentPage={page} totalPages={totalPages} />
            <p className="text-center text-xs text-subtle" data-numeric>
              Showing {items.length} of {pluralize(total, "product")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
