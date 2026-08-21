"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ParamValue = string | string[] | boolean | undefined;

/**
 * Reads and writes the URL query string. The URL is the single source of truth
 * for filters, sort and pagination — that keeps results shareable, restores on
 * back/forward, and lets the server render the correct page.
 */
export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParams = React.useCallback(
    (updates: Record<string, ParamValue>, options: { resetPage?: boolean } = {}) => {
      const { resetPage = true } = options;
      const next = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        const isEmpty =
          value === undefined ||
          value === "" ||
          value === false ||
          (Array.isArray(value) && value.length === 0);

        if (isEmpty) next.delete(key);
        else if (Array.isArray(value)) next.set(key, value.join(","));
        else next.set(key, String(value));
      }

      // Any filter change invalidates the current page number.
      if (resetPage) next.delete("page");

      const queryString = next.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const clearParams = React.useCallback(
    (keys: string[]) => {
      const next = new URLSearchParams(searchParams.toString());
      keys.forEach((key) => next.delete(key));
      next.delete("page");
      const queryString = next.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const getList = React.useCallback(
    (key: string) => {
      const raw = searchParams.get(key);
      return raw ? raw.split(",").filter(Boolean) : [];
    },
    [searchParams],
  );

  const toggleInList = React.useCallback(
    (key: string, value: string) => {
      const current = getList(key);
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      setParams({ [key]: next });
    },
    [getList, setParams],
  );

  return { searchParams, setParams, clearParams, getList, toggleInList };
}
