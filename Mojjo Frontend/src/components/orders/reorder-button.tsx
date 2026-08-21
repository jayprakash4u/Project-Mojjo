"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import type { OrderItem } from "@/types";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-context";
import { useToast } from "@/components/ui/toast";
import { products } from "@/data/mock/products";
import { pluralize } from "@/lib/format";

export interface ReorderButtonProps extends Pick<ButtonProps, "variant" | "size" | "full"> {
  items: OrderItem[];
}

/**
 * Re-adds the order's line items by looking each one up in the live catalogue,
 * so current prices, reward coins and stock apply — the old version rebuilt a
 * stub product from the order snapshot and dropped quantities entirely.
 */
export function ReorderButton({ items, variant = "primary", size = "sm", full }: ReorderButtonProps) {
  const { addItem, openCart } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  const handleReorder = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    let added = 0;
    let unavailable = 0;

    for (const item of items) {
      const product = products.find((candidate) => candidate.id === item.id);
      if (!product || !product.inStock) {
        unavailable += 1;
        continue;
      }
      addItem(product, item.quantity);
      added += 1;
    }

    setLoading(false);

    if (added === 0) {
      toast({
        title: "Nothing could be re-added",
        description: "Every item from this order is currently out of stock.",
        variant: "warning",
      });
      return;
    }

    toast({
      title: `${pluralize(added, "item")} added to your cart`,
      description:
        unavailable > 0 ? `${pluralize(unavailable, "item")} out of stock and skipped.` : undefined,
      variant: unavailable > 0 ? "warning" : "success",
      action: { label: "View cart", onClick: openCart },
    });
  };

  return (
    <Button variant={variant} size={size} full={full} loading={loading} onClick={handleReorder}>
      <RotateCcw aria-hidden="true" />
      Reorder
    </Button>
  );
}
