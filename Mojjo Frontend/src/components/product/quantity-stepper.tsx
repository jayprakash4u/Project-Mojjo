"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Used in the accessible labels, e.g. "Increase quantity of Dark Rum". */
  itemLabel?: string;
  size?: "sm" | "md";
  className?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  itemLabel,
  size = "md",
  className,
}: QuantityStepperProps) {
  const suffix = itemLabel ? ` of ${itemLabel}` : "";
  const buttonSize = size === "sm" ? "size-8" : "size-10";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-surface",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease quantity${suffix}`}
        className={cn(
          buttonSize,
          "grid place-items-center rounded-l-md text-muted transition-colors",
          "hover:bg-surface-sunken hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
        )}
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>

      <span
        className={cn(
          "min-w-9 text-center text-sm font-medium text-foreground",
          size === "sm" && "min-w-8",
        )}
        aria-live="polite"
        data-numeric
      >
        {value}
      </span>

      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase quantity${suffix}`}
        className={cn(
          buttonSize,
          "grid place-items-center rounded-r-md text-muted transition-colors",
          "hover:bg-surface-sunken hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
        )}
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
