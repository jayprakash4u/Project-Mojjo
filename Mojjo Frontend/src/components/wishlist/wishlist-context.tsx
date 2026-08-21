"use client";

import * as React from "react";
import { usePersistentState } from "@/hooks/use-persistent-state";

const STORAGE_KEY = "mojjo.wishlist.v1";

type WishlistContextValue = {
  ids: string[];
  count: number;
  hydrated: boolean;
  has: (productId: string) => boolean;
  /** Returns the state the item ended up in, so callers can word the toast. */
  toggle: (productId: string) => boolean;
  clear: () => void;
};

const WishlistContext = React.createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds, hydrated] = usePersistentState<string[]>(STORAGE_KEY, []);

  const has = React.useCallback((productId: string) => ids.includes(productId), [ids]);

  const toggle = React.useCallback(
    (productId: string) => {
      const nextSaved = !ids.includes(productId);
      setIds((current) =>
        current.includes(productId)
          ? current.filter((id) => id !== productId)
          : [...current, productId],
      );
      return nextSaved;
    },
    [ids, setIds],
  );

  const clear = React.useCallback(() => setIds([]), [setIds]);

  const value = React.useMemo<WishlistContextValue>(
    () => ({ ids, count: ids.length, hydrated, has, toggle, clear }),
    [ids, hydrated, has, toggle, clear],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const context = React.useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
  return context;
}
