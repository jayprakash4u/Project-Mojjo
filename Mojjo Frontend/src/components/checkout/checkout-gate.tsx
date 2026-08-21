"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { EmptyState } from "@/components/common/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-context";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Guards the form against an empty cart. The cart lives in localStorage, so
 * this waits for hydration rather than flashing "your cart is empty" first.
 */
export function CheckoutGate() {
  const { itemCount, hydrated } = useCart();

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        <div className="flex flex-1 flex-col gap-5">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-xl lg:w-96" />
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="There is nothing to check out"
        description="Add something to your cart and it will show up here."
        action={
          <Link href="/products" className={buttonVariants({ variant: "outline" })}>
            Browse products
          </Link>
        }
      />
    );
  }

  return <CheckoutForm />;
}
