"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<"input">, "type" | "size"> {
  label?: React.ReactNode;
  /** Secondary text shown to the right of the label (e.g. a result count). */
  hint?: React.ReactNode;
  onCheckedChange?: (checked: boolean) => void;
  ref?: React.Ref<HTMLInputElement>;
}

export function Checkbox({
  label,
  hint,
  className,
  id,
  onChange,
  onCheckedChange,
  disabled,
  ref,
  ...props
}: CheckboxProps) {
  const generatedId = React.useId();
  const checkboxId = id ?? generatedId;

  return (
    <div className={cn("flex items-center gap-2.5", disabled && "opacity-50", className)}>
      <span className="relative grid size-4.5 shrink-0 place-items-center">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          disabled={disabled}
          onChange={(event) => {
            onChange?.(event);
            onCheckedChange?.(event.target.checked);
          }}
          className={cn(
            "peer size-4.5 cursor-pointer appearance-none rounded-[5px] border border-border-strong bg-surface",
            "transition-[background-color,border-color] duration-150 ease-out",
            "hover:border-secondary",
            "checked:border-secondary checked:bg-secondary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
            "disabled:cursor-not-allowed",
          )}
          {...props}
        />
        <Check
          className="pointer-events-none absolute size-3 stroke-3 text-on-secondary opacity-0 transition-opacity duration-150 peer-checked:opacity-100"
          aria-hidden="true"
        />
      </span>

      {label && (
        <label
          htmlFor={checkboxId}
          className={cn(
            "flex flex-1 cursor-pointer select-none items-center justify-between gap-2 text-sm text-foreground",
            disabled && "cursor-not-allowed",
          )}
        >
          <span>{label}</span>
          {hint && <span className="text-xs text-subtle">{hint}</span>}
        </label>
      )}
    </div>
  );
}
