import type { OrderStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS } from "@/lib/orders";

const statusVariants: Record<OrderStatus, "info" | "warning" | "secondary" | "success" | "danger"> =
  {
    confirmed: "info",
    preparing: "warning",
    out_for_delivery: "secondary",
    delivered: "success",
    cancelled: "danger",
  };

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={statusVariants[status]}>{ORDER_STATUS_LABELS[status]}</Badge>;
}
