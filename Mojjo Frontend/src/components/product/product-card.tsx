"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import type { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/product/product-image";
import { MojjoCoin } from "@/components/rewards/mojjo-coin";
import { EtaBadge } from "@/components/delivery/eta-badge";
import { useCart } from "@/components/cart/cart-context";
import { useWishlist } from "@/components/wishlist/wishlist-context";
import { useToast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/format";
import { defaultUnit, discountPercent, productForUnit } from "@/lib/products";
import { BuyPerPieceDialog } from "@/components/product/buy-per-piece-dialog";
import { cn } from "@/lib/utils";

const badgeLabels = {
  sale: "Sale",
  new: "New",
  bestseller: "Best seller",
  limited: "Limited",
} as const;

const CARD_IMAGE_SIZES = "(min-width: 1280px) 18vw, (min-width: 640px) 30vw, 46vw";

export interface ProductCardProps {
  product: Product;
  eagerImage?: boolean;
}

export function ProductCard({ product, eagerImage = false }: ProductCardProps) {
  const { addItem, openCart } = useCart();
  const { has, toggle } = useWishlist();
  const { toast } = useToast();

  // The tile always sells the default unit — the pack. Buying loose opens its
  // own step, so nothing on the tile can silently change what Add adds.
  const unit = defaultUnit(product);
  const pieceUnit = product.units?.find(
    (candidate) => (candidate.contains ?? 1) === 1 && candidate.id !== unit?.id,
  );
  const [pieceDialogOpen, setPieceDialogOpen] = React.useState(false);
  // What actually goes in the cart: the chosen unit, or the product itself
  // when it is only sold one way.
  const purchasable = unit ? productForUnit(product, unit) : product;

  // The wishlist saves the product, not the unit, so it keeps the base id.
  const saved = has(product.id);
  const discount = discountPercent(product);
  const sizeLabel =
    unit?.contains && unit.contains > 1 ? `${unit.contains} pcs` : product.volume;

  const handleAddToCart = () => {
    addItem(purchasable);
    toast({
      title: "Added to cart",
      description: purchasable.title,
      variant: "success",
      action: { label: "View cart", onClick: openCart },
    });
  };

  const handleToggleWishlist = () => {
    const nowSaved = toggle(product.id);
    toast({
      title: nowSaved ? "Saved to wishlist" : "Removed from wishlist",
      description: product.title,
    });
  };

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-lg border border-transparent bg-surface",
        "transition-[box-shadow,border-color] duration-200 ease-out",
        "hover:border-border hover:shadow-md",
      )}
    >
      <div className="relative p-2.5 pb-0">
        <ProductImage
          src={product.image}
          alt={product.title}
          sizes={CARD_IMAGE_SIZES}
          eager={eagerImage}
          className="aspect-square rounded-md"
          imageClassName={cn(
            "transition-transform duration-500 ease-out group-hover:scale-[1.04]",
            !product.inStock && "opacity-40 saturate-50",
          )}
        />

        {/* Out-of-stock reads over the image, so it survives a quick scan. */}
        {!product.inStock && (
          <span className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="rounded-full bg-primary/85 px-3 py-1 text-xs font-semibold text-on-primary">
              Out of stock
            </span>
          </span>
        )}

        {(product.badge || discount !== null) && (
          <div className="pointer-events-none absolute left-4 top-4 flex flex-col items-start gap-1">
            {discount !== null && (
              <Badge variant="danger" size="sm" data-numeric>
                {discount}% off
              </Badge>
            )}
            {product.badge && (
              <Badge variant={product.badge === "sale" ? "accent" : "primary"} size="sm">
                {badgeLabels[product.badge]}
              </Badge>
            )}
          </div>
        )}

        {purchasable.rewardCoins > 0 && (
          <span className="pointer-events-none absolute bottom-2 left-4 rounded-full bg-surface/90 px-1.5 py-0.5 shadow-xs backdrop-blur-sm">
            <MojjoCoin amount={purchasable.rewardCoins} size="sm" showLabel={false} />
          </span>
        )}

        {/* z-10 keeps this clickable above the stretched title link below. */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-pressed={saved}
          aria-label={
            saved ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`
          }
          className={cn(
            "absolute right-4 top-4 z-10 grid size-8 place-items-center rounded-full",
            "bg-surface/90 backdrop-blur-sm transition-colors duration-200",
            saved ? "text-error" : "text-subtle hover:text-error",
          )}
        >
          <Heart className={cn("size-4", saved && "fill-current")} aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
          {/* Stretched link: the whole card is clickable, controls above stay on top. */}
          <Link
            href={`/products/${product.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {product.title}
          </Link>
        </h3>

        {/* One quiet meta line: speed, then how much you get. Volume and pack
            size are the same idea, so only one of them is ever shown. */}
        {(product.inStock || sizeLabel) && (
          <div className="flex items-center gap-1.5">
            {product.inStock && <EtaBadge />}
            {sizeLabel && (
              <span className="truncate text-2xs text-subtle" data-numeric>
                {sizeLabel}
              </span>
            )}
          </div>
        )}

        {/* Price and the way out to loose pieces share a line. Pushed to the
            bottom so cards in a row align on price however many lines their
            titles wrap to. */}
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-1.5">
          <span className="text-base font-semibold text-foreground" data-numeric>
            {formatPrice(purchasable.price)}
          </span>
          {!unit && product.originalPrice && (
            <span className="text-2xs text-subtle line-through" data-numeric>
              {formatPrice(product.originalPrice)}
            </span>
          )}

          {/* z-10 clears the stretched title link. */}
          {pieceUnit && product.inStock && (
            <button
              type="button"
              onClick={() => setPieceDialogOpen(true)}
              aria-label={`Buy ${product.title} per piece, ${formatPrice(pieceUnit.price)} each`}
              className="relative z-10 ml-auto whitespace-nowrap text-2xs font-semibold text-secondary underline underline-offset-2 transition-colors hover:text-secondary/75"
            >
              Per piece <span data-numeric>{formatPrice(pieceUnit.price)}</span>
            </button>
          )}
        </div>

        {/* One button. Quantity is chosen where the decision is made: in the
            per-piece dialog, or in the cart for anything already added. */}
        <div className="relative z-10 mt-0.5">
          {product.inStock ? (
            <button
              type="button"
              onClick={handleAddToCart}
              className={cn(
                "flex h-9 w-full items-center justify-center gap-1.5 rounded-md",
                "bg-secondary text-sm font-semibold text-on-secondary",
                "transition-colors duration-200 hover:bg-secondary/90",
              )}
            >
              <Plus className="size-4 shrink-0" aria-hidden="true" />
              Add
            </button>
          ) : (
            <span className="flex h-9 w-full items-center justify-center rounded-md border border-border text-sm font-semibold text-subtle">
              Out of stock
            </span>
          )}
        </div>
      </div>

      {pieceUnit && pieceDialogOpen && (
        <BuyPerPieceDialog
          product={product}
          unit={pieceUnit}
          open={pieceDialogOpen}
          onOpenChange={setPieceDialogOpen}
        />
      )}
    </article>
  );
}
