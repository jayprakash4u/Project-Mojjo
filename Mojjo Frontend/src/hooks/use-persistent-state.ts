"use client";

import * as React from "react";
import { useHydrated } from "@/hooks/use-hydrated";

/**
 * State mirrored into localStorage, modelled as an external store rather than
 * `useState` + a hydration effect.
 *
 * Three things fall out of that: the server snapshot is always the initial
 * value (so markup matches and hydration is clean), every hook instance for a
 * key stays in sync, and changes in another tab propagate via `storage`.
 */

type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();
/** Parsed values, keyed by storage key. `useSyncExternalStore` needs a stable
 *  reference between renders or it re-renders forever. */
const cache = new Map<string, unknown>();

function subscribe(key: string, listener: Listener): () => void {
  let keyListeners = listeners.get(key);
  if (!keyListeners) {
    keyListeners = new Set();
    listeners.set(key, keyListeners);
  }
  keyListeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== key) return;
    cache.delete(key);
    listener();
  };
  window.addEventListener("storage", handleStorage);

  return () => {
    keyListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function emit(key: string): void {
  listeners.get(key)?.forEach((listener) => listener());
}

function read<T>(key: string, fallback: T): T {
  if (cache.has(key)) return cache.get(key) as T;

  let value = fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw !== null) value = JSON.parse(raw) as T;
  } catch {
    // Corrupt JSON or storage blocked (private mode, quota). Fall back to the
    // in-memory value rather than breaking the page.
  }

  cache.set(key, value);
  return value;
}

function write<T>(key: string, value: T): void {
  cache.set(key, value);
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota errors; the session still works without persistence.
  }
  emit(key);
}

export function usePersistentState<T>(
  key: string,
  initialValue: T,
): [T, (update: React.SetStateAction<T>) => void, boolean] {
  const subscribeToKey = React.useCallback(
    (listener: Listener) => subscribe(key, listener),
    [key],
  );

  const getSnapshot = React.useCallback(
    () => read(key, initialValue),
    // `initialValue` is only consulted when nothing is stored; treating it as
    // stable avoids resubscribing on every render for inline defaults like [].
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  // On the server, and for the first client render, always the initial value.
  const getServerSnapshot = React.useCallback(() => initialValue, [initialValue]);

  const value = React.useSyncExternalStore(subscribeToKey, getSnapshot, getServerSnapshot);

  const setValue = React.useCallback(
    (update: React.SetStateAction<T>) => {
      const current = read(key, initialValue);
      const next =
        typeof update === "function" ? (update as (previous: T) => T)(current) : update;
      write(key, next);
    },
    // Same reasoning as `getSnapshot`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  const hydrated = useHydrated();

  return [value, setValue, hydrated];
}

