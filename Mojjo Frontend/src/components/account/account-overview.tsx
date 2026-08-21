import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { CoinBalance } from "@/components/rewards/coin-balance";
import { mockOrders } from "@/data/mock/orders";
import { coinBalance } from "@/data/mock/rewards";
import { currentUser } from "@/data/mock/user";
import { formatDate, formatPrice, pluralize } from "@/lib/format";

export function AccountOverview() {
  const recent = mockOrders.slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Hello, {currentUser.firstName}
        </h1>
        <p className="text-sm text-muted">
          Member since {formatDate(currentUser.memberSince)}
        </p>
      </header>

      <CoinBalance balance={coinBalance} showLink />

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Recent orders</h2>
          <Link
            href="/account/orders"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-secondary underline-offset-4 hover:underline"
          >
            View all
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        <ul className="flex flex-col gap-3">
          {recent.map((order) => {
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            return (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-strong"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{order.id}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted" data-numeric>
                      {pluralize(itemCount, "item")} · {formatPrice(order.total)}
                    </p>
                    <time dateTime={order.createdAt} className="mt-0.5 block text-xs text-subtle">
                      {formatDate(order.createdAt)}
                    </time>
                  </div>

                  <ArrowRight className="size-4 shrink-0 text-subtle" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
