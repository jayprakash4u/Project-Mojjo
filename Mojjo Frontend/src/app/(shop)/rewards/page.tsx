import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { CoinBalance } from "@/components/rewards/coin-balance";
import { RewardCard } from "@/components/rewards/reward-card";
import { CoinHistory } from "@/components/rewards/coin-history";
import { coinBalance, coinHistory, rewards } from "@/data/mock/rewards";

export const metadata: Metadata = {
  title: "Mojjo rewards",
  description: "Earn Mojjo coins on every order and redeem them against your next one.",
};

export default function RewardsPage() {
  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Rewards" }]} />

      <header className="mt-5 flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Mojjo rewards
        </h1>
        <p className="max-w-2xl text-sm text-muted sm:text-base">
          Every order earns coins. Coins turn into money off the next one — no tiers, no expiry.
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-32">
            <CoinBalance balance={coinBalance} />
          </div>
        </div>

        <div className="flex flex-col gap-10 lg:col-span-2">
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-foreground">Available rewards</h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {rewards.map((reward) => (
                <li key={reward.id}>
                  <RewardCard reward={reward} userCoins={coinBalance.balance} />
                </li>
              ))}
            </ul>
          </section>

          <CoinHistory transactions={coinHistory} />
        </div>
      </div>
    </div>
  );
}
