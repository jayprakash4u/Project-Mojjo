import { cn } from "@/lib/utils";
import { formatCount } from "@/lib/format";

export interface CoinProgressProps {
  current: number;
  target: number;
  label?: string;
  className?: string;
}

export function CoinProgress({
  current,
  target,
  label = "Progress to next reward",
  className,
}: CoinProgressProps) {
  const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-medium text-foreground" data-numeric>
          {formatCount(current)} / {formatCount(target)}
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-label={label}
        className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
