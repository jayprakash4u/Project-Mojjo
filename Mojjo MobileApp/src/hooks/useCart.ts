import { useCartStore } from '../store/cartStore';

export const useCart = () => {
  const items = useCartStore((s) => s.items);
  const isLoading = useCartStore((s) => s.isLoading);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const clearCart = useCartStore((s) => s.clearCart);
  const getSummary = useCartStore((s) => s.getSummary);
  const getItemQuantity = useCartStore((s) => s.getItemQuantity);
  const revalidateCartWithServer = useCartStore((s) => s.revalidateCartWithServer);

  const summary = getSummary();

  return {
    items,
    isLoading,
    addItem,
    removeItem,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    clearCart,
    getItemQuantity,
    revalidateCartWithServer,
    summary,
    totalItemCount: summary.totalItemCount,
    subtotal: summary.itemSubtotal,
    itemSubtotal: summary.itemSubtotal,
    mrpSubtotal: summary.mrpSubtotal,
    couponDiscount: summary.couponDiscount,
    totalAmount: summary.totalAmount,
    totalSavings: summary.totalSavings,
    deliveryFee: summary.deliveryFee,
    remainingForFreeDelivery: summary.remainingForFreeDelivery,
    isFreeDelivery: summary.isFreeDelivery,
    isEmpty: items.length === 0,
  };
};
