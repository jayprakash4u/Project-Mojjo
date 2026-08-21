"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMounted, useOverlay } from "@/hooks/use-overlay";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Hide the title visually while keeping it as the accessible name. */
  hideTitle?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-3xl",
} as const;

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  hideTitle = false,
  size = "md",
  className,
  children,
  footer,
}: DialogProps) {
  const mounted = useMounted();
  const close = React.useCallback(() => onOpenChange(false), [onOpenChange]);
  const panelRef = useOverlay(open, close);
  const titleId = React.useId();
  const descriptionId = `${titleId}-description`;

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-primary/45 backdrop-blur-[2px] animate-fade-in"
        onClick={close}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-surface shadow-xl focus:outline-none",
          "animate-slide-up sm:animate-scale-in sm:rounded-xl",
          sizeClasses[size],
          className,
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
          <div className={cn("flex flex-col gap-1", hideTitle && "sr-only")}>
            <h2 id={titleId} className="text-xl font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="text-sm text-muted">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={close}
            aria-label="Close dialog"
            className="-mr-1 grid size-9 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-surface-sunken hover:text-foreground"
          >
            <X className="size-4.5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">{children}</div>

        {footer && (
          <div className="shrink-0 border-t border-border px-5 py-4 sm:px-6">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  );
}
