"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleHelp,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Settings,
  User,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { currentUser } from "@/data/mock/user";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/account", icon: LayoutDashboard },
  { label: "Profile", href: "/account/profile", icon: User },
  { label: "Orders", href: "/account/orders", icon: Package },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Settings", href: "/account/settings", icon: Settings },
  { label: "Help & support", href: "/account/help", icon: CircleHelp },
] as const;

export function AccountSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { toast } = useToast();

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary-soft font-semibold text-secondary"
          aria-hidden="true"
        >
          {currentUser.firstName.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{currentUser.fullName}</p>
          <p className="truncate text-xs text-muted">{currentUser.email}</p>
        </div>
      </div>

      <nav aria-label="Account" className="flex flex-col gap-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          // Exact match for the overview so it isn't active on every subpage.
          const isActive = href === "/account" ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-secondary-soft text-secondary"
                  : "text-foreground hover:bg-surface-sunken",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() =>
          toast({
            title: "Signed out",
            description: "Authentication arrives with the backend.",
          })
        }
        className="flex items-center gap-3 rounded-md border-t border-border px-3 pt-4 text-sm font-medium text-error transition-colors hover:text-error"
      >
        <LogOut className="size-4 shrink-0" aria-hidden="true" />
        Log out
      </button>
    </div>
  );
}
