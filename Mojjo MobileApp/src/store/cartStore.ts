import { create } from 'zustand';
import { Product } from '../types/product';
import {
  CartItem,
  CartSummary,
  AppliedCoupon,
  CartValidationResponse,
} from '../types/cart';
import { APP_CONFIG } from '../constants/config';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { StorageService } from '../services/storage';
import { HapticsService } from '../services/haptics';
import { CartApi, PROMOTIONAL_OFFERS } from '../api/services/cartApi';

interface CartState {
  items: CartItem[];
  appliedCoupon?: AppliedCoupon;
  mojjoCoinsRedeemed: number;
  isLoading: boolean;
  isValidating: boolean;
  lastValidationResult?: CartValidationResponse;

  // Actions
  addItem: (product: Product, quantity?: number) => { success: boolean; message?: string };
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  redeemCoins: (coins: number) => void;
  clearCart: () => void;
  initializeCart: () => Promise<void>;
  revalidateCartWithServer: () => Promise<CartValidationResponse>;

  // Calculations
  getSummary: () => CartSummary;
  getItemQuantity: (productId: string) => number;
}

const buildCartItem = (product: Product, quantity: number): CartItem => {
  const unitPrice = product.price;
  const originalPrice = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice
    : product.price;
  const unitDiscount = Math.max(0, originalPrice - unitPrice);
  const stockQuantity = Math.max(0, product.stockQuantity ?? 50);
  const cappedQty = Math.min(quantity, stockQuantity > 0 ? stockQuantity : quantity);

  return {
    product,
    quantity: cappedQty,
    unitPrice,
    originalPrice,
    unitDiscount,
    totalPrice: cappedQty * unitPrice,
    originalTotalPrice: cappedQty * originalPrice,
    itemSavings: cappedQty * unitDiscount,
    stockQuantity,
    isOutOfStock: stockQuantity <= 0,
    maxAllowedQuantity: stockQuantity > 0 ? Math.min(stockQuantity, 10) : 0,
  };
};

const persistCart = async (items: CartItem[]) => {
  await StorageService.setItem(STORAGE_KEYS.CART_ITEMS, items);
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  appliedCoupon: undefined,
  mojjoCoinsRedeemed: 0,
  isLoading: true,
  isValidating: false,
  lastValidationResult: undefined,

  addItem: (product: Product, quantity: number = 1) => {
    HapticsService.light();
    const currentItems = get().items;
    const existingIndex = currentItems.findIndex((item) => item.product.id === product.id);
    const availableStock = Math.max(0, product.stockQuantity ?? 50);

    if (availableStock <= 0) {
      return { success: false, message: `"${product.name}" is currently out of stock.` };
    }

    let updatedItems: CartItem[];
    let message: string | undefined;

    if (existingIndex >= 0) {
      const existing = currentItems[existingIndex];
      const desiredQty = existing.quantity + quantity;

      if (desiredQty > availableStock) {
        message = `Only ${availableStock} units available in stock.`;
      }

      const finalQty = Math.min(desiredQty, availableStock);
      const updatedItem = buildCartItem(product, finalQty);

      updatedItems = [...currentItems];
      updatedItems[existingIndex] = updatedItem;
    } else {
      const finalQty = Math.min(quantity, availableStock);
      if (quantity > availableStock) {
        message = `Only ${availableStock} units available in stock.`;
      }
      const newItem = buildCartItem(product, finalQty);
      updatedItems = [...currentItems, newItem];
    }

    set({ items: updatedItems });
    persistCart(updatedItems);
    return { success: true, message };
  },

  removeItem: (productId: string) => {
    HapticsService.light();
    const updatedItems = get().items.filter((item) => item.product.id !== productId);
    set({ items: updatedItems });
    persistCart(updatedItems);
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return { success: true };
    }

    HapticsService.selection();
    const currentItems = get().items;
    let message: string | undefined;

    const updatedItems = currentItems.map((item) => {
      if (item.product.id === productId) {
        const availableStock = item.stockQuantity;
        if (quantity > availableStock) {
          message = `Max available stock reached (${availableStock} items).`;
        }
        const finalQty = Math.min(quantity, availableStock > 0 ? availableStock : quantity);
        return buildCartItem(item.product, finalQty);
      }
      return item;
    });

    set({ items: updatedItems });
    persistCart(updatedItems);
    return { success: true, message };
  },

  applyCoupon: (code: string) => {
    const summary = get().getSummary();
    const cleanCode = code.trim().toUpperCase();
    const offer = PROMOTIONAL_OFFERS.find((o) => o.code.toUpperCase() === cleanCode);

    if (!offer) {
      return { success: false, message: `Coupon code "${cleanCode}" is invalid.` };
    }

    if (summary.itemSubtotal < offer.minOrderValue) {
      return {
        success: false,
        message: `Add NPR ${offer.minOrderValue - summary.itemSubtotal} more to apply ${offer.code}.`,
      };
    }

    let calculatedDiscount = 0;
    if (offer.discountType === 'percentage') {
      const rawDisc = (summary.itemSubtotal * offer.discountValue) / 100;
      calculatedDiscount = offer.maxDiscount ? Math.min(rawDisc, offer.maxDiscount) : rawDisc;
    } else {
      calculatedDiscount = offer.discountValue;
    }

    const applied: AppliedCoupon = {
      code: offer.code,
      title: offer.title,
      description: offer.description,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      minOrderValue: offer.minOrderValue,
      maxDiscount: offer.maxDiscount,
      calculatedDiscount,
    };

    set({ appliedCoupon: applied });
    HapticsService.success();
    return { success: true, message: `Applied ${offer.code}! You saved NPR ${calculatedDiscount}.` };
  },

  removeCoupon: () => {
    set({ appliedCoupon: undefined });
    HapticsService.light();
  },

  redeemCoins: (coins: number) => {
    set({ mojjoCoinsRedeemed: Math.max(0, coins) });
  },

  clearCart: () => {
    set({ items: [], appliedCoupon: undefined, mojjoCoinsRedeemed: 0, lastValidationResult: undefined });
    persistCart([]);
  },

  initializeCart: async () => {
    try {
      set({ isLoading: true });
      const savedItems = await StorageService.getItem<CartItem[]>(STORAGE_KEYS.CART_ITEMS, []);
      set({ items: savedItems || [], isLoading: false });
    } catch {
      set({ items: [], isLoading: false });
    }
  },

  /**
   * Server-Side Price & Inventory Revalidation before checkout
   */
  revalidateCartWithServer: async (): Promise<CartValidationResponse> => {
    const items = get().items;
    const appliedCoupon = get().appliedCoupon;

    set({ isValidating: true });
    try {
      const payload = items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
      }));

      const result = await CartApi.validateCart(payload, appliedCoupon?.code);

      // Reconcile any updated stock / prices from authoritative server
      const updatedItems = items.map((item) => {
        const serverItem = result.items.find((si) => si.productId === item.product.id);
        if (serverItem) {
          return {
            ...item,
            unitPrice: serverItem.currentUnitPrice,
            stockQuantity: serverItem.availableStock,
            isOutOfStock: !serverItem.isAvailable,
            quantity: Math.min(item.quantity, Math.max(1, serverItem.availableStock)),
            totalPrice: Math.min(item.quantity, Math.max(1, serverItem.availableStock)) * serverItem.currentUnitPrice,
          };
        }
        return item;
      });

      set({
        items: updatedItems,
        lastValidationResult: result,
        isValidating: false,
      });

      persistCart(updatedItems);
      return result;
    } catch {
      set({ isValidating: false });
      // Fallback response if network unreachable
      return {
        isValid: true,
        items: [],
        couponValid: !!appliedCoupon,
        couponDiscount: appliedCoupon?.calculatedDiscount || 0,
        serverSubtotal: get().getSummary().itemSubtotal,
        serverDeliveryFee: get().getSummary().deliveryFee,
        serverTotalAmount: get().getSummary().totalAmount,
        warnings: [],
      };
    }
  },

  getItemQuantity: (productId: string): number => {
    const item = get().items.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  },

  getSummary: (): CartSummary => {
    const { items, appliedCoupon, mojjoCoinsRedeemed } = get();

    // 1. Calculate MRP Total & Item Selling Total
    const mrpSubtotal = items.reduce(
      (sum, item) => sum + (item.originalPrice || item.unitPrice) * item.quantity,
      0
    );
    const itemSubtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const itemDiscountTotal = Math.max(0, mrpSubtotal - itemSubtotal);
    const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    // 2. Delivery Tiers & Remaining threshold
    const isFreeDelivery = itemSubtotal >= APP_CONFIG.FREE_DELIVERY_THRESHOLD || itemSubtotal === 0;
    const deliveryFee = isFreeDelivery ? 0 : APP_CONFIG.BASE_DELIVERY_FEE;
    const remainingForFreeDelivery = Math.max(0, APP_CONFIG.FREE_DELIVERY_THRESHOLD - itemSubtotal);

    // 3. Coupon Discount Calculation
    let couponDiscount = 0;
    if (appliedCoupon && itemSubtotal >= appliedCoupon.minOrderValue) {
      if (appliedCoupon.discountType === 'percentage') {
        const raw = (itemSubtotal * appliedCoupon.discountValue) / 100;
        couponDiscount = appliedCoupon.maxDiscount ? Math.min(raw, appliedCoupon.maxDiscount) : raw;
      } else {
        couponDiscount = appliedCoupon.discountValue;
      }
    }

    // 4. Mojjo Coins Discount (1 Coin = NPR 1)
    const mojjoCoinsDiscount = Math.min(mojjoCoinsRedeemed, Math.max(0, itemSubtotal - couponDiscount));

    // 5. Taxes & Handling Breakdown
    const handlingFee = 0;
    const taxAmount = Math.round(itemSubtotal * 0.13 * 100) / 100; // 13% VAT (inclusive)

    // 6. Final Total & Total Savings
    const totalAmount = Math.max(
      0,
      itemSubtotal + deliveryFee + handlingFee - couponDiscount - mojjoCoinsDiscount
    );

    const deliverySavings = isFreeDelivery && itemSubtotal > 0 ? APP_CONFIG.BASE_DELIVERY_FEE : 0;
    const totalSavings = itemDiscountTotal + couponDiscount + mojjoCoinsDiscount + deliverySavings;

    const hasOutOfStockItems = items.some((i) => i.isOutOfStock || i.stockQuantity <= 0);

    return {
      items,
      mrpSubtotal,
      itemSubtotal,
      itemDiscountTotal,
      couponCode: appliedCoupon?.code,
      couponDiscount,
      appliedOffer: appliedCoupon,
      mojjoCoinsRedeemed,
      mojjoCoinsDiscount,
      freeDeliveryThreshold: APP_CONFIG.FREE_DELIVERY_THRESHOLD,
      isFreeDelivery,
      remainingForFreeDelivery,
      deliveryFee,
      handlingFee,
      taxAmount,
      totalAmount,
      totalSavings,
      totalItemCount,
      hasOutOfStockItems,
      isServerValidated: false,
    };
  },
}));

/**
 * Fine-Grained Atomic Selectors for Re-render Optimization
 */
export const useCartItemCount = (): number => {
  return useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );
};

export const useCartSubtotal = (): number => {
  return useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.totalPrice, 0)
  );
};

export const useCartItemQuantity = (productId: string): number => {
  return useCartStore((state) => {
    const item = state.items.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  });
};

export const useCartAppliedCoupon = (): AppliedCoupon | undefined => {
  return useCartStore((state) => state.appliedCoupon);
};

export const useCartItems = (): CartItem[] => {
  return useCartStore((state) => state.items);
};

export const useCartSummary = (): CartSummary => {
  return useCartStore((state) => state.getSummary());
};
