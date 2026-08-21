import { cn } from "@/lib/utils";
import { formatCount } from "@/lib/format";

export interface MojjoCoinProps {
  amount: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: { text: "text-xs", coin: "size-3.5 text-[8px]" },
  md: { text: "text-sm", coin: "size-4 text-[9px]" },
  lg: { text: "text-base", coin: "size-5 text-[11px]" },
} as const;

/** The loyalty token. A minted "M" disc rather than a generic coin glyph. */
export function MojjoCoin({
  amount,
  size = "md",
  showLabel = true,
  className,
}: MojjoCoinProps) {
  const styles = sizeClasses[size];

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 font-medium text-accent", styles.text, className)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid shrink-0 place-items-center rounded-full bg-accent font-bold text-on-accent",
          styles.coin,
        )}
      >
        M
      </span>
      <span data-numeric>
        {amount > 0 ? "+" : ""}
        {formatCount(amount)}
      </span>
      {showLabel && <span className="text-muted">coins</span>}
    </span>
  );
}
