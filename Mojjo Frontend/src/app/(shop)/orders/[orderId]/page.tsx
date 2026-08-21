import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { OrderView } from "@/components/orders/order-view";

export async function generateMetadata({
  params,
}: PageProps<"/orders/[orderId]">): Promise<Metadata> {
  const { orderId } = await params;
  return {
    title: `Order ${orderId}`,
    robots: { index: false, follow: false },
  };
}

export default async function OrderPage({ params }: PageProps<"/orders/[orderId]">) {
  const { orderId } = await params;

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "My orders", href: "/account/orders" },
          { label: orderId },
        ]}
      />

      <div className="mt-8">
        <OrderView orderId={orderId} />
      </div>
    </div>
  );
}
