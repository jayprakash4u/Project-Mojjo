"use client";

import * as React from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "@/components/notifications/notification-item";
import { initialNotifications } from "@/data/mock/notifications";
import type { Notification } from "@/types";
import { useDismissable } from "@/hooks/use-dismissable";
import { cn } from "@/lib/utils";

/**
 * One popover for every breakpoint — full width on small screens, anchored to
 * the bell on large ones. The previous version rendered a desktop panel *and*
 * a mobile sheet simultaneously, so both opened at once on desktop.
 */
export function NotificationButton() {
  const [notifications, setNotifications] = React.useState<Notification[]>(initialNotifications);
  const { open, toggle, containerRef } = useDismissable<HTMLDivElement>();
  const panelId = React.useId();

  const unreadCount = notifications.filter((item) => !item.read).length;

  const markRead = React.useCallback((id: string) => {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }, []);

  const markAllRead = () =>
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        data-dismissable-trigger
        onClick={toggle}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        className="relative"
      >
        <Bell />
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 grid min-w-4.5 place-items-center rounded-full bg-secondary px-1 text-2xs font-bold text-on-secondary"
            data-numeric
          >
            {unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Notifications"
          className={cn(
            "absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))]",
            "overflow-hidden rounded-xl border border-border bg-surface-raised shadow-lg animate-scale-in",
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-medium text-secondary underline-offset-4 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <BellOff className="size-6 text-subtle" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">You&apos;re all caught up</p>
              <p className="text-xs text-muted">New order updates will show up here.</p>
            </div>
          ) : (
            <ul className="max-h-[24rem] overflow-y-auto overscroll-contain p-1.5">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <NotificationItem notification={notification} onRead={markRead} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
