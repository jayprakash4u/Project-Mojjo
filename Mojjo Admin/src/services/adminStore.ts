import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AdminProduct,
  AdminCategory,
  AdminOrder,
  AdminDeliveryZone,
  AdminCoupon,
  OrderStatus,
} from '../types/admin';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_DELIVERY_ZONES,
  INITIAL_COUPONS,
} from './adminData';

interface AdminStoreState {
  products: AdminProduct[];
  categories: AdminCategory[];
  orders: AdminOrder[];
  deliveryZones: AdminDeliveryZone[];
  coupons: AdminCoupon[];

  // Product Actions
  addProduct: (product: AdminProduct) => void;
  updateProduct: (product: AdminProduct) => void;
  deleteProduct: (productId: string) => void;
  updateStock: (productId: string, delta: number) => void;
  toggleProductChannel: (productId: string, channel: 'mobile' | 'web') => void;
  toggleFlashDeal: (productId: string) => void;

  // Category Actions
  addCategory: (category: AdminCategory) => void;
  updateCategory: (category: AdminCategory) => void;
  deleteCategory: (categoryId: string) => void;
  toggleCategoryStatus: (categoryId: string) => void;

  // Order Actions
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignRiderToOrder: (orderId: string, riderName: string, riderPhone: string) => void;

  // Reset to Default
  resetStore: () => void;
}

export const useAdminStore = create<AdminStoreState>()(
  persist(
    (set, get) => ({
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      orders: INITIAL_ORDERS,
      deliveryZones: INITIAL_DELIVERY_ZONES,
      coupons: INITIAL_COUPONS,

      addProduct: (product: AdminProduct) => {
        const { products } = get();
        set({ products: [product, ...products] });
      },

      updateProduct: (updated: AdminProduct) => {
        const { products } = get();
        set({
          products: products.map((p) => (p.id === updated.id ? updated : p)),
        });
      },

      deleteProduct: (productId: string) => {
        const { products } = get();
        set({
          products: products.filter((p) => p.id !== productId),
        });
      },

      updateStock: (productId: string, delta: number) => {
        const { products } = get();
        set({
          products: products.map((p) => {
            if (p.id === productId) {
              const updatedStock = Math.max(0, p.stockQuantity + delta);
              return {
                ...p,
                stockQuantity: updatedStock,
                isAvailable: updatedStock > 0,
              };
            }
            return p;
          }),
        });
      },

      toggleProductChannel: (productId: string, channel: 'mobile' | 'web') => {
        const { products } = get();
        set({
          products: products.map((p) => {
            if (p.id === productId) {
              if (channel === 'mobile')
                return { ...p, showOnMobileApp: !p.showOnMobileApp };
              if (channel === 'web')
                return { ...p, showOnWeb: !p.showOnWeb };
            }
            return p;
          }),
        });
      },

      toggleFlashDeal: (productId: string) => {
        const { products } = get();
        set({
          products: products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  isFlashDeal: !p.isFlashDeal,
                  isDealOfTheDay: !p.isDealOfTheDay,
                }
              : p
          ),
        });
      },

      addCategory: (category: AdminCategory) => {
        const { categories } = get();
        set({ categories: [...categories, category] });
      },

      updateCategory: (updated: AdminCategory) => {
        const { categories } = get();
        set({
          categories: categories.map((c) =>
            c.id === updated.id ? updated : c
          ),
        });
      },

      deleteCategory: (categoryId: string) => {
        const { categories } = get();
        set({
          categories: categories.filter((c) => c.id !== categoryId),
        });
      },

      toggleCategoryStatus: (categoryId: string) => {
        const { categories } = get();
        set({
          categories: categories.map((c) =>
            c.id === categoryId ? { ...c, isActive: !c.isActive } : c
          ),
        });
      },

      updateOrderStatus: (orderId: string, status: OrderStatus) => {
        const { orders } = get();
        set({
          orders: orders.map((o) =>
            o.id === orderId ? { ...o, orderStatus: status } : o
          ),
        });
      },

      assignRiderToOrder: (orderId: string, riderName: string, riderPhone: string) => {
        const { orders } = get();
        set({
          orders: orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  assignedRider: {
                    id: `r-${Date.now()}`,
                    name: riderName,
                    phone: riderPhone,
                  },
                  orderStatus: 'OutForDelivery',
                }
              : o
          ),
        });
      },

      resetStore: () => {
        set({
          products: INITIAL_PRODUCTS,
          categories: INITIAL_CATEGORIES,
          orders: INITIAL_ORDERS,
          deliveryZones: INITIAL_DELIVERY_ZONES,
          coupons: INITIAL_COUPONS,
        });
      },
    }),
    {
      name: 'mojjo-admin-enterprise-storage',
    }
  )
);
