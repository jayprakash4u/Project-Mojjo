import { MojjoCoinBalance, MojjoCoinTransaction, Reward } from "@/types";

export const coinBalance: MojjoCoinBalance = {
  balance: 895,
  nextRewardCoins: 1000,
  coinsToNextReward: 105,
};

export const coinHistory: MojjoCoinTransaction[] = [
  {
    id: "1",
    amount: 115,
    type: "earned",
    description: "Order #MJ10245",
    createdAt: "2026-08-20T10:30:00Z",
  },
  {
    id: "2",
    amount: 45,
    type: "earned",
    description: "Order #MJ10238",
    createdAt: "2026-08-19T14:20:00Z",
  },
  {
    id: "3",
    amount: 100,
    type: "earned",
    description: "First order bonus",
    createdAt: "2026-08-15T09:00:00Z",
  },
  {
    id: "4",
    amount: -1000,
    type: "redeemed",
    description: "Reward redeemed: NPR 100 OFF",
    createdAt: "2026-08-10T16:45:00Z",
  },
];

export const rewards: Reward[] = [
  {
    id: "1",
    title: "NPR 100 OFF",
    description: "Get NPR 100 off on your next order",
    coinsRequired: 1000,
    discountType: "fixed",
    discountValue: 100,
    icon: "🎫",
  },
  {
    id: "2",
    title: "NPR 250 OFF",
    description: "Get NPR 250 off on orders above NPR 2,000",
    coinsRequired: 2500,
    discountType: "fixed",
    discountValue: 250,
    icon: "🎁",
  },
  {
    id: "3",
    title: "10% OFF",
    description: "Get 10% off on your next order",
    coinsRequired: 500,
    discountType: "percentage",
    discountValue: 10,
    icon: "🏷️",
  },
];
