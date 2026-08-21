import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/data/mock/categories";
import { countProductsInSubcategory, getSubcategoryImage } from "@/data/mock/categories";
import { cn } from "@/lib/utils";

type Tile = {
  key: string;
  name: string;
  href: string;
  image?: string;
  count: number;
  active: boolean;
};

/**
 * The vertical subcategory rail — the quick-commerce convention (Blinkit,
 * Zepto, Instamart): artwork beside the label so the eye lands on the shape of
 * the bottle rather than reading a list of words.
 *
 * Real links rather than `router.push` buttons: subcategories are pages, so
 * they stay openable in a new tab and crawlable.
 *
 * The active tile arrives as a prop rather than from `useSelectedLayoutSegments`,
 * which returns an empty array when read from a leaf page and so never matched
 * the open subcategory. That also keeps this a server component: it is links
 * and images, with nothing to hydrate.
 */
export interface SubcategoryRailProps {
  category: Category;
  /** Slug of the open subcategory, or undefined on the category page itself. */
  activeSubcategory?: string;
}

export function SubcategoryRail({ category, activeSubcategory }: SubcategoryRailProps) {
  const isAll = activeSubcategory === undefined;

  if (!category.subcategories?.length) return null;

  const tiles: Tile[] = [
    {
      key: "__all",
      name: "All",
      href: `/categories/${category.slug}`,
      image: category.image,
      count: 0,
      active: isAll,
    },
    ...category.subcategories.map((sub) => ({
      key: sub.slug,
      name: sub.name,
      href: `/categories/${category.slug}/${sub.slug}`,
      // A subcategory the catalogue has not stocked yet has no product to
      // borrow artwork from, so it falls back to the category tile.
      image: getSubcategoryImage(category.slug, sub.slug) ?? category.image,
      count: countProductsInSubcategory(category.slug, sub.slug),
      active: activeSubcategory === sub.slug,
    })),
  ];

  return (
    <nav
      aria-label="Subcategories"
      className="w-[76px] shrink-0 sm:w-[92px]"
    >
      {/* Pins directly under the 64px sticky navbar and owns its scrolling:
          `overscroll-contain` stops a rail that has hit its end from handing
          the wheel back to the page. `dvh` rather than `vh` so mobile browser
          chrome collapsing does not clip the last tile. */}
      <ul className="sticky top-[4.5rem] flex max-h-[calc(100dvh-5.5rem)] flex-col gap-1 overflow-y-auto overscroll-contain rounded-xl border border-border bg-surface p-1.5 shadow-xs scrollbar-none">
        {tiles.map((tile) => (
          <li key={tile.key}>
            <Link
              href={tile.href}
              aria-current={tile.active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-center transition-colors duration-200",
                tile.active
                  ? "bg-secondary/12 text-secondary"
                  : "text-muted hover:bg-surface-sunken hover:text-foreground",
              )}
            >
              <span className="relative size-11 overflow-hidden rounded-lg bg-surface-sunken sm:size-12">
                {tile.image && (
                  <Image
                    src={tile.image}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                )}
              </span>

              <span
                className={cn(
                  "line-clamp-2 text-2xs font-medium leading-tight sm:text-xs",
                  tile.active && "font-semibold",
                )}
              >
                {tile.name}
              </span>

              {/* The count is useful to a screen reader but would crowd the
                  tile, which is why it is not painted. */}
              {tile.key !== "__all" && (
                <span className="sr-only">{tile.count} products</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
