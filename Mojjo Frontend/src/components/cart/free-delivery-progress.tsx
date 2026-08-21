import { PartyPopper, Truck } from "lucide-react";
import { FREE_DELIVERY_THRESHOLD, amountToFreeDelivery } from "@/config/delivery";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * "You're NPR 300 away from free delivery" — the single most effective nudge
 * in a quick-commerce cart, and it doubles as an explanation of the fee.
 */
export function FreeDeliveryProgress({
  subtotal,
  className,
}: {
  subtotal: number;
  className?: string;
}) {
  const remaining = amountToFreeDelivery(subtotal);
  const unlocked = remaining === 0;
  const percentage = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border px-4 py-3",
        unlocked ? "border-success/30 bg-success-soft" : "border-border bg-surface-sunken",
        className,
      )}
    >
      <p className="flex items-center gap-2 text-xs font-medium leading-relaxed">
        {unlocked ? (
          <>
            <PartyPopper className="size-4 shrink-0 text-success" aria-hidden="true" />
            <span className="text-success">Delivery is on us for this order.</span>
          </>
        ) : (
          <>
            <Truck className="size-4 shrink-0 text-muted" aria-hidden="true" />
            <span className="text-foreground">
              Add <span data-numeric>{formatPrice(remaining)}</span> more for free delivery.
            </span>
          </>
        )}
      </p>

      <div
        role="progressbar"
        aria-valuenow={Math.min(subtotal, FREE_DELIVERY_THRESHOLD)}
        aria-valuemin={0}
        aria-valuemax={FREE_DELIVERY_THRESHOLD}
        aria-label="Progress towards free delivery"
        className="h-1.5 w-full overflow-hidden rounded-full bg-border"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            unlocked ? "bg-success" : "bg-secondary",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
