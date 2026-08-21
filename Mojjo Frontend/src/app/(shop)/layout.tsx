import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SkipToContent } from "@/components/layout/skip-to-content";
import { CategoryStrip } from "@/components/home/category-strip";
import { LocationBar } from "@/components/delivery/location-bar";
import { CartSheet } from "@/components/cart/cart-sheet";

/**
 * Every storefront route shares this chrome. Before, each page pasted its own
 * copy of the navbar and footer configuration — nine near-identical blocks.
 */
export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SkipToContent />
      <LocationBar />
      <Navbar />
      <CategoryStrip />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartSheet />
    </>
  );
}
