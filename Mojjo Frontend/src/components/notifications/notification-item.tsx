"use client";

import Link from "next/link";
import { BellRing, CircleCheckBig, Coins, PackageCheck, Truck } from "lucide-react";
import type { Notification, NotificationKind } from "@/types";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/relative-time";

const kindIcons: Record<NotificationKind, React.ElementType> = {
  order_placed: CircleCheckBig,
  out_for_delivery: Truck,
  delivered: PackageCheck,
  reward: Coins,
};

export function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (id: string) => void;
}) {
  const Icon = kindIcons[notification.kind] ?? BellRing;
  const content = (
    <>
      <span
        className={cn(
          "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full",
          notification.read ? "bg-surface-sunken text-subtle" : "bg-secondary-soft text-secondary",
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{notification.title}</span>
        <span className="text-xs leading-relaxed text-muted">{notification.description}</span>
        <time dateTime={notification.createdAt} className="mt-0.5 text-2xs text-subtle">
          {formatRelativeTime(notification.createdAt)}
        </time>
      </span>

      {!notification.read && (
        <span
          className="mt-2 size-2 shrink-0 rounded-full bg-secondary"
          aria-label="Unread"
          role="img"
        />
      )}
    </>
  );

  const className = cn(
    "flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors",
    notification.read ? "hover:bg-surface-sunken" : "bg-secondary-soft/40 hover:bg-secondary-soft",
  );

  if (!notification.href) {
    return (
      <button type="button" className={className} onClick={() => onRead(notification.id)}>
        {content}
      </button>
    );
  }

  return (
    <Link href={notification.href} className={className} onClick={() => onRead(notification.id)}>
      {content}
    </Link>
  );
}
