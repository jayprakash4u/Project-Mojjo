"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CircleCheckBig, Truck } from "lucide-react";
import { OrderItems } from "@/components/orders/order-items";
import { CartSummary } from "@/components/cart/cart-summary";
import { MojjoCoin } from "@/components/rewards/mojjo-coin";
import { EmptyState } from "@/components/common/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { getPlacedOrder } from "@/lib/orders";
import { getMockOrder } from "@/data/mock/orders";
import { formatDateTime } from "@/lib/format";
import { DELIVERY_METHODS } from "@/lib/orders";

export function OrderSuccess() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";

  // Orders placed this session win; the mock catalogue backs deep links.
  const order = getPlacedOrder(orderId) ?? getMockOrder(orderId);

  if (!order) {
    return (
      <EmptyState
        icon={Truck}
        title="We couldn't find that order"
        description="The confirmation link may have expired. Your orders are listed in your account."
        action={
          <Link href="/account/orders" className={buttonVariants({ variant: "outline" })}>
            View my orders
          </Link>
        }
      />
    );
  }

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const delivery = DELIVERY_METHODS.find((method) => method.value === order.deliveryMethod);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
      <header className="flex flex-col items-center gap-4 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-success-soft text-success">
          <CircleCheckBig className="size-8" aria-hidden="true" />
        </span>

        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Order confirmed
          </h1>
          <p className="text-sm text-muted">
            Order <span className="font-medium text-foreground">{order.id}</span> is with the store
            now.
          </p>
        </div>

        {order.estimatedArrival && (
          <p className="rounded-full bg-secondary-soft px-4 py-2 text-sm font-medium text-secondary">
            Arriving by {formatDateTime(order.estimatedArrival)}
            {delivery && ` · ${delivery.label}`}
          </p>
        )}

        {order.earnedCoins > 0 && (
          <p className="flex items-center gap-1.5 text-sm text-muted">
            You earned <MojjoCoin amount={order.earnedCoins} size="md" /> on this order.
          </p>
        )}
      </header>

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-base font-semibold text-foreground">What&apos;s coming</h2>
        <OrderItems items={order.items} />
        <CartSummary
          subtotal={order.subtotal}
          itemCount={itemCount}
          earnedCoins={0}
          deliveryFee={order.deliveryFee}
          className="border-t border-border pt-4"
        />
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/orders/${order.id}`}
          className={buttonVariants({ size: "lg", full: true })}
        >
          <Truck aria-hidden="true" />
          Track this order
        </Link>
        <Link
          href="/products"
          className={buttonVariants({ variant: "outline", size: "lg", full: true })}
        >
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
