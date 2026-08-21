export type MojjoCoinBalance = {
  balance: number;
  nextRewardCoins: number;
  coinsToNextReward: number;
};

export type MojjoCoinTransaction = {
  id: string;
  amount: number;
  type: "earned" | "redeemed" | "adjusted";
  description: string;
  createdAt: string;
};

export type Reward = {
  id: string;
  title: string;
  description: string;
  coinsRequired: number;
  discountType: "fixed" | "percentage";
  discountValue: number;
  icon?: string;
};
