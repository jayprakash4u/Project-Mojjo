"use client";

import { Zap } from "lucide-react";
import { useLocation } from "@/components/delivery/location-context";
import { cn } from "@/lib/utils";

export interface EtaBadgeProps {
  /** Overrides the area-derived estimate. */
  minutes?: number;
  size?: "sm" | "md";
  className?: string;
}

/**
 * The delivery promise, repeated at every decision point. Speed is the reason
 * people open a quick-commerce app, so it belongs on the card, not just the
 * checkout page — and it reflects the area chosen in the location bar.
 */
export function EtaBadge({ minutes, size = "sm", className }: EtaBadgeProps) {
  const { etaMinutes } = useLocation();
  const value = minutes ?? etaMinutes;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-success-soft font-semibold text-success",
        size === "sm" ? "px-1.5 py-0.5 text-2xs" : "px-2.5 py-1 text-xs",
        className,
      )}
    >
      <Zap
        className={cn("shrink-0 fill-current", size === "sm" ? "size-3" : "size-3.5")}
        aria-hidden="true"
      />
      <span data-numeric>{value} min</span>
      <span className="sr-only">estimated delivery time</span>
    </span>
  );
}
