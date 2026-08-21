"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Zap } from "lucide-react";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { useCart, MAX_QUANTITY_PER_ITEM } from "@/components/cart/cart-context";
import { useWishlist } from "@/components/wishlist/wishlist-context";
import { useToast } from "@/components/ui/toast";
import { pluralize } from "@/lib/format";
import { productForUnit } from "@/lib/products";
import { UnitSelector } from "@/components/product/unit-selector";
import { cn } from "@/lib/utils";

/** The interactive island on the otherwise server-rendered product page. */
export function ProductPurchasePanel({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem, openCart, quantityOf } = useCart();
  const { has, toggle } = useWishlist();
  const { toast } = useToast();

  const [quantity, setQuantity] = React.useState(1);
  const [unitId, setUnitId] = React.useState(product.units?.[0]?.id);
  const unit = product.units?.find((candidate) => candidate.id === unitId);
  const purchasable = unit ? productForUnit(product, unit) : product;

  // Saving is per product, not per unit, so this keeps the base id.
  const saved = has(product.id);
  const inCart = quantityOf(purchasable.id);

  const handleAdd = () => {
    addItem(purchasable, quantity);
    toast({
      title: `${pluralize(quantity, "item")} added to cart`,
      description: purchasable.title,
      variant: "success",
      action: { label: "View cart", onClick: openCart },
    });
  };

  // "Buy now" is the marketplace express lane: add, then skip the cart.
  const handleBuyNow = () => {
    addItem(purchasable, quantity);
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col gap-4">
      {product.units && product.units.length > 1 && unitId && (
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted">Buy by</span>
          <UnitSelector
            units={product.units}
            value={unitId}
            onChange={setUnitId}
            label={product.title}
            layout="segmented"
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted">Quantity</span>
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          max={MAX_QUANTITY_PER_ITEM}
          itemLabel={purchasable.title}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 border-secondary text-secondary hover:bg-secondary hover:text-on-secondary"
          disabled={!product.inStock}
          onClick={handleAdd}
        >
          <ShoppingBag aria-hidden="true" />
          Add to cart
        </Button>

        <Button
          variant="accent"
          size="lg"
          className="flex-1"
          disabled={!product.inStock}
          onClick={handleBuyNow}
        >
          <Zap aria-hidden="true" />
          Buy now
        </Button>

        <Button
          variant="outline"
          size="icon"
          className={cn("size-12 shrink-0", saved && "border-error text-error")}
          aria-pressed={saved}
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          onClick={() => {
            const nowSaved = toggle(product.id);
            toast({
              title: nowSaved ? "Saved to wishlist" : "Removed from wishlist",
              description: product.title,
            });
          }}
        >
          <Heart className={cn(saved && "fill-current")} aria-hidden="true" />
        </Button>
      </div>

      {inCart > 0 && (
        <p className="text-xs text-muted" aria-live="polite">
          {pluralize(inCart, "unit")} already in your cart.{" "}
          <button
            type="button"
            onClick={openCart}
            className="font-medium text-secondary underline-offset-4 hover:underline"
          >
            View cart
          </button>
        </p>
      )}
    </div>
  );
}
