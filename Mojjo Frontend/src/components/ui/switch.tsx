"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  label,
  description,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  className,
}: SwitchProps) {
  const id = React.useId();
  const [uncontrolled, setUncontrolled] = React.useState(defaultChecked);
  const isControlled = checked !== undefined;
  const isOn = isControlled ? checked : uncontrolled;

  const toggle = () => {
    const next = !isOn;
    if (!isControlled) setUncontrolled(next);
    onCheckedChange?.(next);
  };

  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      {label && (
        <span className="flex flex-col gap-0.5">
          <label
            htmlFor={id}
            className={cn(
              "cursor-pointer select-none text-sm font-medium text-foreground",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            {label}
          </label>
          {description && <span className="text-xs text-muted">{description}</span>}
        </span>
      )}

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={isOn}
        disabled={disabled}
        onClick={toggle}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
          "transition-colors duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          isOn ? "bg-secondary" : "bg-border-strong",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block size-4 rounded-full bg-white shadow-xs",
            "transition-transform duration-200 ease-out",
            isOn ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
}
