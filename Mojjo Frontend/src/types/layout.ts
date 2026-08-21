export type NavLink = {
  label: string;
  href: string;
  active?: boolean;
};

export type NavbarProps = {
  brand?: string;
  links?: NavLink[];
  cartCount?: number;
  wishlistCount?: number;
  onSearchClick?: () => void;
  onAccountClick?: () => void;
  onWishlistClick?: () => void;
};

export type FooterLink = {
  label: string;
  href: string;
};

export type FooterSection = {
  title: string;
  links: FooterLink[];
};

export type SocialLink = {
  platform: string;
  href: string;
};

export type FooterProps = {
  brand?: string;
  description?: string;
  sections?: FooterSection[];
  socialLinks?: SocialLink[];
};
