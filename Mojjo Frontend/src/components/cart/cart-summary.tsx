import { MojjoCoin } from "@/components/rewards/mojjo-coin";
import { formatPrice, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
  earnedCoins: number;
  deliveryFee?: number;
  /** Shown when the fee is still unknown (before a delivery method is picked). */
  deliveryNote?: string;
  className?: string;
}

/** The money block. Used by both the cart drawer and the checkout column. */
export function CartSummary({
  subtotal,
  itemCount,
  earnedCoins,
  deliveryFee,
  deliveryNote = "Calculated at checkout",
  className,
}: CartSummaryProps) {
  const total = subtotal + (deliveryFee ?? 0);

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">Subtotal ({pluralize(itemCount, "item")})</span>
        <span className="font-medium text-foreground" data-numeric>
          {formatPrice(subtotal)}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">Delivery</span>
        <span className={cn("font-medium", deliveryFee === 0 ? "text-success" : "text-foreground")} data-numeric>
          {deliveryFee === undefined
            ? deliveryNote
            : deliveryFee === 0
              ? "Free"
              : formatPrice(deliveryFee)}
        </span>
      </div>

      <div className="mt-1 flex items-baseline justify-between border-t border-border pt-3">
        <span className="text-sm font-semibold text-foreground">Total</span>
        <span className="text-lg font-semibold text-foreground" data-numeric>
          {formatPrice(total)}
        </span>
      </div>

      {earnedCoins > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-muted">
          You&apos;ll earn <MojjoCoin amount={earnedCoins} size="sm" />
        </p>
      )}
    </div>
  );
}
