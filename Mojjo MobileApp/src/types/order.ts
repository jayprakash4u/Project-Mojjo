export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'OutForDelivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';

export interface DeliveryAddress {
  id?: string;
  label?: string; // e.g., "Home", "Work"
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  area: string; // e.g. "Jhamsikhel, Lalitpur" or "Baneshwor, Kathmandu"
  city: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  deliveryInstructions?: string;
  isDefault?: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CourierInfo {
  id: string;
  name: string;
  phoneNumber: string;
  vehicleType?: string;
  vehicleNumber?: string;
  currentLatitude?: number;
  currentLongitude?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: 'eSewa' | 'Khalti' | 'COD' | 'Fonepay';
  paymentStatus: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  deliveryAddress: DeliveryAddress;
  estimatedDeliveryMinutes?: number;
  courier?: CourierInfo;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

export interface CreateOrderRequest {
  items: { productId: string; quantity: number }[];
  deliveryAddress: DeliveryAddress;
  paymentMethod: 'eSewa' | 'Khalti' | 'COD' | 'Fonepay';
  notes?: string;
  coinsToRedeem?: number;
}
