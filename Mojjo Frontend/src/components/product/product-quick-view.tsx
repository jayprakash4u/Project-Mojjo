"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Rating } from "@/components/product/rating";
import { ProductImage } from "@/components/product/product-image";
import { ProductDetails } from "@/components/product/product-details";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { MojjoCoin } from "@/components/rewards/mojjo-coin";
import { useCart, MAX_QUANTITY_PER_ITEM } from "@/components/cart/cart-context";
import { useToast } from "@/components/ui/toast";
import { formatPrice, pluralize } from "@/lib/format";
import { discountPercent } from "@/lib/products";

export interface ProductQuickViewProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductQuickView({ product, open, onOpenChange }: ProductQuickViewProps) {
  const { addItem, openCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = React.useState(1);

  // Reset the stepper whenever a different product is opened — a render-phase
  // adjustment rather than a reset effect, so there is no extra commit.
  const [lastProductId, setLastProductId] = React.useState(product?.id);
  if (lastProductId !== product?.id) {
    setLastProductId(product?.id);
    setQuantity(1);
  }

  if (!product) return null;

  const discount = discountPercent(product);

  const handleAddToCart = () => {
    // Previously this added a single unit no matter what the stepper said.
    addItem(product, quantity);
    toast({
      title: `${pluralize(quantity, "item")} added to cart`,
      description: product.title,
      variant: "success",
      action: { label: "View cart", onClick: openCart },
    });
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={product.title}
      hideTitle
      size="lg"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <QuantityStepper
            value={quantity}
            onChange={setQuantity}
            max={MAX_QUANTITY_PER_ITEM}
            itemLabel={product.title}
            className="self-start"
          />
          <Button
            full
            size="lg"
            className="sm:flex-1"
            disabled={!product.inStock}
            onClick={handleAddToCart}
          >
            <ShoppingBag aria-hidden="true" />
            {product.inStock
              ? `Add to cart · ${formatPrice(product.price * quantity)}`
              : "Out of stock"}
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <ProductImage
          src={product.image}
          alt={product.title}
          sizes="(min-width: 640px) 40vw, 90vw"
          className="aspect-square rounded-lg"
        />

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xs font-medium uppercase tracking-wide text-secondary">
              {product.subcategory ?? product.category}
            </span>
            {!product.inStock && (
              <Badge variant="neutral" size="sm">
                Out of stock
              </Badge>
            )}
          </div>

          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
            {product.title}
          </h2>

          {product.rating > 0 && (
            <Rating value={product.rating} reviewCount={product.reviewCount} size="sm" />
          )}

          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-semibold text-foreground" data-numeric>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <>
                <span className="text-sm text-subtle line-through" data-numeric>
                  {formatPrice(product.originalPrice)}
                </span>
                {discount !== null && (
                  <Badge variant="danger" size="sm" data-numeric>
                    −{discount}%
                  </Badge>
                )}
              </>
            )}
          </div>

          {product.rewardCoins > 0 && (
            <MojjoCoin amount={product.rewardCoins * quantity} size="md" />
          )}

          {product.description && (
            <p className="text-sm leading-relaxed text-muted">{product.description}</p>
          )}

          <ProductDetails product={product} className="mt-1" />

          <Link
            href={`/products/${product.slug}`}
            onClick={() => onOpenChange(false)}
            className="group mt-1 inline-flex items-center gap-1.5 self-start text-sm font-medium text-secondary underline-offset-4 hover:underline"
          >
            View full details
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </Dialog>
  );
}
