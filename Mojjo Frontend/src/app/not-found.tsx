import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Wordmark } from "@/components/layout/wordmark";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-4 py-16 text-center">
      <Link href="/" className="rounded-sm">
        <Wordmark className="text-xl" />
      </Link>

      <span className="grid size-14 place-items-center rounded-full bg-surface-sunken text-subtle">
        <Compass className="size-6" aria-hidden="true" />
      </span>

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          This page doesn&apos;t exist
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted">
          The link may be out of date, or the product may no longer be stocked.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/products" className={buttonVariants()}>
          Browse products
        </Link>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Go home
        </Link>
      </div>
    </main>
  );
}
