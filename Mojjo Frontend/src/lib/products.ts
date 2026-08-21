import type { Product } from "@/types";

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
