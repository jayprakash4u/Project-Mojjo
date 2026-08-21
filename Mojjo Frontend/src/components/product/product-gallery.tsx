"use client";

import * as React from "react";
import { ProductImage } from "@/components/product/product-image";
import { cn } from "@/lib/utils";

export interface ProductGalleryProps {
  images: string[];
  alt: string;
  outOfStock?: boolean;
}

/**
 * Thumbnail rail beside a large stage, the marketplace product-page layout.
 * The rail sits left on desktop and below the stage on mobile; hovering or
 * focusing a thumbnail swaps the stage, which is how these galleries behave.
 */
export function ProductGallery({ images, alt, outOfStock = false }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const active = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {images.length > 1 && (
        <ul
          className="flex gap-2 overflow-x-auto scrollbar-none sm:flex-col sm:overflow-visible"
          aria-label="Product images"
        >
          {images.map((image, index) => (
            <li key={image} className="shrink-0">
              <button
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
                aria-label={`View image ${index + 1} of ${images.length}`}
                aria-current={index === activeIndex}
                className={cn(
                  "block overflow-hidden rounded-md border-2 transition-colors",
                  index === activeIndex ? "border-secondary" : "border-border hover:border-muted",
                )}
              >
                <ProductImage src={image} alt="" sizes="64px" className="size-16" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative min-w-0 flex-1">
        <ProductImage
          src={active}
          alt={alt}
          sizes="(min-width: 1024px) 40vw, 92vw"
          eager
          className="aspect-square rounded-lg border border-border"
          imageClassName={cn(outOfStock && "opacity-40 saturate-50")}
        />

        {outOfStock && (
          <span className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="rounded-full bg-primary/85 px-4 py-1.5 text-sm font-semibold text-on-primary">
              Out of stock
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
