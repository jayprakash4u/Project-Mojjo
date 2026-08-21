"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingCart, User } from "lucide-react";
import { mainNav, siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Sheet, SheetBody, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SearchBar } from "@/components/search/search-bar";
import { NotificationButton } from "@/components/notifications/notification-button";
import { AccountMenu } from "@/components/layout/account-menu";
import { useCart } from "@/components/cart/cart-context";
import { useWishlist } from "@/components/wishlist/wishlist-context";
import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/layout/wordmark";

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      className="absolute -right-0.5 -top-0.5 grid min-w-4.5 place-items-center rounded-full bg-accent px-1 text-2xs font-bold text-on-accent"
      data-numeric
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

/** Header action styling shared by the icon+label links and buttons. */
const actionClass =
  "relative flex h-10 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-sunken";

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  const { itemCount, openCart, hydrated: cartReady } = useCart();
  const { count: wishlistCount, hydrated: wishlistReady } = useWishlist();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  // Close the overlays when the route changes. Adjusting state during render
  // on a changed input is React's documented alternative to a reset effect.
  const [lastPathname, setLastPathname] = React.useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="container-page flex h-16 items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu />
          </Button>

          <Link href="/" className="shrink-0 rounded-sm" aria-label={`${siteConfig.name} home`}>
            <Wordmark className="text-xl" />
          </Link>

          <div className="mx-2 hidden min-w-0 flex-1 lg:block">
            <SearchBar />
          </div>

          <div className="ml-auto flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSearchOpen((open) => !open)}
              aria-label="Search"
              aria-expanded={searchOpen}
            >
              <Search />
            </Button>

            <AccountMenu />

            <NotificationButton />

            <Link
              href="/wishlist"
              className={cn(actionClass, "hidden sm:flex")}
              aria-label={`Wishlist${wishlistReady && wishlistCount > 0 ? `, ${wishlistCount} saved` : ""}`}
            >
              <Heart className="size-4 shrink-0" aria-hidden="true" />
              <span className="hidden md:inline">Wishlist</span>
              {wishlistReady && <CountBadge count={wishlistCount} />}
            </Link>

            <button
              type="button"
              onClick={openCart}
              className={actionClass}
              aria-label={`Cart${cartReady && itemCount > 0 ? `, ${itemCount} items` : ", empty"}`}
            >
              <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
              <span className="hidden md:inline">Cart</span>
              {cartReady && <CountBadge count={itemCount} />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-border bg-surface p-4 lg:hidden">
            <SearchBar autoFocus layout="inline" onSubmitted={() => setSearchOpen(false)} />
          </div>
        )}
      </div>

      <Sheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        side="left"
        title="Menu"
        description="Browse categories and your account"
      >
        <SheetHeader>
          <SheetTitle>
            <Wordmark className="text-lg" />
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0">
          <nav aria-label="Mobile navigation" className="flex flex-col p-2">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-3 text-base font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-secondary-soft text-secondary"
                    : "text-foreground hover:bg-surface-sunken",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-2 flex flex-col gap-1 border-t border-border p-2">
            <Link
              href="/account"
              className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-surface-sunken"
            >
              <User className="size-4" aria-hidden="true" />
              My account
            </Link>
            <Link
              href="/wishlist"
              className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-surface-sunken"
            >
              <Heart className="size-4" aria-hidden="true" />
              Wishlist
            </Link>
          </div>
        </SheetBody>
      </Sheet>
    </header>
  );
}
