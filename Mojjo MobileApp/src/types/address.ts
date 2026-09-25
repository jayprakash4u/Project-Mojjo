export type AddressLabel = 'Home' | 'Work' | 'Other';

export interface Address {
  id: string;
  label: AddressLabel;
  customLabel?: string;
  recipientName: string;
  phoneNumber: string;
  streetAddress: string; // e.g. "Jhamsikhel Rd, Ward 3"
  area: string; // e.g. "Jhamsikhel", "Sanepa", "Pulchowk"
  city: string; // e.g. "Lalitpur", "Kathmandu", "Bhaktapur"
  landmark?: string; // e.g. "Near St. Xavier's School"
  deliveryInstructions?: string; // e.g. "Ring bell twice, leave at gate"
  isDefault: boolean;
  isServiceable: boolean;
  etaMinutes: number;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  city: string;
  standardEtaMinutes: number;
  expressEtaMinutes: number;
  isExpressAvailable: boolean;
  isRestricted: boolean;
  restrictionReason?: string;
}

export interface ServiceabilityCheckResult {
  isServiceable: boolean;
  areaName: string;
  cityName: string;
  etaMinutes: number;
  isExpressAvailable: boolean;
  isRestricted: boolean;
  message: string;
}
