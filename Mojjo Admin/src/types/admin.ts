export type PlatformSource = 'MobileApp' | 'Web';

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'OutForDelivery'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod = 'eSewa' | 'Khalti' | 'COD';
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded';

export interface AdminOrderItem {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  platform: PlatformSource;
  customerName: string;
  customerPhone: string;
  items: AdminOrderItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryAddress: {
    street: string;
    area: string;
    city: string;
    landmark?: string;
  };
  assignedRider?: {
    id: string;
    name: string;
    phone: string;
  };
  createdAt: string;
  estimatedDeliveryEtaMinutes: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryId: string;
  unit: string;
  price: number;
  mrp: number;
  stockQuantity: number;
  isAvailable: boolean;
  isFlashDeal: boolean;
  isDealOfTheDay?: boolean;
  isPopularNow?: boolean;
  isHardDrinks?: boolean;
  isCigarettes?: boolean;
  isSnacks?: boolean;
  isDrinksAndMixers?: boolean;
  pieceOptions?: {
    singleStickPrice: number;
    packPrice: number;
    sticksPerPack: number;
  };
  units?: {
    id: string;
    label: string;
    price: number;
    contains: number;
  }[];
  showOnMobileApp: boolean;
  showOnWeb: boolean;
  thumbnailUrl: string;
  updatedAt: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  image: string;
  icon: string;
  color: string;
  productCount: number;
  isActive: boolean;
  displayOrder: number;
  subcategories: string[];
}

export interface AdminDeliveryZone {
  id: string;
  name: string;
  city: string;
  darkStoreHub: string;
  standardEtaMinutes: number;
  expressEtaMinutes: number;
  isActive: boolean;
  isSurgePricing: boolean;
  activeRidersCount: number;
  pendingOrdersCount: number;
}

export interface AdminCoupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  validFor: 'All' | 'MobileApp' | 'Web';
  usageCount: number;
  isActive: boolean;
  expiresAt: string;
}

export interface DashboardKPIs {
  totalRevenueNpr: number;
  revenueGrowthPercent: number;
  totalOrdersToday: number;
  ordersGrowthPercent: number;
  activeDeliveriesCount: number;
  averageDeliveryMinutes: number;
  platformSplit: {
    mobileAppOrders: number;
    mobileAppRevenue: number;
    webOrders: number;
    webRevenue: number;
  };
  lowStockItemsCount: number;
}
