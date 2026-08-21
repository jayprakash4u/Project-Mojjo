"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Sheet, SheetBody, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { FreeDeliveryProgress } from "@/components/cart/free-delivery-progress";
import { EmptyState } from "@/components/common/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-context";
import { pluralize } from "@/lib/format";
import { standardDeliveryFee } from "@/config/delivery";
import { cn } from "@/lib/utils";

/**
 * Opened from the cart context rather than a `document.dispatchEvent` custom
 * event, so the relationship between the navbar button and this panel is typed.
 */
export function CartSheet() {
  const { items, itemCount, subtotal, earnedCoins, isOpen, closeCart } = useCart();

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeCart();
      }}
      side="right"
      title="Your cart"
      description="Items you have added, ready for checkout"
    >
      <SheetHeader>
        <SheetTitle>
          Your cart
          {itemCount > 0 && (
            <span className="ml-2 text-sm font-normal text-muted" data-numeric>
              {pluralize(itemCount, "item")}
            </span>
          )}
        </SheetTitle>
      </SheetHeader>

      <SheetBody className={cn(items.length === 0 && "grid place-items-center")}>
        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Add drinks, snacks or mixers and they will show up here."
            className="border-0"
            action={
              <Button variant="outline" onClick={closeCart}>
                Keep browsing
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <CartItem key={item.product.id} item={item} compact />
            ))}
          </ul>
        )}
      </SheetBody>

      {items.length > 0 && (
        <SheetFooter className="flex flex-col gap-4">
          <FreeDeliveryProgress subtotal={subtotal} />
          <CartSummary
            subtotal={subtotal}
            itemCount={itemCount}
            earnedCoins={earnedCoins}
            deliveryFee={standardDeliveryFee(subtotal)}
          />
          <Link
            href="/checkout"
            onClick={closeCart}
            className={cn(buttonVariants({ size: "lg", full: true }))}
          >
            Checkout
          </Link>
        </SheetFooter>
      )}
    </Sheet>
  );
}
