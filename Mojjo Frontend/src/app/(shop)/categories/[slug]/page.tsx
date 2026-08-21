import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SubcategoryRail } from "@/components/category/subcategory-rail";
import { ProductResults } from "@/components/products/product-results";
import { categories, getCategoryBySlug } from "@/data/mock/categories";
import { products } from "@/data/mock/products";
import { parseProductQuery } from "@/lib/products";
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

  const hasRail = (category.subcategories?.length ?? 0) > 0;
  const query = parseProductQuery(searchParamsToUrlSearchParams(await searchParams));
  const source = products.filter((product) => product.category === category.slug);

  return (
    <div className="pb-4 pt-3 sm:pt-4">
      <div className="container-page flex gap-3 sm:gap-4">
        <Suspense fallback={<div className="w-[76px] shrink-0 sm:w-[92px]" />}>
          <SubcategoryRail category={category} />
        </Suspense>

        {/* The rail already names the category, so the page carries only a
            screen-reader heading — every page still needs one h1. */}
        <div className="min-w-0 flex-1">
          <h1 className="sr-only">{category.name}</h1>

          <Suspense fallback={<div className="h-96" />}>
            <ProductResults
              source={source}
              query={query}
              hideCategoryFilter
              filterLayout={hasRail ? "row" : "sidebar"}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
