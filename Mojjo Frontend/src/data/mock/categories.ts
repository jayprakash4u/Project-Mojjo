import { products } from "@/data/mock/products";

export type Subcategory = {
  name: string;
  slug: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  image: string;
  tagline: string;
  description: string;
  ageRestricted?: boolean;
  subcategories?: Subcategory[];
};

const img = (label: string) =>
  `https://placehold.co/600x750/f2efe6/0b1f2a?font=source-sans-pro&text=${encodeURIComponent(label)}`;

export const categories: Category[] = [
  {
    id: "alcohol",
    name: "Alcohol",
    slug: "alcohol",
    image: img("Alcohol"),
    tagline: "Whisky, wine, beer & spirits",
    description:
      "Single malts, reserve reds, craft beer and everything in between — chosen for the occasion, not the shelf.",
    ageRestricted: true,
    subcategories: [
      { name: "Whisky", slug: "whisky" },
      { name: "Vodka", slug: "vodka" },
      { name: "Rum", slug: "rum" },
      { name: "Tequila", slug: "tequila" },
      { name: "Gin", slug: "gin" },
      { name: "Wine", slug: "wine" },
      { name: "Beer", slug: "beer" },
    ],
  },
  {
    id: "cigarettes",
    name: "Cigarettes",
    slug: "cigarettes",
    image: img("Cigarettes"),
    tagline: "Familiar brands, delivered",
    description: "Everyday brands in full-flavour, light and menthol, sold to over-18s only.",
    ageRestricted: true,
  },
  {
    id: "snacks",
    name: "Snacks",
    slug: "snacks",
    image: img("Snacks"),
    tagline: "Chips, nuts & something sweet",
    description:
      "The things you actually reach for mid-evening — crisps, roasted nuts, chocolate and quick bites.",
    subcategories: [
      { name: "Chips", slug: "chips" },
      { name: "Nuts", slug: "nuts" },
      { name: "Chocolates", slug: "chocolates" },
      { name: "Quick Bites", slug: "quick-bites" },
    ],
  },
  {
    id: "cold-drinks",
    name: "Cold Drinks",
    slug: "cold-drinks",
    image: img("Cold Drinks"),
    tagline: "Soft drinks, water & mixers",
    description:
      "Chilled colas, sparkling water, energy drinks and the tonic and soda that finish a long drink.",
    subcategories: [
      { name: "Soft Drinks", slug: "soft-drinks" },
      { name: "Water", slug: "water" },
      { name: "Energy Drinks", slug: "energy-drinks" },
      { name: "Mixers", slug: "mixers" },
    ],
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export function getSubcategory(category: Category, slug: string): Subcategory | undefined {
  return category.subcategories?.find((sub) => sub.slug === slug);
}

/** Counts come from the catalogue itself, so they can never drift out of sync. */
export function countProductsInCategory(slug: string): number {
  return products.filter((product) => product.category === slug).length;
}

export function countProductsInSubcategory(categorySlug: string, subSlug: string): number {
  return products.filter(
    (product) => product.category === categorySlug && product.subcategory === subSlug,
  ).length;
}
