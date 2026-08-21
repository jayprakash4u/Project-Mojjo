import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { CheckoutGate } from "@/components/checkout/checkout-gate";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Checkout" }]} />

      <header className="mt-5 flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Checkout
        </h1>
        <p className="text-sm text-muted">
          Three steps and your order is on its way.
        </p>
      </header>

      <div className="mt-8">
        <CheckoutGate />
      </div>
    </div>
  );
}
