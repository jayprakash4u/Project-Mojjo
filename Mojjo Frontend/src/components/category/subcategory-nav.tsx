"use client";

import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";
import type { Category } from "@/data/mock/categories";
import { countProductsInSubcategory } from "@/data/mock/categories";
import { cn } from "@/lib/utils";

/**
 * Real links rather than `router.push` buttons — subcategories are pages, so
 * they should be openable in a new tab and crawlable.
 */
export function SubcategoryNav({ category }: { category: Category }) {
  const segments = useSelectedLayoutSegments();
  const activeSlug = segments.at(-1);
  const isAll = activeSlug === undefined || activeSlug === category.slug;

  if (!category.subcategories?.length) return null;

  const pill = (active: boolean) =>
    cn(
      "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
      active
        ? "bg-secondary text-on-secondary"
        : "border border-border bg-surface text-foreground hover:border-secondary hover:text-secondary",
    );

  return (
    <nav aria-label="Subcategories" className="-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
      <ul className="flex w-max items-center gap-2">
        <li>
          <Link
            href={`/categories/${category.slug}`}
            aria-current={isAll ? "page" : undefined}
            className={pill(isAll)}
          >
            All {category.name.toLowerCase()}
          </Link>
        </li>

        {category.subcategories.map((sub) => {
          const active = activeSlug === sub.slug;
          const count = countProductsInSubcategory(category.slug, sub.slug);
          return (
            <li key={sub.slug}>
              <Link
                href={`/categories/${category.slug}/${sub.slug}`}
                aria-current={active ? "page" : undefined}
                className={pill(active)}
              >
                {sub.name}
                <span className="ml-1.5 text-xs opacity-70" data-numeric>
                  {count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
