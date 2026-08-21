/**
 * Delivery promise. Quick-commerce apps put the ETA on every product and push
 * the free-delivery threshold hard, because both drive basket size — these are
 * the two numbers that behaviour hangs off, so they live in one place.
 */

/** Typical door-to-door time shown on cards and product pages. */
export const DELIVERY_ETA_MINUTES = 45;

/** Express delivery ETA, matching the express option at checkout. */
export const EXPRESS_ETA_MINUTES = 30;

/** Subtotal at or above which standard delivery costs nothing. */
export const FREE_DELIVERY_THRESHOLD = 2_000;

/** Flat fee applied below the threshold. */
export const STANDARD_DELIVERY_FEE = 120;

export function standardDeliveryFee(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
}

export function amountToFreeDelivery(subtotal: number): number {
  return Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
}
