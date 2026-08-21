import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AccountPageHeading } from "@/components/account/page-heading";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { ReorderButton } from "@/components/orders/reorder-button";
import { mockOrders } from "@/data/mock/orders";
import { formatDate, formatPrice, pluralize } from "@/lib/format";

export const metadata: Metadata = {
  title: "My orders",
  robots: { index: false, follow: false },
};

export default function AccountOrdersPage() {
  return (
    <div>
      <AccountPageHeading
        title="My orders"
        description="Everything you have ordered, newest first."
      />

      <ul className="flex flex-col gap-4">
        {mockOrders.map((order) => {
          const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
          const preview = order.items.map((item) => item.title).join(", ");

          return (
            <li
              key={order.id}
              className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-foreground">{order.id}</h2>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <time dateTime={order.createdAt} className="mt-1 block text-xs text-muted">
                    {formatDate(order.createdAt)}
                  </time>
                </div>

                <span className="text-sm font-semibold text-foreground" data-numeric>
                  {formatPrice(order.total)}
                </span>
              </div>

              <p className="line-clamp-2 text-sm text-muted">
                <span data-numeric>{pluralize(itemCount, "item")}</span> · {preview}
              </p>

              <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
                <Link
                  href={`/orders/${order.id}`}
                  className="group inline-flex items-center gap-1.5 text-sm font-medium text-secondary underline-offset-4 hover:underline"
                >
                  {order.status === "delivered" || order.status === "cancelled"
                    ? "View order"
                    : "Track order"}
                  <ArrowRight
                    className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>

                <ReorderButton items={order.items} variant="outline" size="sm" />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
