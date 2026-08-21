import Link from "next/link";
import type { OrderItem } from "@/types";
import { ProductImage } from "@/components/product/product-image";
import { formatPrice } from "@/lib/format";

export function OrderItems({ items }: { items: OrderItem[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3">
          <div className="relative shrink-0">
            <ProductImage src={item.image} alt="" sizes="48px" className="size-12 rounded-md" />
            <span
              className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-primary text-2xs font-bold text-on-primary"
              data-numeric
              aria-hidden="true"
            >
              {item.quantity}
            </span>
          </div>

          <p className="min-w-0 flex-1 truncate text-sm text-foreground">
            <span className="sr-only">{item.quantity} × </span>
            <Link href={`/products/${item.slug}`} className="rounded-sm hover:text-secondary">
              {item.title}
            </Link>
          </p>

          <span className="shrink-0 text-sm font-medium text-foreground" data-numeric>
            {formatPrice(item.price * item.quantity)}
          </span>
        </li>
      ))}
    </ul>
  );
}
