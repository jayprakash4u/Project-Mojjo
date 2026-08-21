import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="container-page py-8 sm:py-10">
      <Skeleton className="h-4 w-64" />

      <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-14">
        <Skeleton className="aspect-square rounded-xl" />

        <div className="flex flex-col gap-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
