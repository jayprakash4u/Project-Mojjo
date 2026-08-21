import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { ProductShowcase } from "@/components/home/product-showcase";
import { DealBand } from "@/components/home/deal-band";
import { WhyMojjo } from "@/components/home/why-mojjo";
import { products } from "@/data/mock/products";
import { sortProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Drinks, snacks and essentials delivered",
  description:
    "Order whisky, wine, beer, cigarettes, snacks and cold drinks from Mojjo and have them delivered in under an hour.",
};

// A server component: the whole page used to be "use client" for no reason.
export default function HomePage() {
  const onOffer = products.filter((product) => product.originalPrice);
  const popular = sortProducts(
    products.filter((product) => product.rating >= 4.3 && product.inStock),
    "popular",
  ).slice(0, 10);
  const newIn = sortProducts(products.filter((product) => product.inStock), "newest").slice(0, 10);

  const byCategory = (slug: string) =>
    products.filter((product) => product.category === slug && product.inStock).slice(0, 10);

  return (
    <div className="pb-4">
      <Hero />

      <DealBand
        title="Deals of the day"
        subtitle="Reduced until midnight, while stock lasts."
        products={onOffer}
        action={{ label: "See all offers", href: "/products?onSale=true" }}
      />

      <CategoryShowcase />

      <ProductShowcase
        title="Popular right now"
        description="What people in your area are ordering tonight."
        products={popular}
        action={{ label: "Browse everything", href: "/products" }}
        eagerFirstRow
      />

      <ProductShowcase
        title="Whisky, wine & beer"
        products={byCategory("alcohol")}
        action={{ label: "All alcohol", href: "/categories/alcohol" }}
      />

      <ProductShowcase
        title="Snacks to go with it"
        products={byCategory("snacks")}
        action={{ label: "All snacks", href: "/categories/snacks" }}
      />

      <ProductShowcase
        title="Cold drinks & mixers"
        products={byCategory("cold-drinks")}
        action={{ label: "All cold drinks", href: "/categories/cold-drinks" }}
      />

      <ProductShowcase
        title="New in"
        products={newIn}
        action={{ label: "Browse everything", href: "/products" }}
      />

      <WhyMojjo />
    </div>
  );
}
