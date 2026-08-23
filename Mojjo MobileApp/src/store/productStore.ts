import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types/product';
import { UNIFIED_MOCK_PRODUCTS } from '../data/mockProducts';

interface ProductState {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  resetProducts: () => void;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: UNIFIED_MOCK_PRODUCTS,

      addProduct: (product: Product) => {
        const { products } = get();
        set({ products: [product, ...products] });
      },

      updateProduct: (updated: Product) => {
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

      resetProducts: () => {
        set({ products: UNIFIED_MOCK_PRODUCTS });
      },
    }),
    {
      name: 'mojjo-products-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
