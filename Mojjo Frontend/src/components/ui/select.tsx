"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export interface SelectProps
  extends Omit<React.ComponentPropsWithoutRef<"select">, "onChange" | "size"> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  onValueChange?: (value: string) => void;
  containerClassName?: string;
}

export function Select({
  label,
  options,
  placeholder = "Select an option",
  error,
  helperText,
  value,
  onValueChange,
  className,
  containerClassName,
  id,
  ...props
}: SelectProps) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  return (
    <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          value={value ?? ""}
          onChange={(event) => onValueChange?.(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            "h-11 w-full appearance-none rounded-lg border bg-surface pl-3 pr-10 text-base text-foreground",
            "transition-[border-color,box-shadow] duration-200 ease-out",
            "focus-visible:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/35",
            "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-muted",
            error
              ? "border-error focus-visible:border-error focus-visible:ring-error/30"
              : "border-border hover:border-border-strong",
            className,
          )}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
      </div>

      {error ? (
        <p id={errorId} role="alert" className="text-sm text-error">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-sm text-muted">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
