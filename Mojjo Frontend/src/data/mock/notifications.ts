import type { Notification } from "@/types";

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

export const initialNotifications: Notification[] = [
  {
    id: "n1",
    kind: "out_for_delivery",
    title: "Your order is out for delivery",
    description: "Order #MJ10245 will arrive in about 25 minutes.",
    createdAt: minutesAgo(5),
    read: false,
    href: "/orders/MJ10245",
  },
  {
    id: "n2",
    kind: "reward",
    title: "You earned 45 Mojjo coins",
    description: "Coins from order #MJ10245 have been added to your balance.",
    createdAt: minutesAgo(62),
    read: false,
    href: "/rewards",
  },
  {
    id: "n3",
    kind: "order_placed",
    title: "Order confirmed",
    description: "We have received order #MJ10238 and started preparing it.",
    createdAt: minutesAgo(190),
    read: false,
    href: "/orders/MJ10238",
  },
  {
    id: "n4",
    kind: "delivered",
    title: "Order delivered",
    description: "Order #MJ10212 was delivered yesterday evening.",
    createdAt: minutesAgo(1_500),
    read: true,
    href: "/orders/MJ10212",
  },
];
