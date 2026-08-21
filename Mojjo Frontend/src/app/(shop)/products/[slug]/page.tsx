import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleCheckBig, ShieldCheck, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Section } from "@/components/common/section";
import { Carousel } from "@/components/common/carousel";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductDetails } from "@/components/product/product-details";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { ProductCard } from "@/components/product/product-card";
import { Rating } from "@/components/product/rating";
import { MojjoCoin } from "@/components/rewards/mojjo-coin";
import { EtaBadge } from "@/components/delivery/eta-badge";
import { getProductBySlug, getRelatedProducts, products } from "@/data/mock/products";
import { getCategoryBySlug } from "@/data/mock/categories";
import { AGE_NOTICE } from "@/config/site";
import { DELIVERY_ETA_MINUTES, FREE_DELIVERY_THRESHOLD } from "@/config/delivery";
import { formatPrice } from "@/lib/format";
import { discountPercent } from "@/lib/products";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) return { title: "Product not found" };

  return {
    title: product.title,
    description: product.description ?? `${product.title} — available from Mojjo.`,
    openGraph: {
      title: product.title,
      description: product.description,
      images: [{ url: product.image, alt: product.title }],
    },
  };
}

const assurances = [
  { icon: Truck, label: `Free delivery over ${formatPrice(FREE_DELIVERY_THRESHOLD)}` },
  { icon: ShieldCheck, label: "Sold by licensed stores only" },
  { icon: CircleCheckBig, label: "Cash, eSewa or Khalti on delivery" },
];

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  const category = getCategoryBySlug(product.category);
  const related = getRelatedProducts(product, 10);
  const discount = discountPercent(product);

  // A single asset per product for now; the gallery is ready for a real set.
  const images = [product.image];

  return (
    <div className="pb-4">
      <div className="pt-3 sm:pt-4">
        <div className="container-page">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-xs sm:p-6">
            <Breadcrumbs
              className="mb-5"
              items={[
                { label: "Home", href: "/" },
                { label: "Products", href: "/products" },
                ...(category
                  ? [{ label: category.name, href: `/categories/${category.slug}` as const }]
                  : []),
                { label: product.title },
              ]}
            />

            <div className="grid gap-8 lg:grid-cols-[minmax(0,42%)_minmax(0,1fr)] lg:gap-10">
              {/* The gallery stays put while the long detail column scrolls. */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                <ProductGallery
                  images={images}
                  alt={product.title}
                  outOfStock={!product.inStock}
                />
              </div>

              <div className="flex min-w-0 flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-2xs font-medium uppercase tracking-widest text-secondary">
                    {product.subcategory ?? product.category}
                  </span>
                  {product.inStock ? (
                    <Badge variant="success" size="sm">
                      In stock
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">
                      Out of stock
                    </Badge>
                  )}
                </div>

                <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground text-balance sm:text-3xl">
                  {product.title}
                </h1>

                {product.rating > 0 && (
                  <Rating value={product.rating} reviewCount={product.reviewCount} />
                )}

                <div className="flex flex-wrap items-baseline gap-3 border-b border-border pb-4">
                  <span className="text-3xl font-semibold text-foreground" data-numeric>
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="text-base text-subtle line-through" data-numeric>
                        {formatPrice(product.originalPrice)}
                      </span>
                      {discount !== null && (
                        <span className="text-base font-semibold text-success" data-numeric>
                          {discount}% off
                        </span>
                      )}
                    </>
                  )}
                  {product.volume && (
                    <span className="ml-auto text-sm text-muted" data-numeric>
                      {product.volume}
                    </span>
                  )}
                </div>

                {product.inStock && (
                  <p className="flex flex-wrap items-center gap-2.5 rounded-lg bg-success-soft px-4 py-3 text-sm">
                    <EtaBadge size="md" className="bg-transparent px-0 py-0" />
                    <span className="text-foreground">
                      Estimated delivery in about {DELIVERY_ETA_MINUTES} minutes
                    </span>
                  </p>
                )}

                {product.rewardCoins > 0 && <MojjoCoin amount={product.rewardCoins} size="lg" />}

                <ProductPurchasePanel product={product} />

                <ul className="flex flex-col gap-2 border-t border-border pt-4">
                  {assurances.map(({ icon: Icon, label }) => (
                    <li key={label} className="flex items-center gap-2.5 text-sm text-muted">
                      <Icon className="size-4 shrink-0 text-secondary" aria-hidden="true" />
                      {label}
                    </li>
                  ))}
                </ul>

                {product.description && (
                  <div className="flex flex-col gap-2 border-t border-border pt-4">
                    <h2 className="text-sm font-semibold text-foreground">Description</h2>
                    <p className="max-w-prose text-sm leading-relaxed text-muted">
                      {product.description}
                    </p>
                  </div>
                )}

                <ProductDetails product={product} className="border-t border-border pt-4" />

                {product.ageRestricted && (
                  <p className="rounded-lg bg-warning-soft px-4 py-3 text-xs leading-relaxed text-warning">
                    {AGE_NOTICE}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <Section
          title="Similar products"
          description={`More from ${category?.name ?? product.category}.`}
          flush
        >
          <div className="px-5 sm:px-6">
            <Carousel label="Similar products">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </Carousel>
          </div>
        </Section>
      )}
    </div>
  );
}
