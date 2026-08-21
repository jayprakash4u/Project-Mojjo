import Link from "next/link";
import type { MojjoCoinBalance } from "@/types";
import { CoinProgress } from "@/components/rewards/coin-progress";
import { buttonVariants } from "@/components/ui/button";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface CoinBalanceProps {
  balance: MojjoCoinBalance;
  /** Renders the "View rewards" link. Omit on the rewards page itself. */
  showLink?: boolean;
  className?: string;
}

export function CoinBalance({ balance, showLink = false, className }: CoinBalanceProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 overflow-hidden rounded-xl border border-accent/25 bg-accent-soft p-6",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Mojjo coins
          </p>
          <p className="mt-2 font-display text-4xl font-semibold text-foreground" data-numeric>
            {formatCount(balance.balance)}
          </p>
        </div>

        <span
          aria-hidden="true"
          className="grid size-12 shrink-0 place-items-center rounded-full bg-accent font-display text-xl font-bold text-on-accent"
        >
          M
        </span>
      </div>

      <CoinProgress
        current={balance.balance}
        target={balance.nextRewardCoins}
        label={`${formatCount(balance.coinsToNextReward)} coins to your next reward`}
      />

      {showLink && (
        <Link
          href="/rewards"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "self-start")}
        >
          View rewards
        </Link>
      )}
    </div>
  );
}
