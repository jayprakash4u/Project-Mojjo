"use client";

import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { OrderTracker } from "@/components/orders/order-tracker";
import { EmptyState } from "@/components/common/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/hooks/use-hydrated";
import { getPlacedOrder } from "@/lib/orders";
import { getMockOrder } from "@/data/mock/orders";

/**
 * Resolves an order from this session first, then the mock history.
 * sessionStorage is only readable on the client, so the lookup is gated on
 * hydration rather than run from an effect.
 */
export function OrderView({ orderId }: { orderId: string }) {
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-8">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-36 rounded-xl" />
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  const order = getPlacedOrder(orderId) ?? getMockOrder(orderId);

  if (!order) {
    return (
      <EmptyState
        icon={PackageSearch}
        title={`No order found with the reference ${orderId}`}
        description="Check the reference, or pick the order from your account."
        action={
          <Link href="/account/orders" className={buttonVariants({ variant: "outline" })}>
            View my orders
          </Link>
        }
      />
    );
  }

  return <OrderTracker order={order} />;
}
