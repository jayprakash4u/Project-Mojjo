import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="container-page py-8 sm:py-10">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-5 h-10 w-56" />
      <Skeleton className="mt-3 h-4 w-full max-w-lg" />

      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:gap-10">
        <Skeleton className="hidden h-96 w-60 shrink-0 rounded-xl lg:block" />
        <div className="flex-1">
          <ProductGridSkeleton />
        </div>
      </div>
    </div>
  );
}
