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
  /**
   * "solid" is the filled control a card shows once the line exists — it takes
   * the Add button's place, so it has to carry the same visual weight.
   */
  variant?: "outline" | "solid";
  className?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  itemLabel,
  size = "md",
  variant = "outline",
  className,
}: QuantityStepperProps) {
  const suffix = itemLabel ? ` of ${itemLabel}` : "";
  const buttonSize = size === "sm" ? "size-8" : "size-10";
  const solid = variant === "solid";
  const buttonTone = solid
    ? "text-on-secondary hover:bg-on-secondary/15"
    : "text-muted hover:bg-surface-sunken hover:text-foreground";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border",
        solid
          ? "border-secondary bg-secondary text-on-secondary"
          : "border-border bg-surface",
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
          "grid place-items-center rounded-l-md transition-colors",
          buttonTone,
          "disabled:pointer-events-none disabled:opacity-40",
        )}
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>

      <span
        className={cn(
          "min-w-9 text-center text-sm font-semibold",
          solid ? "text-on-secondary" : "text-foreground",
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
          "grid place-items-center rounded-r-md transition-colors",
          buttonTone,
          "disabled:pointer-events-none disabled:opacity-40",
        )}
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
