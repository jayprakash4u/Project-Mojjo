"use client";

import { ProductImage } from "@/components/product/product-image";
import { CartSummary } from "@/components/cart/cart-summary";
import { useCart } from "@/components/cart/cart-context";
import { formatPrice } from "@/lib/format";

export function CheckoutSummary({ deliveryFee = 0 }: { deliveryFee?: number }) {
  const { items, itemCount, subtotal, earnedCoins } = useCart();

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
      <h2 className="text-base font-semibold text-foreground">Order summary</h2>

      <ul className="flex flex-col gap-3">
        {items.map(({ product, quantity }) => (
          <li key={product.id} className="flex items-center gap-3">
            <div className="relative shrink-0">
              <ProductImage
                src={product.image}
                alt=""
                sizes="48px"
                className="size-12 rounded-md"
              />
              <span
                className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-primary text-2xs font-bold text-on-primary"
                data-numeric
                aria-hidden="true"
              >
                {quantity}
              </span>
            </div>

            <p className="min-w-0 flex-1 truncate text-sm text-foreground">
              <span className="sr-only">{quantity} × </span>
              {product.title}
            </p>

            <span className="shrink-0 text-sm font-medium text-foreground" data-numeric>
              {formatPrice(product.price * quantity)}
            </span>
          </li>
        ))}
      </ul>

      <CartSummary
        subtotal={subtotal}
        itemCount={itemCount}
        earnedCoins={earnedCoins}
        deliveryFee={deliveryFee}
        className="border-t border-border pt-4"
      />
    </section>
  );
}
