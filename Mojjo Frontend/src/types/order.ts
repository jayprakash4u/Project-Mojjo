export type OrderStatus =
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type DeliveryMethod = "standard" | "express";
export type PaymentMethod = "cod" | "esewa" | "khalti";

export type OrderItem = {
  id: string;
  slug: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
};

export type OrderAddress = {
  fullName: string;
  phone: string;
  address: string;
  landmark?: string;
};

export type Order = {
  id: string;
  status: OrderStatus;
  items: OrderItem[];
  address: OrderAddress;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  subtotal: number;
  deliveryFee: number;
  total: number;
  earnedCoins: number;
  createdAt: string;
  /** ISO timestamp of the estimated arrival, used by the tracker. */
  estimatedArrival?: string;
};
