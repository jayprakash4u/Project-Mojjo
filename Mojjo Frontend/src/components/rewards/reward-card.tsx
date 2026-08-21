"use client";

import { Lock } from "lucide-react";
import type { Reward } from "@/types";
import { Button } from "@/components/ui/button";
import { CoinProgress } from "@/components/rewards/coin-progress";
import { useToast } from "@/components/ui/toast";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface RewardCardProps {
  reward: Reward;
  userCoins: number;
}

export function RewardCard({ reward, userCoins }: RewardCardProps) {
  const { toast } = useToast();
  const unlocked = userCoins >= reward.coinsRequired;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border bg-surface p-5 transition-colors duration-200",
        unlocked ? "border-accent/35" : "border-border",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-lg text-lg",
            unlocked ? "bg-accent-soft" : "bg-surface-sunken",
          )}
        >
          {reward.icon}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground">{reward.title}</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">{reward.description}</p>
        </div>
      </div>

      {unlocked ? (
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-accent" data-numeric>
            {formatCount(reward.coinsRequired)} coins
          </span>
          <Button
            variant="accent"
            size="sm"
            onClick={() =>
              toast({
                title: "Reward redeemed",
                description: `${reward.title} will apply at checkout.`,
                variant: "success",
              })
            }
          >
            Redeem
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <CoinProgress
            current={userCoins}
            target={reward.coinsRequired}
            label={`${formatCount(reward.coinsRequired - userCoins)} coins to unlock`}
          />
          <span className="inline-flex items-center gap-1.5 text-xs text-subtle">
            <Lock className="size-3" aria-hidden="true" />
            Locked
          </span>
        </div>
      )}
    </div>
  );
}
