import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/data/mock/categories";
import { ProductImage } from "@/components/product/product-image";
import { pluralize } from "@/lib/format";

export interface CategoryCardProps {
  category: Category;
  productCount: number;
}

export function CategoryCard({ category, productCount }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-xs transition-[box-shadow,border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md"
    >
      <ProductImage
        src={category.image}
        alt=""
        sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 60vw"
        className="aspect-4/5"
        imageClassName="transition-transform duration-500 ease-out group-hover:scale-[1.05]"
      />

      {/* Ink scrim keeps the label legible over any product photography. */}
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/45 to-transparent p-4 pt-12">
        <p className="text-base font-semibold text-white">{category.name}</p>
        <p className="mt-0.5 text-xs text-white/75">{category.tagline}</p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-white">
          {pluralize(productCount, "product")}
          <ArrowRight
            className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </p>
      </div>
    </Link>
  );
}
