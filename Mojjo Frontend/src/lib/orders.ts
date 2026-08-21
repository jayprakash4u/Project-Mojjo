import type { DeliveryMethod, Order, OrderStatus, PaymentMethod } from "@/types";
import {
  DELIVERY_ETA_MINUTES,
  EXPRESS_ETA_MINUTES,
  FREE_DELIVERY_THRESHOLD,
  standardDeliveryFee,
} from "@/config/delivery";
import { formatPrice } from "@/lib/format";

export const EXPRESS_DELIVERY_FEE = 150;

export const DELIVERY_METHODS: {
  value: DeliveryMethod;
  label: string;
  description: string;
  eta: string;
}[] = [
  {
    value: "standard",
    label: "Standard delivery",
    description: `Arrives in about ${DELIVERY_ETA_MINUTES} minutes. Free over ${formatPrice(FREE_DELIVERY_THRESHOLD)}.`,
    eta: `${DELIVERY_ETA_MINUTES} min`,
  },
  {
    value: "express",
    label: "Express delivery",
    description: `Prioritised rider, arrives in about ${EXPRESS_ETA_MINUTES} minutes`,
    eta: `${EXPRESS_ETA_MINUTES} min`,
  },
];

export const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
  description: string;
}[] = [
  {
    value: "cod",
    label: "Cash on delivery",
    description: "Pay the rider when your order arrives",
  },
  { value: "esewa", label: "eSewa", description: "Pay from your eSewa wallet" },
  { value: "khalti", label: "Khalti", description: "Pay from your Khalti wallet" },
];

/** Express is a flat fee; standard is free once the basket clears the threshold. */
export function deliveryFeeFor(method: DeliveryMethod, subtotal: number): number {
  return method === "express" ? EXPRESS_DELIVERY_FEE : standardDeliveryFee(subtotal);
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  confirmed: "Order confirmed",
  preparing: "Being prepared",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** The happy-path sequence a live order moves through. */
export const ORDER_TIMELINE: OrderStatus[] = [
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
];

export function orderProgress(status: OrderStatus): number {
  const index = ORDER_TIMELINE.indexOf(status);
  return index < 0 ? 0 : index;
}

/**
 * Orders placed in this browser session. A stand-in for the .NET orders API —
 * `getPlacedOrder` is the only thing pages call, so swapping in a real fetch
 * is a one-file change.
 */
const SESSION_KEY = "mojjo.orders.v1";

export function savePlacedOrder(order: Order): void {
  if (typeof window === "undefined") return;
  try {
    const existing = readPlacedOrders();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...existing, [order.id]: order }));
  } catch {
    // Storage unavailable — the confirmation screen still renders from state.
  }
}

export function readPlacedOrders(): Record<string, Order> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Order>) : {};
  } catch {
    return {};
  }
}

export function getPlacedOrder(id: string): Order | undefined {
  return readPlacedOrders()[id];
}

/** `MJ` + 5 digits, matching the format used across the mock data. */
export function generateOrderId(): string {
  return `MJ${Math.floor(10_000 + Math.random() * 89_999)}`;
}
