import Link from "next/link";
import type { Order } from "@/types";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { OrderSummary } from "@/components/orders/order-summary";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { ReorderButton } from "@/components/orders/reorder-button";
import { buttonVariants } from "@/components/ui/button";
import { DELIVERY_METHODS, PAYMENT_METHODS } from "@/lib/orders";
import { formatDateTime } from "@/lib/format";

function DetailBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 border-t border-border pt-5 first:border-t-0 first:pt-0">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export function OrderTracker({ order }: { order: Order }) {
  const delivery = DELIVERY_METHODS.find((method) => method.value === order.deliveryMethod);
  const payment = PAYMENT_METHODS.find((method) => method.value === order.paymentMethod);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Order {order.id}
          </h1>
          <time dateTime={order.createdAt} className="text-sm text-muted">
            Placed {formatDateTime(order.createdAt)}
          </time>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      <div className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <OrderTimeline status={order.status} />

        {order.estimatedArrival && order.status !== "delivered" && order.status !== "cancelled" && (
          <p className="mt-5 border-t border-border pt-4 text-sm text-muted">
            Estimated arrival{" "}
            <time dateTime={order.estimatedArrival} className="font-medium text-foreground">
              {formatDateTime(order.estimatedArrival)}
            </time>
          </p>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="flex flex-col gap-5">
          <DetailBlock title="Delivery address">
            <address className="flex flex-col gap-0.5 text-sm not-italic">
              <span className="font-medium text-foreground">{order.address.fullName}</span>
              <a href={`tel:${order.address.phone}`} className="text-muted hover:text-secondary">
                {order.address.phone}
              </a>
              <span className="text-muted">{order.address.address}</span>
              {order.address.landmark && (
                <span className="text-muted">{order.address.landmark}</span>
              )}
            </address>
          </DetailBlock>

          <DetailBlock title="Delivery method">
            <p className="text-sm text-muted">
              {delivery?.label ?? order.deliveryMethod}
              {delivery && ` · ${delivery.eta}`}
            </p>
          </DetailBlock>

          <DetailBlock title="Payment">
            <p className="text-sm text-muted">{payment?.label ?? order.paymentMethod}</p>
          </DetailBlock>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-32 lg:self-start">
          <OrderSummary order={order} />

          <div className="flex flex-col gap-2 sm:flex-row">
            <ReorderButton items={order.items} size="md" full />
            <Link
              href="/products"
              className={buttonVariants({ variant: "outline", size: "md", full: true })}
            >
              Keep shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
