import Link from "next/link";
import type { Route } from "next";
import type { Product } from "@/types";
import { Carousel } from "@/components/common/carousel";
import { ProductCard } from "@/components/product/product-card";
import { buttonVariants } from "@/components/ui/button";
import { CountdownPill } from "@/components/home/countdown-pill";

export interface DealBandProps {
  title: string;
  subtitle: string;
  products: Product[];
  action: { label: string; href: Route };
}

/**
 * The marketplace "deals" unit: a coloured panel pinned to the left of a
 * product rail. The panel carries the urgency (label, countdown, CTA) so the
 * cards themselves stay identical to every other row.
 */
export function DealBand({ title, subtitle, products, action }: DealBandProps) {
  if (products.length === 0) return null;

  return (
    <section className="pt-3 sm:pt-4">
      <div className="container-page">
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-xs">
          <div className="flex flex-col lg:flex-row">
            <div className="on-ink flex shrink-0 flex-col justify-between gap-4 bg-background p-5 text-foreground sm:p-6 lg:w-60">
              <div className="flex flex-col gap-2">
                <h2 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  {title}
                </h2>
                <p className="text-sm leading-relaxed text-muted">{subtitle}</p>
                <CountdownPill className="mt-1 self-start" />
              </div>

              <Link
                href={action.href}
                className={buttonVariants({ size: "sm", className: "self-start" })}
              >
                {action.label}
              </Link>
            </div>

            <div className="min-w-0 flex-1 p-5 sm:p-6">
              <Carousel
                label={title}
                itemClassName="w-[52%] sm:w-[36%] lg:w-[31%] xl:w-[24%]"
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </Carousel>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
