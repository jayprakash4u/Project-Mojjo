import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types/product';

interface WishlistState {
  items: Product[];
  toggleWishlist: (product: Product) => boolean; // Returns true if added, false if removed
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleWishlist: (product: Product) => {
        const { items } = get();
        const exists = items.some((item) => item.id === product.id);

        if (exists) {
          set({ items: items.filter((item) => item.id !== product.id) });
          return false;
        } else {
          set({ items: [product, ...items] });
          return true;
        }
      },

      addToWishlist: (product: Product) => {
        const { items } = get();
        if (!items.some((item) => item.id === product.id)) {
          set({ items: [product, ...items] });
        }
      },

      removeFromWishlist: (productId: string) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },

      isWishlisted: (productId: string) => {
        return get().items.some((item) => item.id === productId);
      },

      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'mojjo-wishlist-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
