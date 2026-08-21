export type DeliveryArea = {
  id: string;
  name: string;
  city: string;
  /** Minutes to the door from the nearest partner store. */
  etaMinutes: number;
};

/** Serviceable areas. The .NET backend will own this list and its coverage. */
export const deliveryAreas: DeliveryArea[] = [
  { id: "jhamsikhel", name: "Jhamsikhel", city: "Lalitpur", etaMinutes: 35 },
  { id: "pulchowk", name: "Pulchowk", city: "Lalitpur", etaMinutes: 35 },
  { id: "patan-dhoka", name: "Patan Dhoka", city: "Lalitpur", etaMinutes: 40 },
  { id: "thamel", name: "Thamel", city: "Kathmandu", etaMinutes: 30 },
  { id: "durbarmarg", name: "Durbar Marg", city: "Kathmandu", etaMinutes: 30 },
  { id: "baluwatar", name: "Baluwatar", city: "Kathmandu", etaMinutes: 40 },
  { id: "hattisar", name: "Hattisar", city: "Kathmandu", etaMinutes: 35 },
  { id: "chabahil", name: "Chabahil", city: "Kathmandu", etaMinutes: 45 },
  { id: "kageshwori", name: "Kageshwori Manohara", city: "Kathmandu", etaMinutes: 55 },
  { id: "budhanilkantha", name: "Budhanilkantha", city: "Kathmandu", etaMinutes: 55 },
];

export function getArea(id: string): DeliveryArea | undefined {
  return deliveryAreas.find((area) => area.id === id);
}
