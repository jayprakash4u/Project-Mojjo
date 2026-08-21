import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { WishlistGrid } from "@/components/wishlist/wishlist-grid";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Products you have saved for later on Mojjo.",
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />

      <header className="mt-5 flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Saved for later
        </h1>
        <p className="text-sm text-muted sm:text-base">
          Everything you have hearted, kept on this device.
        </p>
      </header>

      <div className="mt-8">
        <WishlistGrid />
      </div>
    </div>
  );
}
