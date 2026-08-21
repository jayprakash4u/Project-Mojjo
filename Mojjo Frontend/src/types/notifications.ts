export type NotificationKind = "order_placed" | "out_for_delivery" | "delivered" | "reward";

export type Notification = {
  id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  /** ISO timestamp; formatted for display at render time. */
  createdAt: string;
  read: boolean;
  href?: string;
};
