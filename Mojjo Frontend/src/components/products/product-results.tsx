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

export interface ProductResultsProps {
  /** The catalogue to search within — all products, or one category's slice. */
  source: Product[];
  query: ProductQuery;
  hideCategoryFilter?: boolean;
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
}: ProductResultsProps) {
  const { items, total, page, totalPages } = queryProducts(source, query);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
      <ProductFilters hideCategories={hideCategoryFilter} />

      <div className="min-w-0 flex-1 rounded-xl border border-border bg-surface p-4 shadow-xs sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <p className="text-sm text-muted" aria-live="polite" data-numeric>
            <span className="font-semibold text-foreground">{total}</span>{" "}
            {total === 1 ? "product" : "products"}
          </p>
          <ProductSort />
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
