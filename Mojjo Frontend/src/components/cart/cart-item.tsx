"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import type { CartItem as CartItemType } from "@/types";
import { ProductImage } from "@/components/product/product-image";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { MojjoCoin } from "@/components/rewards/mojjo-coin";
import { useCart, MAX_QUANTITY_PER_ITEM } from "@/components/cart/cart-context";
import { formatPrice } from "@/lib/format";

export interface CartItemProps {
  item: CartItemType;
  /** Compact drops the coin line for the narrow cart drawer. */
  compact?: boolean;
}

export function CartItem({ item, compact = false }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity } = item;

  return (
    <li className="flex gap-4 py-4">
      <Link
        href={`/products/${product.slug}`}
        className="shrink-0 rounded-lg"
        tabIndex={-1}
        aria-hidden="true"
      >
        <ProductImage
          src={product.image}
          alt=""
          sizes="80px"
          className="size-20 rounded-lg"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium text-foreground">
              <Link href={`/products/${product.slug}`} className="rounded-sm hover:text-secondary">
                {product.title}
              </Link>
            </h3>
            <p className="mt-0.5 text-xs text-muted" data-numeric>
              {formatPrice(product.price)} each
            </p>
          </div>

          <button
            type="button"
            onClick={() => removeItem(product.id)}
            aria-label={`Remove ${product.title} from cart`}
            className="-m-1 grid size-8 shrink-0 place-items-center rounded-md text-subtle transition-colors hover:bg-error-soft hover:text-error"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <QuantityStepper
              value={quantity}
              onChange={(next) => updateQuantity(product.id, next)}
              max={MAX_QUANTITY_PER_ITEM}
              itemLabel={product.title}
              size="sm"
            />
            {!compact && product.rewardCoins > 0 && (
              <MojjoCoin amount={product.rewardCoins * quantity} size="sm" showLabel={false} />
            )}
          </div>

          <span className="text-sm font-semibold text-foreground" data-numeric>
            {formatPrice(product.price * quantity)}
          </span>
        </div>
      </div>
    </li>
  );
}
