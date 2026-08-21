"use client";

import Link from "next/link";
import { Eye, Heart, Plus } from "lucide-react";
import type { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/product/product-image";
import { MojjoCoin } from "@/components/rewards/mojjo-coin";
import { EtaBadge } from "@/components/delivery/eta-badge";
import { useCart } from "@/components/cart/cart-context";
import { useWishlist } from "@/components/wishlist/wishlist-context";
import { useToast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/format";
import { discountPercent } from "@/lib/products";
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
  onQuickView?: (product: Product) => void;
  eagerImage?: boolean;
}

export function ProductCard({ product, onQuickView, eagerImage = false }: ProductCardProps) {
  const { addItem, openCart, quantityOf } = useCart();
  const { has, toggle } = useWishlist();
  const { toast } = useToast();

  const saved = has(product.id);
  const inCart = quantityOf(product.id);
  const discount = discountPercent(product);

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: "Added to cart",
      description: product.title,
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

        {/* Quick view slides up over the image on hover; keyboard users reach
            it by tabbing, which also reveals it via focus-within. */}
        {onQuickView && product.inStock && (
          <button
            type="button"
            onClick={() => onQuickView(product)}
            className={cn(
              "absolute inset-x-2.5 bottom-0 z-10 hidden h-8 items-center justify-center gap-1.5 rounded-b-md",
              "bg-primary/90 text-xs font-semibold text-on-primary backdrop-blur-sm",
              "translate-y-full opacity-0 transition-[transform,opacity] duration-200",
              "group-hover:translate-y-0 group-hover:opacity-100",
              "focus-visible:translate-y-0 focus-visible:opacity-100",
              "lg:flex",
            )}
          >
            <Eye className="size-3.5" aria-hidden="true" />
            Quick view
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="flex items-center justify-between gap-2">
          {product.inStock ? <EtaBadge /> : <span />}
          {product.volume && (
            <span className="text-2xs text-subtle" data-numeric>
              {product.volume}
            </span>
          )}
        </div>

        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
          {/* Stretched link: the whole card is clickable, buttons above stay on top. */}
          <Link
            href={`/products/${product.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {product.title}
          </Link>
        </h3>

        {/* Price sits at the bottom of the body so cards in a row align on it
            regardless of how many lines the title wraps to. */}
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-2">
          <span className="text-base font-semibold text-foreground" data-numeric>
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-subtle line-through" data-numeric>
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {product.rewardCoins > 0 && (
          <MojjoCoin amount={product.rewardCoins} size="sm" showLabel={false} />
        )}

        <div className="relative z-10 mt-2.5">
          <button
            type="button"
            disabled={!product.inStock}
            onClick={handleAddToCart}
            className={cn(
              "flex h-9 w-full items-center justify-center gap-1.5 rounded-md border text-sm font-semibold",
              "transition-colors duration-200",
              product.inStock
                ? "border-secondary text-secondary hover:bg-secondary hover:text-on-secondary"
                : "border-border text-subtle",
              "disabled:pointer-events-none",
            )}
          >
            {product.inStock ? (
              <>
                <Plus className="size-4" aria-hidden="true" />
                {inCart > 0 ? (
                  <>
                    Add more<span className="sr-only">, {inCart} already in cart</span>
                  </>
                ) : (
                  "Add"
                )}
              </>
            ) : (
              "Out of stock"
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
