export type DeliveryStep =
  | 'idle'
  | 'incoming_request'
  | 'navigating_to_store'
  | 'verifying_at_store'
  | 'out_for_delivery'
  | 'arrived_at_customer'
  | 'delivered';

export type DoorstepPaymentMode = 'cash' | 'qr_online' | 'split';

export interface DeliveryItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  price: number;
  category: string;
  isVerified?: boolean;
  image?: string;
}

export interface ActiveDeliveryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: 'COD' | 'eSewa' | 'Khalti' | 'PayOnDelivery';
  paymentStatus: 'Pending' | 'Completed';
  totalAmountNpr: number;
  
  // Earnings Breakdown
  basePayNpr: number;
  distancePayNpr: number;
  surgePayNpr: number;
  tipNpr: number;
  totalRiderEarningNpr: number;

  distanceToStoreKm: number;
  distanceToCustomerKm: number;
  totalDistanceKm: number;
  estimatedTimeMins: number;
  slaDeadlineMins: number;
  
  darkStoreHub: {
    id: string;
    name: string;
    address: string;
    landmark: string;
    phone: string;
    latitude: number;
    longitude: number;
  };
  
  deliveryAddress: {
    street: string;
    area: string;
    city: string;
    landmark: string;
    houseNumber: string;
    gateInstructions: string;
    latitude: number;
    longitude: number;
  };

  items: DeliveryItem[];
  currentStep: DeliveryStep;
  otpCode: string;
  bagSealCode: string;
  requiresAgeCheck: boolean;
  createdAt: string;

  doorstepPayment?: {
    mode: DoorstepPaymentMode;
    cashCollectedNpr: number;
    changeGivenNpr: number;
    qrAmountNpr: number;
    qrRefNumber: string;
    isAgeVerified: boolean;
    customerSignature?: string;
  };
}

export interface RiderProfile {
  id: string;
  name: string;
  phone: string;
  rating: number;
  totalTrips: number;
  onTimeRatePercent: number;
  acceptanceRatePercent: number;
  vehicleType: string;
  vehicleNumber: string;
  currentHub: string;
  isOnline: boolean;
  batteryLevel: number;
  gpsAccuracy: string;
  todayEarningsNpr: number;
  cashInHandNpr: number;
  cashLimitNpr: number;
  digitalCollectedNpr: number;
}
