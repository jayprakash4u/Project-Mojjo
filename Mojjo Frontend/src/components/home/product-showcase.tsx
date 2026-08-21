import type { Route } from "next";
import type { Product } from "@/types";
import { Section } from "@/components/common/section";
import { Carousel } from "@/components/common/carousel";
import { ProductCard } from "@/components/product/product-card";

export interface ProductShowcaseProps {
  title: string;
  description?: string;
  products: Product[];
  action?: { label: string; href: Route };
  /** Marks the first few images as LCP candidates. */
  eagerFirstRow?: boolean;
  /** How many rows deep the rail runs. */
  rows?: 1 | 2;
}

/**
 * One component behind every home-page product row — they were two files
 * differing only in their heading and their slice of the catalogue.
 *
 * A rail rather than a grid: it keeps each band to a fixed height, so more
 * bands fit above the fold, which is the point of the marketplace layout.
 */
export function ProductShowcase({
  title,
  description,
  products,
  action,
  eagerFirstRow = false,
  rows = 1,
}: ProductShowcaseProps) {
  if (products.length === 0) return null;

  return (
    <Section title={title} description={description} action={action} flush>
      <div className="px-5 sm:px-6">
        <Carousel label={title} rows={rows}>
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              eagerImage={eagerFirstRow && index < 4}
            />
          ))}
        </Carousel>
      </div>
    </Section>
  );
}
