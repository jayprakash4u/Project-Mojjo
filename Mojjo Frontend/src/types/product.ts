export type ProductDetail = {
  label: string;
  value: string;
};

export type ProductBadge = "sale" | "new" | "bestseller" | "limited";

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
  inStock: boolean;
  /** Alcohol and tobacco require ID on delivery. */
  ageRestricted?: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
