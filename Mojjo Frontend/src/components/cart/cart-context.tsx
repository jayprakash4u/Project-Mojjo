"use client";

import * as React from "react";
import type { CartItem, Product } from "@/types";
import { usePersistentState } from "@/hooks/use-persistent-state";

const STORAGE_KEY = "mojjo.cart.v1";
export const MAX_QUANTITY_PER_ITEM = 20;

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  earnedCoins: number;
  /** False until localStorage has been read — badges wait on this. */
  hydrated: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  quantityOf: (productId: string) => number;
};

const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems, hydrated] = usePersistentState<CartItem[]>(STORAGE_KEY, []);
  const [isOpen, setIsOpen] = React.useState(false);

  const openCart = React.useCallback(() => setIsOpen(true), []);
  const closeCart = React.useCallback(() => setIsOpen(false), []);

  const addItem = React.useCallback(
    (product: Product, quantity = 1) => {
      setItems((current) => {
        const existing = current.find((item) => item.product.id === product.id);
        if (!existing) {
          return [...current, { product, quantity: Math.min(quantity, MAX_QUANTITY_PER_ITEM) }];
        }
        return current.map((item) =>
          item.product.id === product.id
            ? {
                // Re-seat the product so a price or stock change is picked up.
                product,
                quantity: Math.min(item.quantity + quantity, MAX_QUANTITY_PER_ITEM),
              }
            : item,
        );
      });
    },
    [setItems],
  );

  const removeItem = React.useCallback(
    (productId: string) => {
      setItems((current) => current.filter((item) => item.product.id !== productId));
    },
    [setItems],
  );

  const updateQuantity = React.useCallback(
    (productId: string, quantity: number) => {
      setItems((current) => {
        if (quantity <= 0) return current.filter((item) => item.product.id !== productId);
        return current.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY_PER_ITEM) }
            : item,
        );
      });
    },
    [setItems],
  );

  const clearCart = React.useCallback(() => setItems([]), [setItems]);

  const totals = React.useMemo(
    () =>
      items.reduce(
        (accumulator, { product, quantity }) => ({
          itemCount: accumulator.itemCount + quantity,
          subtotal: accumulator.subtotal + product.price * quantity,
          earnedCoins: accumulator.earnedCoins + product.rewardCoins * quantity,
        }),
        { itemCount: 0, subtotal: 0, earnedCoins: 0 },
      ),
    [items],
  );

  const quantityOf = React.useCallback(
    (productId: string) => items.find((item) => item.product.id === productId)?.quantity ?? 0,
    [items],
  );

  const value = React.useMemo<CartContextValue>(
    () => ({
      items,
      ...totals,
      hydrated,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      quantityOf,
    }),
    [
      items,
      totals,
      hydrated,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      quantityOf,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = React.useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
