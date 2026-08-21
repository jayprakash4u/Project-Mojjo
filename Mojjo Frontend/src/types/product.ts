export type ProductDetail = {
  label: string;
  value: string;
};

export type ProductBadge = "sale" | "new" | "bestseller" | "limited";

/**
 * A way to buy the same product — a single stick or a pack of twenty, say.
 * Shops here sell cigarettes both ways, and the per-piece price is never a
 * clean division of the pack, so each unit carries its own price.
 */
export type ProductUnit = {
  /** Stable within the product. Becomes part of the cart key. */
  id: string;
  label: string;
  /** Price for one of this unit, in NPR. */
  price: number;
  /** Base items in the unit, for the "20 sticks" hint. */
  contains?: number;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  category: string;
  subcategory?: string;
  /** Current selling price, in NPR. */
  price: number;
  /** Pre-discount price. Present only when the item is on offer. */
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  badge?: ProductBadge;
  description?: string;
  volume?: string;
  origin?: string;
  details?: ProductDetail[];
  rewardCoins: number;
  /**
   * Present when the product can be bought more than one way. The first entry
   * is the default, and `price` above should match it so listings that never
   * open the selector still quote the right figure.
   */
  units?: ProductUnit[];
  inStock: boolean;
  /** Alcohol and tobacco require ID on delivery. */
  ageRestricted?: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
