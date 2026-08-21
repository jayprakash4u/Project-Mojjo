"use client";

import * as React from "react";

const emptySubscribe = () => () => {};

/**
 * `false` during SSR and the hydrating render, `true` afterwards.
 *
 * `useSyncExternalStore` with differing server and client snapshots is the
 * sanctioned way to express this — a `useState` + `useEffect(setTrue)` pair
 * does the same thing but trips React 19's set-state-in-effect rule.
 *
 * Callers use it to gate portals and to hold back UI that would otherwise
 * flash a pre-hydration value (cart count, wishlist count).
 */
export function useHydrated(): boolean {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
