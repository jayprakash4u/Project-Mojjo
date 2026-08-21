import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Zap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { DELIVERY_ETA_MINUTES, FREE_DELIVERY_THRESHOLD } from "@/config/delivery";
import { formatPrice } from "@/lib/format";

const promises = [
  { icon: Zap, label: `${DELIVERY_ETA_MINUTES}-minute delivery` },
  { icon: Truck, label: `Free over ${formatPrice(FREE_DELIVERY_THRESHOLD)}` },
  { icon: ShieldCheck, label: "Licensed stores only" },
];

/**
 * A single wide banner rather than a full-height splash — the marketplace
 * pattern trades hero real estate for product rows above the fold.
 */
export function Hero() {
  return (
    <section className="pt-3 sm:pt-4">
      <div className="container-page">
        <div className="on-ink relative overflow-hidden rounded-xl bg-background text-foreground">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-primary/15 blur-3xl"
          />

          <div className="relative grid items-center gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10 lg:p-10">
            <div className="flex flex-col items-start gap-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-muted">
                <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                Delivering across Kathmandu tonight
              </span>

              <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-foreground text-balance sm:text-4xl lg:text-5xl">
                The good stuff, at your door in under an hour.
              </h1>

              <p className="max-w-lg text-sm leading-relaxed text-muted sm:text-base">
                Whisky, wine and beer alongside the cigarettes, snacks and cold drinks that finish
                the evening. One order, one delivery.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link href="/products" className={buttonVariants({ size: "lg" })}>
                  Start shopping
                  <ArrowRight aria-hidden="true" />
                </Link>
                <Link
                  href="/categories/alcohol"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  Browse alcohol
                </Link>
              </div>

              <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2">
                {promises.map(({ icon: Icon, label }) => (
                  <li key={label} className="inline-flex items-center gap-1.5 text-xs text-muted">
                    <Icon className="size-3.5 text-primary" aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative hidden aspect-4/3 overflow-hidden rounded-lg lg:block">
              <Image
                src="https://placehold.co/800x600/16323f/c08b32?font=source-sans-pro&text=Mojjo"
                alt="A selection of spirits, snacks and cold drinks available from Mojjo"
                fill
                sizes="40vw"
                loading="eager"
                fetchPriority="high"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
