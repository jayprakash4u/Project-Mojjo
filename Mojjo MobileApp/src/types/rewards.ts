export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface RewardBalance {
  currentPoints: number;
  nprValue: number; // Conversion rate: e.g., 100 points = NPR 10
  tier: LoyaltyTier;
  nextTierPointsRequired: number;
  totalLifetimePoints: number;
}

export interface RewardTransaction {
  id: string;
  points: number;
  type: 'Earned' | 'Redeemed' | 'Expired' | 'Bonus';
  description: string;
  orderId?: string;
  createdAt: string;
}
