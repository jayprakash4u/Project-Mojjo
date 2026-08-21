import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SearchX } from "lucide-react";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ProductResults } from "@/components/products/product-results";
import { EmptyState } from "@/components/common/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { products } from "@/data/mock/products";
import { parseProductQuery, filterProducts } from "@/lib/products";
import { searchParamsToUrlSearchParams } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Search",
  // Search result pages carry no unique content worth indexing.
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = searchParamsToUrlSearchParams(await searchParams);
  const term = params.get("q")?.trim() ?? "";
  const query = parseProductQuery(params);

  // `q` drives the headline; the shared parser already folds it into `search`.
  const hasAnyMatch = term ? filterProducts(products, { search: term }).length > 0 : true;

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />

      <header className="mt-5 flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {term ? `Results for “${term}”` : "Search"}
        </h1>
        {!term && (
          <p className="text-sm text-muted">
            Use the search box above to look for a product, brand or category.
          </p>
        )}
      </header>

      <Suspense fallback={<div className="mt-8 h-64" />}>
        <div className="mt-8">
          {term && !hasAnyMatch ? (
            <EmptyState
              icon={SearchX}
              title={`Nothing found for “${term}”`}
              description="Check the spelling, or browse the catalogue by category instead."
              action={
                <Link href="/products" className={buttonVariants({ variant: "outline" })}>
                  Browse all products
                </Link>
              }
            />
          ) : (
            <ProductResults source={products} query={query} />
          )}
        </div>
      </Suspense>
    </div>
  );
}
