import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RatingProps {
  value: number;
  reviewCount?: number;
  size?: "sm" | "md";
  /** Hide the numeric review count (tight layouts like the quick view). */
  showCount?: boolean;
  className?: string;
}

/**
 * Stars are drawn as a clipped overlay so 4.3 renders as 4.3, not 4 —
 * the previous version floored every value.
 */
export function Rating({
  value,
  reviewCount = 0,
  size = "md",
  showCount = true,
  className,
}: RatingProps) {
  const clamped = Math.max(0, Math.min(5, value));
  const starClass = size === "sm" ? "size-3.5" : "size-4";

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span
        className="relative inline-flex"
        role="img"
        aria-label={`Rated ${clamped.toFixed(1)} out of 5${
          reviewCount > 0 ? ` from ${reviewCount} reviews` : ""
        }`}
      >
        <span className="flex gap-0.5 text-border-strong" aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => (
            <Star key={index} className={starClass} strokeWidth={1.5} />
          ))}
        </span>

        <span
          className="absolute inset-0 flex gap-0.5 overflow-hidden text-accent"
          style={{ width: `${(clamped / 5) * 100}%` }}
          aria-hidden="true"
        >
          {Array.from({ length: 5 }, (_, index) => (
            <Star key={index} className={cn(starClass, "shrink-0 fill-current")} strokeWidth={1.5} />
          ))}
        </span>
      </span>

      {showCount && reviewCount > 0 && (
        <span
          className={cn("text-muted", size === "sm" ? "text-xs" : "text-sm")}
          data-numeric
        >
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
