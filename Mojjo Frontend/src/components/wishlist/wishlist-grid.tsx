"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { useWishlist } from "@/components/wishlist/wishlist-context";
import { products } from "@/data/mock/products";
import { pluralize } from "@/lib/format";

export function WishlistGrid() {
  const { ids, hydrated, clear } = useWishlist();

  // The list lives in localStorage, so nothing is known until after hydration.
  if (!hydrated) return <ProductGridSkeleton count={4} />;

  const saved = products.filter((product) => ids.includes(product.id));

  if (saved.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="No saved products yet"
        description="Tap the heart on any product to keep it here for later."
        action={
          <Link href="/products" className={buttonVariants({ variant: "outline" })}>
            Browse products
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted" data-numeric>
          {pluralize(saved.length, "product")}
        </p>
        <Button variant="ghost" size="sm" onClick={clear}>
          Clear wishlist
        </Button>
      </div>

      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 sm:gap-6">
        {saved.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </div>
  );
}
