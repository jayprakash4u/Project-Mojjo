"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { TriangleAlert, CircleCheckBig, Info, X, CircleX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-overlay";

export type ToastVariant = "default" | "success" | "error" | "warning";

export type ToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Milliseconds before auto-dismiss. `0` keeps it until dismissed. */
  duration?: number;
  action?: { label: string; onClick: () => void };
};

type ToastRecord = ToastOptions & { id: string };

type ToastContextValue = {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

const MAX_VISIBLE = 3;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastRecord[]>([]);
  const timers = React.useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = React.useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = React.useCallback(
    ({ duration = 4000, ...options }: ToastOptions) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { ...options, duration, id }].slice(-MAX_VISIBLE));

      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }
      return id;
    },
    [dismiss],
  );

  // Clear pending timers if the provider unmounts mid-flight.
  React.useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  const value = React.useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

const variantConfig: Record<
  ToastVariant,
  { icon: React.ElementType; iconClass: string; role: "status" | "alert" }
> = {
  default: { icon: Info, iconClass: "text-secondary", role: "status" },
  success: { icon: CircleCheckBig, iconClass: "text-success", role: "status" },
  error: { icon: CircleX, iconClass: "text-error", role: "alert" },
  warning: { icon: TriangleAlert, iconClass: "text-warning", role: "alert" },
};

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastRecord[];
  onDismiss: (id: string) => void;
}) {
  const mounted = useMounted();
  if (!mounted) return null;

  return createPortal(
    <div
      // Polite live region: additions are announced without stealing focus.
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-60 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
    >
      {toasts.map((item) => {
        const { icon: Icon, iconClass, role } = variantConfig[item.variant ?? "default"];
        return (
          <div
            key={item.id}
            role={role}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-border",
              "bg-surface-raised p-4 shadow-lg animate-toast-in",
            )}
          >
            <Icon className={cn("mt-0.5 size-5 shrink-0", iconClass)} aria-hidden="true" />

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              {item.description && <p className="text-xs text-muted">{item.description}</p>}
              {item.action && (
                <button
                  type="button"
                  onClick={() => {
                    item.action?.onClick();
                    onDismiss(item.id);
                  }}
                  className="mt-1.5 self-start text-xs font-semibold text-secondary underline-offset-4 hover:underline"
                >
                  {item.action.label}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => onDismiss(item.id)}
              aria-label="Dismiss notification"
              className="-m-1 grid size-7 shrink-0 place-items-center rounded-md text-subtle transition-colors hover:bg-surface-sunken hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}
