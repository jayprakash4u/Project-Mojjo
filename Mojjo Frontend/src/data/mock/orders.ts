import type { Order } from "@/types";
import { products } from "@/data/mock/products";

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

function lineItem(slug: string, quantity: number) {
  const product = products.find((item) => item.slug === slug);
  if (!product) throw new Error(`Mock order references unknown product: ${slug}`);
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    price: product.price,
    quantity,
    image: product.image,
  };
}

const address = {
  fullName: "Aarav Sharma",
  phone: "9812345678",
  address: "Jhamsikhel, Lalitpur — house 14, second floor",
  landmark: "Opposite the corner bakery",
};

/**
 * Historical orders. Reads its line items from the catalogue so prices and
 * images can never drift away from the products they reference.
 */
export const mockOrders: Order[] = [
  {
    id: "MJ10245",
    status: "out_for_delivery",
    items: [lineItem("premium-single-malt-whisky", 1), lineItem("classic-potato-chips", 2)],
    address,
    deliveryMethod: "standard",
    paymentMethod: "cod",
    subtotal: 8800,
    deliveryFee: 0,
    total: 8800,
    earnedCoins: 45,
    createdAt: hoursAgo(1),
    estimatedArrival: new Date(Date.now() + 25 * 60_000).toISOString(),
  },
  {
    id: "MJ10238",
    status: "preparing",
    items: [lineItem("craft-ipa-beer-pack", 1), lineItem("spiced-peanut-masala", 1)],
    address,
    deliveryMethod: "express",
    paymentMethod: "esewa",
    subtotal: 2020,
    deliveryFee: 150,
    total: 2170,
    earnedCoins: 10,
    createdAt: hoursAgo(3),
  },
  {
    id: "MJ10212",
    status: "delivered",
    items: [lineItem("reserve-red-wine", 2), lineItem("dark-chocolate-bar", 1)],
    address,
    deliveryMethod: "standard",
    paymentMethod: "cod",
    subtotal: 8750,
    deliveryFee: 0,
    total: 8750,
    earnedCoins: 44,
    createdAt: hoursAgo(30),
  },
  {
    id: "MJ10190",
    status: "delivered",
    items: [lineItem("london-dry-gin", 1), lineItem("indian-tonic-water", 2)],
    address,
    deliveryMethod: "standard",
    paymentMethod: "khalti",
    subtotal: 4160,
    deliveryFee: 0,
    total: 4160,
    earnedCoins: 21,
    createdAt: hoursAgo(120),
  },
  {
    id: "MJ10154",
    status: "cancelled",
    items: [lineItem("aged-dark-rum", 1)],
    address,
    deliveryMethod: "standard",
    paymentMethod: "cod",
    subtotal: 5500,
    deliveryFee: 0,
    total: 5500,
    earnedCoins: 0,
    createdAt: hoursAgo(200),
  },
];

export function getMockOrder(id: string): Order | undefined {
  return mockOrders.find((order) => order.id === id);
}
