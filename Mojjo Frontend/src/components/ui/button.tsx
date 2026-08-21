import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Exported so links can be styled as buttons without a polymorphic `asChild`
 * indirection: `<Link className={buttonVariants({ variant: "outline" })} />`.
 */
export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md",
    "text-sm font-medium select-none",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out",
    "active:scale-[0.985]",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary shadow-xs hover:bg-primary-hover hover:shadow-sm",
        secondary:
          "bg-secondary text-on-secondary shadow-xs hover:bg-secondary-hover hover:shadow-sm",
        accent: "bg-accent text-on-accent shadow-xs hover:bg-accent-hover hover:shadow-sm",
        outline:
          "border border-border-strong bg-surface text-foreground hover:border-secondary hover:text-secondary",
        ghost: "text-foreground hover:bg-surface-sunken",
        subtle: "bg-secondary-soft text-secondary hover:bg-secondary hover:text-on-secondary",
        destructive: "bg-error text-white shadow-xs hover:brightness-110",
        link: "text-secondary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-9 rounded-md px-3 text-xs",
        md: "h-11 px-5",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-9 w-9",
      },
      full: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "color">,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  /** Announced to screen readers while `loading` is true. */
  loadingLabel?: string;
}

export function Button({
  className,
  variant,
  size,
  full,
  loading = false,
  loadingLabel = "Working…",
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size, full }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <LoaderCircle className="animate-spin" aria-hidden="true" />}
      {loading && <span className="sr-only">{loadingLabel}</span>}
      {children}
    </button>
  );
}
