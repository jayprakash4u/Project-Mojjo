import type { Product } from "@/types";
import { ProductCard } from "@/components/product/product-card";

export interface ProductGridProps {
  products: Product[];
  /** First-row images are marked eager only where the grid is above the fold. */
  eagerFirstRow?: boolean;
}

/**
 * Presentation only. Filtering, sorting and pagination happen on the server
 * from the URL — this used to re-filter client side and silently ignore every
 * filter except `search`.
 */
export function ProductGrid({ products, eagerFirstRow = false }: ProductGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 sm:gap-6">
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} eagerImage={eagerFirstRow && index < 4} />
        </li>
      ))}
    </ul>
  );
}
