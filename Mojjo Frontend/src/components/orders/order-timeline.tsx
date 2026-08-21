import { CircleCheckBig, CircleX, House, Package, Truck } from "lucide-react";
import type { OrderStatus } from "@/types";
import { ORDER_STATUS_LABELS, ORDER_TIMELINE, orderProgress } from "@/lib/orders";
import { cn } from "@/lib/utils";

const stepIcons: Record<string, React.ElementType> = {
  confirmed: CircleCheckBig,
  preparing: Package,
  out_for_delivery: Truck,
  delivered: House,
};

/**
 * One markup tree for both breakpoints — a flex row that becomes a vertical
 * column below `sm`. The previous version rendered the whole timeline twice.
 */
export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-error/25 bg-error-soft p-5">
        <CircleX className="size-6 shrink-0 text-error" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-foreground">Order cancelled</p>
          <p className="mt-0.5 text-xs text-muted">
            Any payment taken will be refunded within 3 working days.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = orderProgress(status);

  return (
    <ol className="flex flex-col gap-0 sm:flex-row sm:gap-2">
      {ORDER_TIMELINE.map((step, index) => {
        const done = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const Icon = stepIcons[step];
        const isLast = index === ORDER_TIMELINE.length - 1;

        return (
          <li
            key={step}
            className="flex flex-1 gap-4 sm:flex-col sm:items-center sm:gap-2 sm:text-center"
            aria-current={isCurrent ? "step" : undefined}
          >
            {/* Marker column: icon plus the connector to the next step. */}
            <div className="flex flex-col items-center sm:w-full sm:flex-row">
              <span
                aria-hidden="true"
                className={cn(
                  "hidden h-0.5 flex-1 sm:block",
                  index === 0 ? "invisible" : index <= currentIndex ? "bg-secondary" : "bg-border",
                )}
              />

              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-full transition-colors",
                  done ? "bg-secondary text-on-secondary" : "bg-surface-sunken text-subtle",
                  isCurrent && "ring-4 ring-secondary/20",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>

              <span
                aria-hidden="true"
                className={cn(
                  "hidden h-0.5 flex-1 sm:block",
                  isLast ? "invisible" : index < currentIndex ? "bg-secondary" : "bg-border",
                )}
              />

              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-8 w-0.5 sm:hidden",
                    index < currentIndex ? "bg-secondary" : "bg-border",
                  )}
                />
              )}
            </div>

            <span
              className={cn(
                "pb-8 text-sm font-medium sm:pb-0 sm:text-xs",
                isCurrent ? "text-secondary" : done ? "text-foreground" : "text-subtle",
              )}
            >
              {ORDER_STATUS_LABELS[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
