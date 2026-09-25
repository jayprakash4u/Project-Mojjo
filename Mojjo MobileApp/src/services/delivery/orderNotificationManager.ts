export interface OrderStageMilestone {
  key: string;
  stageNumber: number;
  title: string;
  subtitle: string;
  icon: string;
  badgeLabel: string;
  timeEstimate: string;
  notificationMessage: string;
}

export const ORDER_STAGE_MILESTONES: OrderStageMilestone[] = [
  {
    key: 'placed',
    stageNumber: 1,
    title: 'Order Placed',
    subtitle: 'Payment confirmed & order sent to Dark Store',
    icon: 'cart-outline',
    badgeLabel: '🛒 STEP 1',
    timeEstimate: '11:00 AM',
    notificationMessage: '🛒 Your order has been placed and sent to the dark store.',
  },
  {
    key: 'confirmed',
    stageNumber: 2,
    title: 'Order Confirmed',
    subtitle: 'Dark Store accepted & assigned picker',
    icon: 'checkmark-circle-outline',
    badgeLabel: '✅ STEP 2',
    timeEstimate: '11:02 AM',
    notificationMessage: '✅ Order accepted! Dark store is preparing your items.',
  },
  {
    key: 'preparing',
    stageNumber: 3,
    title: 'Packing Fresh Items',
    subtitle: 'Inspecting, scanning & sealing into thermal bag',
    icon: 'cube-outline',
    badgeLabel: '👨‍🍳 STEP 3',
    timeEstimate: '11:05 AM',
    notificationMessage: '👨‍🍳 Dark store is packing and sealing your order bag.',
  },
  {
    key: 'out_for_delivery',
    stageNumber: 4,
    title: 'Rider Out For Delivery',
    subtitle: 'Delivery partner picked up and is riding to your address',
    icon: 'bicycle-outline',
    badgeLabel: '🛵 STEP 4',
    timeEstimate: '11:08 AM',
    notificationMessage: '🛵 Delivery partner Bikash picked up your order & is on the way!',
  },
  {
    key: 'near_doorstep',
    stageNumber: 5,
    title: 'Rider Arriving at Doorstep',
    subtitle: 'Delivery partner is within 100m of your gate / road',
    icon: 'navigate-circle-outline',
    badgeLabel: '🏠 STEP 5',
    timeEstimate: '11:14 AM',
    notificationMessage: '🏠 Delivery partner is near your doorstep! Please be ready.',
  },
  {
    key: 'delivered',
    stageNumber: 6,
    title: 'Order Delivered',
    subtitle: 'Handed over at doorstep with verified OTP / bag seal',
    icon: 'sparkles-outline',
    badgeLabel: '🎉 STEP 6',
    timeEstimate: '11:16 AM',
    notificationMessage: '🎉 Your order has been delivered! Enjoy your Mojjo items.',
  },
];

export const getStageIndexFromStatus = (status: string): number => {
  const s = (status || '').toLowerCase().trim();
  if (s.includes('deliver') && !s.includes('out') && !s.includes('near')) return 5;
  if (s.includes('near') || s.includes('gate') || s.includes('arrived')) return 4;
  if (s.includes('out') || s.includes('picked') || s.includes('delivery')) return 3;
  if (s.includes('prep') || s.includes('pack')) return 2;
  if (s.includes('confirm') || s.includes('accept')) return 1;
  return 0;
};
