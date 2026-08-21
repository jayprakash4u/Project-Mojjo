import type { Route } from "next";

/**
 * Single source of truth for chrome that used to be pasted into every page:
 * brand identity, primary navigation and footer columns.
 */

export const siteConfig = {
  name: "Mojjo",
  tagline: "Premium drinks delivered to you.",
  description:
    "Order whisky, wine, beer, cigarettes, snacks and mixers from Mojjo and have them delivered to your door.",
  url: "https://mojjo.example",
  locale: "en_NP",
} as const;

export type NavItem = {
  label: string;
  href: Route;
  description?: string;
};

export const mainNav: NavItem[] = [
  { label: "Shop all", href: "/products" },
  { label: "Alcohol", href: "/categories/alcohol" },
  { label: "Cigarettes", href: "/categories/cigarettes" },
  { label: "Snacks", href: "/categories/snacks" },
  { label: "Cold Drinks", href: "/categories/cold-drinks" },
  { label: "Rewards", href: "/rewards" },
];

export const footerNav: { title: string; links: NavItem[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/products" },
      { label: "Whisky", href: "/categories/alcohol/whisky" },
      { label: "Wine", href: "/categories/alcohol/wine" },
      { label: "Beer", href: "/categories/alcohol/beer" },
      { label: "Cold drinks", href: "/categories/cold-drinks" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "My profile", href: "/account/profile" },
      { label: "My orders", href: "/account/orders" },
      { label: "Saved addresses", href: "/account/addresses" },
      { label: "Mojjo rewards", href: "/rewards" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help centre", href: "/account/help" },
      { label: "Delivery information", href: "/account/help" },
      { label: "Returns & refunds", href: "/account/help" },
      { label: "Contact us", href: "/account/help" },
    ],
  },
];

export const legalNav: NavItem[] = [
  { label: "Privacy", href: "/account/help" },
  { label: "Terms", href: "/account/help" },
];

export type SocialPlatform = "instagram" | "facebook" | "x";

export const socialLinks: { platform: SocialPlatform; label: string; href: string }[] = [
  { platform: "instagram", label: "Mojjo on Instagram", href: "https://instagram.com" },
  { platform: "facebook", label: "Mojjo on Facebook", href: "https://facebook.com" },
  { platform: "x", label: "Mojjo on X", href: "https://x.com" },
];

/**
 * Regulatory notice. Alcohol and tobacco listings legally require an age
 * statement in most markets, so it lives in config rather than one component.
 */
export const AGE_NOTICE =
  "Alcohol and tobacco are sold only to customers aged 18 and over. A valid ID is required on delivery.";
