import { Product } from './product';

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number; // Current active price
  originalPrice?: number; // MRP / strikethrough price
  unitDiscount: number; // originalPrice - unitPrice
  totalPrice: number; // quantity * unitPrice
  originalTotalPrice: number; // quantity * (originalPrice || unitPrice)
  itemSavings: number; // originalTotalPrice - totalPrice
  stockQuantity: number; // Real-time available stock limit
  isOutOfStock: boolean;
  maxAllowedQuantity: number;
}

export interface AppliedCoupon {
  code: string;
  title: string;
  description: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  calculatedDiscount: number;
}

export interface Offer {
  code: string;
  title: string;
  description: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiresAt?: string;
  badge?: string;
}

export interface CartSummary {
  items: CartItem[];
  mrpSubtotal: number; // Total MRP before any discounts
  itemSubtotal: number; // Selling price total after product discounts
  itemDiscountTotal: number; // Savings from product discounts (mrpSubtotal - itemSubtotal)
  couponCode?: string;
  couponDiscount: number;
  appliedOffer?: AppliedCoupon;
  mojjoCoinsRedeemed: number;
  mojjoCoinsDiscount: number;
  freeDeliveryThreshold: number;
  isFreeDelivery: boolean;
  remainingForFreeDelivery: number;
  deliveryFee: number;
  handlingFee: number; // Small order / packaging handling
  taxAmount: number; // VAT/Tax component breakdown
  totalAmount: number; // Final payable amount
  totalSavings: number; // All savings combined (product + coupon + free delivery)
  totalItemCount: number;
  hasOutOfStockItems: boolean;
  isServerValidated: boolean;
  serverValidationWarnings?: string[];
}

export interface CartValidationRequestItem {
  productId: string;
  quantity: number;
}

export interface CartValidationResponse {
  isValid: boolean;
  items: {
    productId: string;
    productName: string;
    requestedQuantity: number;
    availableStock: number;
    currentUnitPrice: number;
    originalUnitPrice?: number;
    isAvailable: boolean;
    priceChanged: boolean;
  }[];
  couponValid: boolean;
  couponDiscount: number;
  couponMessage?: string;
  serverSubtotal: number;
  serverDeliveryFee: number;
  serverTotalAmount: number;
  warnings: string[];
}
