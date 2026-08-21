"use client";

import * as React from "react";
import type { Product, ProductUnit } from "@/types";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/product/product-image";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { useCart, MAX_QUANTITY_PER_ITEM } from "@/components/cart/cart-context";
import { useToast } from "@/components/ui/toast";
import { formatPrice, pluralize } from "@/lib/format";
import { productForUnit, unitSavingsPercent } from "@/lib/products";

export interface BuyPerPieceDialogProps {
  product: Product;
  /** The single-item unit this dialog sells. */
  unit: ProductUnit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Buying loose is a deliberate detour, so it gets a step of its own rather than
 * a control on the tile: pick how many pieces, see the running total, add.
 * Spelling it out beats a compact toggle that half the shop has to decode.
 */
export function BuyPerPieceDialog({ product, unit, open, onOpenChange }: BuyPerPieceDialogProps) {
  const { addItem, openCart } = useCart();
  const { toast } = useToast();
  // The card mounts this only while open, so every visit starts from one
  // without an effect reaching back in to reset it.
  const [quantity, setQuantity] = React.useState(1);

  const total = unit.price * quantity;
  // Positive when the pack is the better buy — worth saying before they commit.
  const packSaving = product.units
    ? unitSavingsPercent(
        product.units,
        product.units.find((candidate) => candidate.id !== unit.id) ?? unit,
      )
    : null;

  const handleAdd = () => {
    addItem(productForUnit(product, unit), quantity);
    onOpenChange(false);
    toast({
      title: `${pluralize(quantity, "piece")} added to cart`,
      description: product.title,
      variant: "success",
      action: { label: "View cart", onClick: openCart },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title="Buy per piece"
      description={product.title}
      footer={
        <Button full size="lg" onClick={handleAdd}>
          Add {pluralize(quantity, "piece")} · {formatPrice(total)}
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <ProductImage
            src={product.image}
            alt={product.title}
            sizes="64px"
            className="size-16 shrink-0 rounded-lg"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{product.title}</p>
            <p className="text-sm text-muted" data-numeric>
              {formatPrice(unit.price)} per piece
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground">How many pieces?</span>
          <QuantityStepper
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={MAX_QUANTITY_PER_ITEM}
            itemLabel={`${product.title} pieces`}
          />
        </div>

        <div className="flex items-baseline justify-between border-t border-border pt-4">
          <span className="text-sm text-muted" data-numeric>
            {formatPrice(unit.price)} × {quantity}
          </span>
          <span className="text-lg font-semibold text-foreground" data-numeric>
            {formatPrice(total)}
          </span>
        </div>

        {packSaving !== null && (
          <p className="rounded-md bg-surface-sunken px-3 py-2 text-2xs text-muted">
            Buying the full pack works out {packSaving}% cheaper per piece.
          </p>
        )}
      </div>
    </Dialog>
  );
}
