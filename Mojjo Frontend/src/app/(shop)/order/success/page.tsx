import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderSuccess } from "@/components/orders/order-success";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

export default function OrderSuccessPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <Suspense
        fallback={
          <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6">
            <Skeleton className="size-16 rounded-full" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        }
      >
        <OrderSuccess />
      </Suspense>
    </div>
  );
}
