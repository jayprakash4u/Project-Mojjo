import type { Order } from "@/types";
import { OrderItems } from "@/components/orders/order-items";
import { CartSummary } from "@/components/cart/cart-summary";

export function OrderSummary({ order }: { order: Order }) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
      <h2 className="text-base font-semibold text-foreground">Order summary</h2>

      <OrderItems items={order.items} />

      <CartSummary
        subtotal={order.subtotal}
        itemCount={itemCount}
        earnedCoins={order.earnedCoins}
        deliveryFee={order.deliveryFee}
        className="border-t border-border pt-4"
      />
    </section>
  );
}
