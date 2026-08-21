"use client";

import * as React from "react";
import { Eye, EyeOff, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends Omit<React.ComponentPropsWithoutRef<"input">, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  inputSize?: "sm" | "md";
  /** Convenience over `onChange` — also drives the search field's clear button. */
  onValueChange?: (value: string) => void;
  /** Hide the visual label but keep it for assistive tech. */
  hideLabel?: boolean;
  ref?: React.Ref<HTMLInputElement>;
}

export function Input({
  label,
  error,
  helperText,
  startIcon,
  endIcon,
  inputSize = "md",
  className,
  containerClassName,
  id,
  type = "text",
  value,
  onChange,
  onValueChange,
  hideLabel = false,
  ref,
  ...props
}: InputProps & { containerClassName?: string }) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const [showPassword, setShowPassword] = React.useState(false);
  const [uncontrolledValue, setUncontrolledValue] = React.useState("");

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;

  const isPassword = type === "password";
  const isSearch = type === "search";
  const resolvedType = isPassword && showPassword ? "text" : type;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setUncontrolledValue(event.target.value);
    onChange?.(event);
    onValueChange?.(event.target.value);
  };

  const clear = () => {
    if (!isControlled) setUncontrolledValue("");
    onValueChange?.("");
  };

  const leading = startIcon ?? (isSearch ? <Search aria-hidden="true" /> : null);

  let trailing: React.ReactNode = endIcon ?? null;
  if (!trailing && isPassword) {
    trailing = (
      <button
        type="button"
        onClick={() => setShowPassword((shown) => !shown)}
        className="grid place-items-center rounded-sm text-muted transition-colors hover:text-foreground"
        aria-label={showPassword ? "Hide password" : "Show password"}
        aria-pressed={showPassword}
      >
        {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
      </button>
    );
  }
  if (!trailing && isSearch && String(currentValue ?? "").length > 0) {
    trailing = (
      <button
        type="button"
        onClick={clear}
        className="grid place-items-center rounded-full p-0.5 text-muted transition-colors hover:bg-surface-sunken hover:text-foreground"
        aria-label="Clear search"
      >
        <X aria-hidden="true" />
      </button>
    );
  }

  const describedBy = error ? errorId : helperText ? helperId : undefined;

  return (
    <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className={cn("text-sm font-medium text-foreground", hideLabel && "sr-only")}
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leading && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted [&_svg]:size-4">
            {leading}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          value={currentValue}
          onChange={handleChange}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "w-full rounded-lg border bg-surface text-foreground",
            "placeholder:text-subtle",
            "transition-[border-color,box-shadow] duration-200 ease-out",
            "focus-visible:border-secondary focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-secondary/35",
            "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-muted",
            inputSize === "sm" ? "h-9 text-sm" : "h-11 text-base",
            leading ? "pl-10" : "pl-3",
            trailing ? "pr-10" : "pr-3",
            error
              ? "border-error focus-visible:border-error focus-visible:ring-error/30"
              : "border-border hover:border-border-strong",
            className,
          )}
          {...props}
        />

        {trailing && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 [&_svg]:size-4">
            {trailing}
          </span>
        )}
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
