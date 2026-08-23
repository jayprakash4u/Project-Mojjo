export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  iconName?: string;
  displayOrder: number;
  isActive: boolean;
  itemCount?: number;
}

export interface ProductUnit {
  id: string;
  label: string;
  price: number;
  contains?: number;
}

export interface Product {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  brand?: string;
  unit: string; // e.g., "500ml", "1kg", "1 pack"
  price: number; // Regular price in NPR
  originalPrice?: number; // Strikethrough price if discounted
  discountPercentage?: number;
  stockQuantity: number;
  isAvailable: boolean;
  isAgeRestricted?: boolean;
  isFlashDeal: boolean;
  flashDealEnd?: string;
  images: string[];
  thumbnailUrl: string;
  tags: string[];
  ratingsAverage?: number;
  ratingsCount?: number;
  units?: ProductUnit[];
  pieceOptions?: {
    singleStickPrice: number;
    packPrice: number;
    sticksPerPack: number;
  };
  rewardCoins?: number;
  volume?: string;
  origin?: string;
}

export interface ProductFilterParams {
  categoryId?: string;
  query?: string;
  isFlashDeal?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'popular' | 'newest';
  pageNumber?: number;
  pageSize?: number;
}
