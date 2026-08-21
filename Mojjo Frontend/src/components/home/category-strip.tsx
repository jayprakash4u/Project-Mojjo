import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { categories } from "@/data/mock/categories";

/**
 * The circular category rail marketplaces put directly under the header.
 * It is the fastest route into the catalogue, so it stays above the fold and
 * scrolls horizontally rather than wrapping.
 */

type Tile = { label: string; href: Route; image: string };

const img = (label: string) =>
  `https://placehold.co/200x200/efece3/0b1f2a.png?font=source-sans-pro&text=${encodeURIComponent(label)}`;

/** Top-level categories, then each one's subcategories, flattened into one rail. */
const tiles: Tile[] = categories.flatMap((category) => [
  {
    label: category.name,
    href: `/categories/${category.slug}` as Route,
    image: img(category.name),
  },
  ...(category.subcategories ?? []).map((sub) => ({
    label: sub.name,
    href: `/categories/${category.slug}/${sub.slug}` as Route,
    image: img(sub.name),
  })),
]);

export function CategoryStrip() {
  return (
    <nav aria-label="Shop by category" className="border-b border-border bg-surface">
      <div className="container-page">
        <ul className="flex gap-6 overflow-x-auto py-4 scrollbar-none sm:gap-8 sm:py-5">
          {tiles.map((tile) => (
            <li key={tile.href} className="shrink-0">
              <Link
                href={tile.href}
                className="group flex w-16 flex-col items-center gap-2 rounded-md sm:w-20"
              >
                <span className="relative size-14 overflow-hidden rounded-full border border-border bg-surface-sunken transition-transform duration-200 group-hover:-translate-y-0.5 sm:size-16">
                  <Image
                    src={tile.image}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </span>
                <span className="text-center text-2xs font-medium leading-tight text-foreground group-hover:text-secondary sm:text-xs">
                  {tile.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
