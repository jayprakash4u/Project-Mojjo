import type { Product } from "@/types";
import { cn } from "@/lib/utils";

/** Flattens the volume/origin fields and the free-form list into one table. */
function specRows(product: Product) {
  return [
    product.volume ? { label: "Size", value: product.volume } : null,
    product.origin ? { label: "Origin", value: product.origin } : null,
    ...(product.details ?? []),
  ].filter((row): row is { label: string; value: string } => row !== null);
}

export function ProductDetails({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const rows = specRows(product);
  if (rows.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <h3 className="text-sm font-semibold text-foreground">Details</h3>

      <dl className="divide-y divide-border overflow-hidden rounded-lg border border-border">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4 px-4 py-2.5">
            <dt className="text-sm text-muted">{row.label}</dt>
            <dd className="text-sm font-medium text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
