import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ProductsHeader } from "@/components/products/products-header";
import { ProductResults } from "@/components/products/product-results";
import { products } from "@/data/mock/products";
import { parseProductQuery } from "@/lib/products";
import { searchParamsToUrlSearchParams } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "All products",
  description:
    "Browse the full Mojjo catalogue — whisky, wine, beer, cigarettes, snacks and cold drinks.",
};

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const query = parseProductQuery(searchParamsToUrlSearchParams(await searchParams));

  return (
    <div className="pb-4 pt-3 sm:pt-4">
      <div className="container-page">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-xs sm:p-6">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products" }]} />

          <header className="mt-4 flex flex-col gap-1.5">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              All products
            </h1>
            <p className="max-w-2xl text-sm text-muted">
              Drinks, cigarettes, snacks and cold drinks from licensed stores near you.
            </p>
          </header>

          {/* useSearchParams in the header/filters needs a Suspense boundary. */}
          <Suspense fallback={<div className="mt-6 h-28" />}>
            <div className="mt-6">
              <ProductsHeader />
            </div>
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<div className="mt-3 h-96" />}>
        <div className="container-page mt-3 sm:mt-4">
          <ProductResults source={products} query={query} />
        </div>
      </Suspense>
    </div>
  );
}
