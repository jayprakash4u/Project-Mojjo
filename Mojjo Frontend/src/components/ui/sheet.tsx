"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMounted, useOverlay } from "@/hooks/use-overlay";

type SheetSide = "left" | "right" | "top" | "bottom";

type SheetContextValue = { onClose: () => void; titleId: string };
const SheetContext = React.createContext<SheetContextValue | null>(null);

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: SheetSide;
  /** Accessible name for the panel; also rendered by `SheetTitle`. */
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

const sideClasses: Record<SheetSide, string> = {
  right: "inset-y-0 right-0 h-full w-full max-w-md border-l animate-slide-in-right",
  left: "inset-y-0 left-0 h-full w-full max-w-md border-r animate-slide-in-left",
  top: "inset-x-0 top-0 max-h-[85dvh] border-b animate-slide-up",
  bottom: "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-2xl border-t animate-slide-up",
};

export function Sheet({
  open,
  onOpenChange,
  side = "right",
  title,
  description,
  className,
  children,
}: SheetProps) {
  const mounted = useMounted();
  const close = React.useCallback(() => onOpenChange(false), [onOpenChange]);
  const panelRef = useOverlay(open, close);
  const titleId = React.useId();
  const descriptionId = `${titleId}-description`;

  const context = React.useMemo(() => ({ onClose: close, titleId }), [close, titleId]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-primary/45 backdrop-blur-[2px] animate-fade-in"
        onClick={close}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        // `aria-labelledby` wins when a SheetTitle is rendered; `title` is the
        // fallback name for panels that don't render one.
        aria-label={title}
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "absolute flex flex-col border-border bg-surface shadow-xl focus:outline-none",
          sideClasses[side],
          className,
        )}
      >
        {description && (
          <p id={descriptionId} className="sr-only">
            {description}
          </p>
        )}
        <SheetContext.Provider value={context}>{children}</SheetContext.Provider>
      </div>
    </div>,
    document.body,
  );
}

function useSheet(): SheetContextValue {
  const context = React.useContext(SheetContext);
  if (!context) throw new Error("Sheet subcomponents must be rendered inside a <Sheet>");
  return context;
}

export function SheetHeader({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { onClose } = useSheet();

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-4",
        className,
      )}
      {...props}
    >
      {children}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="grid size-9 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-surface-sunken hover:text-foreground"
      >
        <X className="size-4.5" aria-hidden="true" />
      </button>
    </div>
  );
}

export function SheetTitle({ className, ...props }: React.ComponentPropsWithoutRef<"h2">) {
  const { titleId } = useSheet();
  return (
    <h2
      id={titleId}
      className={cn("text-lg font-semibold tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

export function SheetBody({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("flex-1 overflow-y-auto overscroll-contain p-5", className)} {...props} />;
}

export function SheetFooter({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("shrink-0 border-t border-border bg-surface p-5", className)}
      {...props}
    />
  );
}
