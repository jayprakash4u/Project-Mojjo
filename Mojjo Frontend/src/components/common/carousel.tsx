"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CarouselProps {
  children: React.ReactNode;
  /** Accessible name for the scrollable region. */
  label: string;
  /** Tailwind width classes applied to each slide. */
  itemClassName?: string;
  className?: string;
}

/**
 * A scroll-snap rail with overlay arrows — the Flipkart desktop row.
 *
 * The rail is a real overflow container, so touch, trackpad and keyboard
 * scrolling all work natively; the arrows are a pointer affordance layered on
 * top and are hidden from assistive tech, which uses the scroll region itself.
 */
export function Carousel({ children, label, itemClassName, className }: CarouselProps) {
  const railRef = React.useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = React.useState(true);
  const [atEnd, setAtEnd] = React.useState(true);

  const syncArrows = React.useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const maxScroll = rail.scrollWidth - rail.clientWidth;
    setAtStart(rail.scrollLeft <= 1);
    setAtEnd(rail.scrollLeft >= maxScroll - 1);
  }, []);

  // Track both scrolling and resize — a wider viewport can remove overflow
  // entirely, which should hide both arrows.
  React.useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    syncArrows();
    rail.addEventListener("scroll", syncArrows, { passive: true });

    const observer = new ResizeObserver(syncArrows);
    observer.observe(rail);

    return () => {
      rail.removeEventListener("scroll", syncArrows);
      observer.disconnect();
    };
  }, [syncArrows]);

  const scrollByPage = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    // Leave one item visible from the previous page for continuity.
    rail.scrollBy({ left: direction * (rail.clientWidth * 0.85), behavior: "smooth" });
  };

  const arrowClass =
    "absolute top-1/2 z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface-raised text-foreground shadow-md transition-opacity duration-200 hover:bg-surface-sunken lg:grid";

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={() => scrollByPage(-1)}
        className={cn(arrowClass, "-left-4", atStart && "pointer-events-none opacity-0")}
      >
        <ChevronLeft className="size-5" />
      </button>

      <ul
        ref={railRef}
        // `tabIndex` makes an overflow region keyboard-scrollable in every browser.
        tabIndex={0}
        role="group"
        aria-label={label}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 scrollbar-none sm:gap-5"
      >
        {React.Children.map(children, (child, index) => (
          <li
            key={index}
            className={cn(
              "shrink-0 snap-start",
              itemClassName ?? "w-[46%] sm:w-[31%] lg:w-[23.5%] xl:w-[19%]",
            )}
          >
            {child}
          </li>
        ))}
      </ul>

      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={() => scrollByPage(1)}
        className={cn(arrowClass, "-right-4", atEnd && "pointer-events-none opacity-0")}
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
