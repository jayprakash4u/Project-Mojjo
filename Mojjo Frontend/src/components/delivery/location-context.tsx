"use client";

import * as React from "react";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { getArea, type DeliveryArea } from "@/data/mock/areas";
import { DELIVERY_ETA_MINUTES } from "@/config/delivery";

const STORAGE_KEY = "mojjo.area.v1";

type LocationContextValue = {
  area: DeliveryArea | null;
  /** The area's ETA, or the default promise when no area is chosen yet. */
  etaMinutes: number;
  hydrated: boolean;
  setAreaId: (id: string) => void;
  clearArea: () => void;
};

const LocationContext = React.createContext<LocationContextValue | null>(null);

/**
 * The chosen delivery area. It drives the ETA shown across the storefront, so
 * it lives in context rather than in the header component that sets it.
 */
export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [areaId, setStoredAreaId, hydrated] = usePersistentState<string | null>(
    STORAGE_KEY,
    null,
  );

  const area = areaId ? (getArea(areaId) ?? null) : null;

  const setAreaId = React.useCallback(
    (id: string) => setStoredAreaId(id),
    [setStoredAreaId],
  );
  const clearArea = React.useCallback(() => setStoredAreaId(null), [setStoredAreaId]);

  const value = React.useMemo<LocationContextValue>(
    () => ({
      area,
      etaMinutes: area?.etaMinutes ?? DELIVERY_ETA_MINUTES,
      hydrated,
      setAreaId,
      clearArea,
    }),
    [area, hydrated, setAreaId, clearArea],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation(): LocationContextValue {
  const context = React.useContext(LocationContext);
  if (!context) throw new Error("useLocation must be used within a LocationProvider");
  return context;
}
