import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Zap, Sparkles, Clock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { DELIVERY_ETA_MINUTES, FREE_DELIVERY_THRESHOLD } from "@/config/delivery";
import { formatPrice } from "@/lib/format";

const promises = [
  { icon: Zap, label: `${DELIVERY_ETA_MINUTES}-minute delivery in Kathmandu` },
  { icon: Truck, label: `Free delivery over ${formatPrice(FREE_DELIVERY_THRESHOLD)}` },
  { icon: ShieldCheck, label: "100% Genuine & Licensed Stores" },
];

export function Hero() {
  return (
    <section className="pt-3 sm:pt-4">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c2635] via-[#091b26] to-[#040e15] border border-slate-800 text-foreground p-6 sm:p-8 lg:p-10 shadow-2xl">
          {/* Glowing Ambient Orbs */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-teal-500/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-20 -bottom-20 size-80 rounded-full bg-amber-500/10 blur-3xl"
          />

          <div className="relative grid items-center gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
            <div className="flex flex-col items-start gap-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-500/20 px-3.5 py-1.5 text-xs font-bold text-teal-300 shadow-xs">
                <span className="size-2 rounded-full bg-teal-400 animate-ping" aria-hidden="true" />
                ⚡ 45-Min Express Delivery Live Across Kathmandu & Lalitpur
              </span>

              <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                The good stuff, at your door in <span className="text-teal-400">under an hour.</span>
              </h1>

              <p className="max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base">
                Premium whisky, wine and chilled beer alongside fresh cigarettes, snacks and mixers.
                One cart, one delivery boy, 45 minutes flat.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/products"
                  className="px-6 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-teal-500/20 transition-all flex items-center gap-2"
                >
                  <span>Start Shopping</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/categories/alcohol"
                  className="px-6 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm transition-all"
                >
                  🍷 Browse Alcohol & Spirits
                </Link>
              </div>

              <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2">
                {promises.map(({ icon: Icon, label }) => (
                  <li key={label} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300">
                    <Icon className="size-4 text-teal-400" aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative hidden aspect-4/3 overflow-hidden rounded-2xl border border-slate-800 lg:block shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=800"
                alt="A selection of spirits, snacks and cold drinks available from Mojjo"
                fill
                sizes="40vw"
                loading="eager"
                fetchPriority="high"
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
