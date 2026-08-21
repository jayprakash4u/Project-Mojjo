"use client";

import Link from "next/link";
import type { Route } from "next";
import {
  Bell,
  ChevronDown,
  CircleHelp,
  Coins,
  Heart,
  LogOut,
  MapPin,
  Package,
  User,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useDismissable } from "@/hooks/use-dismissable";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const menuItems: { label: string; href: Route; icon: React.ElementType }[] = [
  { label: "My profile", href: "/account/profile", icon: User },
  { label: "Orders", href: "/account/orders", icon: Package },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "Mojjo rewards", href: "/rewards", icon: Coins },
  { label: "Saved addresses", href: "/account/addresses", icon: MapPin },
  { label: "Notification preferences", href: "/account/settings", icon: Bell },
  { label: "Help & support", href: "/account/help", icon: CircleHelp },
];

/**
 * The account dropdown marketplaces put behind the header's person icon:
 * a sign-up prompt for new customers, then the account destinations.
 */
export function AccountMenu() {
  const { open, toggle, close, containerRef } = useDismissable<HTMLDivElement>();
  const { toast } = useToast();

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        data-dismissable-trigger
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "flex h-10 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-foreground",
          "transition-colors hover:bg-surface-sunken",
        )}
      >
        <User className="size-4 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">Account</span>
        <ChevronDown
          className={cn(
            "hidden size-3.5 text-muted transition-transform duration-200 sm:block",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account"
          className={cn(
            "absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl",
            "border border-border bg-surface-raised shadow-lg animate-scale-in",
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <span className="text-sm text-muted">New customer?</span>
            <Link
              href="/signup"
              onClick={close}
              className="text-sm font-semibold text-secondary underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </div>

          <ul className="py-1.5">
            {menuItems.map(({ label, href, icon: Icon }) => (
              <li key={href + label} role="none">
                <Link
                  href={href}
                  role="menuitem"
                  onClick={close}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-surface-sunken"
                >
                  <Icon className="size-4 shrink-0 text-muted" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="border-t border-border p-2">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                close();
                toast({
                  title: "Signed out",
                  description: "Authentication arrives with the backend.",
                });
              }}
              className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-error transition-colors hover:bg-error-soft"
            >
              <LogOut className="size-4 shrink-0" aria-hidden="true" />
              Log out
            </button>
          </div>

          <div className="border-t border-border p-3">
            <Link
              href="/login"
              onClick={close}
              className={buttonVariants({ variant: "outline", size: "sm", full: true })}
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
