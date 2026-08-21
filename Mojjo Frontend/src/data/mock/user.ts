export type SavedAddress = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  landmark?: string;
  isDefault?: boolean;
};

export const currentUser = {
  firstName: "Aarav",
  fullName: "Aarav Sharma",
  email: "aarav@example.com",
  phone: "9812345678",
  memberSince: "2026-02-14T00:00:00.000Z",
};

export const savedAddresses: SavedAddress[] = [
  {
    id: "addr-home",
    label: "Home",
    fullName: "Aarav Sharma",
    phone: "9812345678",
    address: "Jhamsikhel, Lalitpur — house 14, second floor",
    landmark: "Opposite the corner bakery",
    isDefault: true,
  },
  {
    id: "addr-office",
    label: "Office",
    fullName: "Aarav Sharma",
    phone: "9812345678",
    address: "Hattisar, Kathmandu — Sunrise Business Park, level 3",
  },
];
