import type { Product, ProductUnit } from "@/types";

export const SORT_OPTIONS = [
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "name_asc", label: "Name: A–Z" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const PRICE_RANGES = [
  { value: "under_1000", label: "Under NPR 1,000", min: 0, max: 1_000 },
  { value: "1000_3000", label: "NPR 1,000 – 3,000", min: 1_000, max: 3_000 },
  { value: "3000_8000", label: "NPR 3,000 – 8,000", min: 3_000, max: 8_000 },
  { value: "8000_plus", label: "NPR 8,000+", min: 8_000, max: Number.POSITIVE_INFINITY },
] as const;

export type PriceRangeValue = (typeof PRICE_RANGES)[number]["value"];

export const PRODUCTS_PER_PAGE = 8;

export type ProductQuery = {
  search?: string;
  /** Category slugs; empty means "no category filter". */
  categories?: string[];
  subcategory?: string;
  priceRanges?: string[];
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
  sort?: SortValue;
  page?: number;
  perPage?: number;
};

/** Parses the URL search params into a typed query. One parser, used everywhere. */
export function parseProductQuery(
  params: URLSearchParams | ReadonlyURLSearchParamsLike,
): ProductQuery {
  const list = (key: string) => {
    const raw = params.get(key);
    return raw ? raw.split(",").filter(Boolean) : [];
  };

  const sort = params.get("sort");
  const page = Number.parseInt(params.get("page") ?? "1", 10);

  return {
    search: params.get("search") ?? params.get("q") ?? "",
    categories: list("category"),
    subcategory: params.get("subcategory") ?? undefined,
    priceRanges: list("price"),
    inStockOnly: params.get("inStock") === "true",
    onSaleOnly: params.get("onSale") === "true",
    sort: isSortValue(sort) ? sort : "popular",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

type ReadonlyURLSearchParamsLike = { get(name: string): string | null };

function isSortValue(value: string | null): value is SortValue {
  return SORT_OPTIONS.some((option) => option.value === value);
}

function matchesSearch(product: Product, term: string): boolean {
  return (
    product.title.toLowerCase().includes(term) ||
    product.category.toLowerCase().includes(term) ||
    (product.subcategory?.toLowerCase().includes(term) ?? false) ||
    (product.description?.toLowerCase().includes(term) ?? false)
  );
}

function matchesPrice(product: Product, ranges: string[]): boolean {
  if (ranges.length === 0) return true;
  return ranges.some((value) => {
    const range = PRICE_RANGES.find((r) => r.value === value);
    return range ? product.price >= range.min && product.price < range.max : false;
  });
}

export function filterProducts(products: Product[], query: ProductQuery): Product[] {
  const term = query.search?.trim().toLowerCase() ?? "";
  const categories = query.categories ?? [];

  return products.filter((product) => {
    if (term && !matchesSearch(product, term)) return false;
    if (categories.length > 0 && !categories.includes(product.category)) return false;
    if (query.subcategory && product.subcategory !== query.subcategory) return false;
    if (!matchesPrice(product, query.priceRanges ?? [])) return false;
    if (query.inStockOnly && !product.inStock) return false;
    if (query.onSaleOnly && !product.originalPrice) return false;
    return true;
  });
}

export function sortProducts(products: Product[], sort: SortValue = "popular"): Product[] {
  const sorted = [...products];
  switch (sort) {
    case "price_asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price_desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "name_asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "newest":
      return sorted.sort((a, b) => Number(b.id) - Number(a.id));
    case "popular":
    default:
      return sorted.sort(
        (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
      );
  }
}

export type PaginatedProducts = {
  items: Product[];
  total: number;
  page: number;
  totalPages: number;
};

/** Filter → sort → paginate. `page` is clamped so a stale ?page never blanks the grid. */
export function queryProducts(products: Product[], query: ProductQuery): PaginatedProducts {
  const perPage = query.perPage ?? PRODUCTS_PER_PAGE;
  const matched = sortProducts(filterProducts(products, query), query.sort);
  const totalPages = Math.max(1, Math.ceil(matched.length / perPage));
  const page = Math.min(Math.max(query.page ?? 1, 1), totalPages);

  return {
    items: matched.slice((page - 1) * perPage, page * perPage),
    total: matched.length,
    page,
    totalPages,
  };
}

/** True when the shopper has narrowed the catalogue in any way. */
export function hasActiveFilters(query: ProductQuery): boolean {
  return Boolean(
    query.search ||
      query.categories?.length ||
      query.priceRanges?.length ||
      query.inStockOnly ||
      query.onSaleOnly,
  );
}

export function discountPercent(product: Product): number | null {
  if (!product.originalPrice || product.originalPrice <= product.price) return null;
  return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
}

/**
 * Separates a product id from the unit id inside a cart key. Chosen because no
 * catalogue id contains it, so `baseProductId` can always split it back out.
 */
export const UNIT_KEY_SEPARATOR = "__";

/**
 * Projects a product down to one purchasable unit.
 *
 * The cart keys on `product.id`, so encoding the unit into the id lets a single
 * stick and a pack of twenty sit in the cart as separate lines without the
 * cart, checkout or order code learning what a unit is. `slug` is untouched,
 * so every link still points at the one product page.
 */
export function productForUnit(product: Product, unit: ProductUnit): Product {
  const derived: Product = {
    ...product,
    id: `${product.id}${UNIT_KEY_SEPARATOR}${unit.id}`,
    title: `${product.title} (${unit.label})`,
    price: unit.price,
    // Coins follow the unit price rather than the pack price, at the same rate
    // the rest of the catalogue uses.
    rewardCoins: Math.max(1, Math.round(unit.price * 0.005)),
  };

  // A cart line is one concrete unit: it has no further units to choose from,
  // and the pack-level "was" price would not apply to a single stick.
  delete derived.units;
  delete derived.originalPrice;

  return derived;
}

/** The catalogue id behind a cart line, with any unit suffix removed. */
export function baseProductId(id: string): string {
  return id.split(UNIT_KEY_SEPARATOR)[0];
}

/** The unit actually added to the cart for a product — the first is default. */
export function defaultUnit(product: Product): ProductUnit | undefined {
  return product.units?.[0];
}

/**
 * How much cheaper a unit is per item than the product's default unit — the
 * reason to buy the pack rather than twenty singles. Null when there is no
 * meaningful saving, so callers can simply omit the badge.
 */
export function unitSavingsPercent(units: ProductUnit[], unit: ProductUnit): number | null {
  const perItem = (candidate: ProductUnit) => candidate.price / (candidate.contains ?? 1);

  // Measured against the dearest way to buy, not against whichever unit happens
  // to be listed first — reordering the units must not change the maths.
  const dearest = units.reduce((a, b) => (perItem(b) > perItem(a) ? b : a));
  if (dearest.id === unit.id) return null;

  const saving = 1 - perItem(unit) / perItem(dearest);

  return saving >= 0.01 ? Math.round(saving * 100) : null;
}
