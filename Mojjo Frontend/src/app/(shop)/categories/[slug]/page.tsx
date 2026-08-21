import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { SubcategoryNav } from "@/components/category/subcategory-nav";
import { ProductResults } from "@/components/products/product-results";
import { categories, countProductsInCategory, getCategoryBySlug } from "@/data/mock/categories";
import { products } from "@/data/mock/products";
import { parseProductQuery } from "@/lib/products";
import { pluralize } from "@/lib/format";
import { searchParamsToUrlSearchParams } from "@/lib/search-params";

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) return { title: "Category not found" };

  return { title: category.name, description: category.description };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/categories/[slug]">) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) notFound();

  const query = parseProductQuery(searchParamsToUrlSearchParams(await searchParams));
  const source = products.filter((product) => product.category === category.slug);

  return (
    <div className="pb-4 pt-3 sm:pt-4">
      <div className="container-page">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-xs sm:p-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Products", href: "/products" },
              { label: category.name },
            ]}
          />

          <header className="mt-4 flex flex-col gap-1.5">
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {category.name}
              </h1>
              <span className="text-sm text-subtle" data-numeric>
                {pluralize(countProductsInCategory(category.slug), "product")}
              </span>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted">{category.description}</p>
          </header>

          <Suspense fallback={<div className="mt-5 h-10" />}>
            <div className="mt-5">
              <SubcategoryNav category={category} />
            </div>
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<div className="mt-3 h-96" />}>
        <div className="container-page mt-3 sm:mt-4">
          <ProductResults source={source} query={query} hideCategoryFilter />
        </div>
      </Suspense>
    </div>
  );
}
