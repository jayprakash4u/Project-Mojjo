"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import type { ProductUnit } from "@/types";
import { formatPrice } from "@/lib/format";
import { unitSavingsPercent } from "@/lib/products";
import { cn } from "@/lib/utils";

export interface UnitSelectorProps {
  units: ProductUnit[];
  value: string;
  onChange: (unitId: string) => void;
  /** Names the control for assistive tech — the product this belongs to. */
  label: string;
  /**
   * "select" is the one-line control a card uses: it names the unit and its
   * price at once, and stays one line however many units a product gains.
   * "segmented" lays the choices side by side, for the roomier detail page.
   */
  layout?: "select" | "segmented";
  className?: string;
}

/** "Pack of 20 — NPR 470 (save 6%)" — everything needed to choose, in one line. */
function optionLabel(units: ProductUnit[], unit: ProductUnit): string {
  const saving = unitSavingsPercent(units, unit);
  return `${unit.label} — ${formatPrice(unit.price)}${saving ? ` (save ${saving}%)` : ""}`;
}

export function UnitSelector({
  units,
  value,
  onChange,
  label,
  layout = "select",
  className,
}: UnitSelectorProps) {
  const name = React.useId();

  // A native select rather than a hand-rolled listbox, matching ProductSort:
  // keyboard and screen-reader behaviour come free, and mobile opens the
  // platform picker instead of a cramped dropdown inside a 150px tile.
  if (layout === "select") {
    return (
      <div className={cn("relative", className)}>
        <select
          aria-label={`Buy ${label} by`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-full appearance-none truncate rounded-md border border-border bg-surface pl-2 pr-7 text-2xs font-medium text-foreground transition-colors hover:border-border-strong focus-visible:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/35"
        >
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {optionLabel(units, unit)}
            </option>
          ))}
        </select>

        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div role="radiogroup" aria-label={`Buy ${label} by`} className={cn("flex gap-2", className)}>
      {units.map((unit) => {
        const selected = unit.id === value;
        const saving = unitSavingsPercent(units, unit);

        return (
          <label
            key={unit.id}
            className={cn(
              "relative flex flex-1 cursor-pointer flex-col gap-0.5 rounded-lg border px-3 py-2 transition-colors duration-200",
              selected
                ? "border-secondary bg-secondary/10"
                : "border-border hover:border-border-strong",
              // The input is visually hidden, so focus has to be drawn here.
              "focus-within:ring-2 focus-within:ring-secondary/35",
            )}
          >
            <input
              type="radio"
              name={name}
              value={unit.id}
              checked={selected}
              onChange={() => onChange(unit.id)}
              className="sr-only"
            />

            <span
              className={cn(
                "text-xs font-medium",
                selected ? "text-secondary" : "text-muted",
              )}
            >
              {unit.label}
            </span>

            <span className="text-sm font-semibold text-foreground" data-numeric>
              {formatPrice(unit.price)}
            </span>

            {saving !== null && (
              <span className="text-2xs font-semibold text-success" data-numeric>
                Save {saving}%
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}
