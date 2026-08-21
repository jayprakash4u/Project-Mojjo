"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.ComponentPropsWithoutRef<"textarea"> {
  label?: string;
  error?: string;
  helperText?: string;
  ref?: React.Ref<HTMLTextAreaElement>;
}

export function Textarea({
  label,
  error,
  helperText,
  className,
  id,
  ref,
  ...props
}: TextareaProps) {
  const generatedId = React.useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;
  const helperId = `${textareaId}-helper`;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={cn(
          "min-h-24 w-full resize-y rounded-lg border bg-surface px-3 py-2.5 text-base text-foreground",
          "placeholder:text-subtle",
          "transition-[border-color,box-shadow] duration-200 ease-out",
          "focus-visible:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/35",
          "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-muted",
          error
            ? "border-error focus-visible:border-error focus-visible:ring-error/30"
            : "border-border hover:border-border-strong",
          className,
        )}
        {...props}
      />

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
