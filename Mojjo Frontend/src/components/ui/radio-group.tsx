"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type RadioGroupContextValue = {
  name: string;
  value?: string;
  onValueChange?: (value: string) => void;
};

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

function useRadioGroup(): RadioGroupContextValue {
  const context = React.useContext(RadioGroupContext);
  if (!context) throw new Error("RadioItem must be rendered inside a RadioGroup");
  return context;
}

export interface RadioGroupProps extends Omit<React.ComponentPropsWithoutRef<"div">, "onChange"> {
  label?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}

export function RadioGroup({
  label,
  value,
  onValueChange,
  name,
  className,
  children,
  ...props
}: RadioGroupProps) {
  const generatedName = React.useId();
  const contextValue = React.useMemo(
    () => ({ name: name ?? generatedName, value, onValueChange }),
    [name, generatedName, value, onValueChange],
  );

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("flex flex-col gap-2.5", className)}
      {...props}
    >
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
      <RadioGroupContext.Provider value={contextValue}>{children}</RadioGroupContext.Provider>
    </div>
  );
}

export interface RadioItemProps {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  /** Right-aligned slot — price, delivery estimate, etc. */
  meta?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  /** Renders the option as a selectable card rather than a bare radio row. */
  variant?: "row" | "card";
}

export function RadioItem({
  value,
  label,
  description,
  meta,
  disabled,
  className,
  variant = "row",
}: RadioItemProps) {
  const { name, value: selected, onValueChange } = useRadioGroup();
  const isSelected = selected === value;

  return (
    <label
      className={cn(
        "flex cursor-pointer select-none items-start gap-3",
        variant === "card" && [
          "rounded-lg border p-4 transition-[border-color,background-color] duration-200 ease-out",
          isSelected
            ? "border-secondary bg-secondary-soft"
            : "border-border bg-surface hover:border-border-strong",
        ],
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <span className="relative mt-0.5 grid size-4.5 shrink-0 place-items-center">
        <input
          type="radio"
          name={name}
          value={value}
          checked={isSelected}
          disabled={disabled}
          onChange={() => onValueChange?.(value)}
          className={cn(
            "peer size-4.5 cursor-pointer appearance-none rounded-full border border-border-strong bg-surface",
            "transition-[border-color,border-width] duration-150 ease-out",
            "hover:border-secondary checked:border-[5px] checked:border-secondary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
            "disabled:cursor-not-allowed",
          )}
        />
      </span>

      <span className="flex flex-1 flex-col gap-0.5">
        <span className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {meta && <span className="text-sm text-muted">{meta}</span>}
        </span>
        {description && <span className="text-xs text-muted">{description}</span>}
      </span>
    </label>
  );
}
