import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SectionProps extends Omit<React.ComponentPropsWithoutRef<"section">, "title"> {
  title?: string;
  description?: string;
  /** Small label above the title, e.g. "The weekend collection". */
  eyebrow?: string;
  action?: { label: string; href: Route };
  align?: "start" | "center";
  /**
   * `card` is the marketplace band — a white panel on the page background, with
   * its own header rule. `plain` and `ink` are full-bleed colour bands.
   */
  variant?: "card" | "plain" | "ink";
  headingLevel?: "h2" | "h3";
  /** Removes the inner padding so a rail can bleed to the panel edge. */
  flush?: boolean;
}

/**
 * The band every page section sits in. Replaces the copy-pasted
 * `<section className="bg-… py-16"><div className="mx-auto max-w-7xl …">`
 * that used to open each home-page component.
 */
export function Section({
  title,
  description,
  eyebrow,
  action,
  align = "start",
  variant = "card",
  headingLevel: Heading = "h2",
  flush = false,
  className,
  children,
  ...props
}: SectionProps) {
  const hasHeader = Boolean(title || description || eyebrow || action);

  const header = hasHeader && (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        variant === "card" ? "mb-5" : "mb-8 sm:mb-10",
      )}
    >
      <div className={cn("flex flex-col gap-1.5", align === "center" && "items-center")}>
        {eyebrow && (
          <span className="text-2xs font-semibold uppercase tracking-widest text-accent">
            {eyebrow}
          </span>
        )}
        {title && (
          <Heading
            className={cn(
              "font-display font-semibold tracking-tight text-foreground text-balance",
              variant === "card" ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl",
            )}
          >
            {title}
          </Heading>
        )}
        {description && (
          <p className="max-w-xl text-sm leading-relaxed text-muted">{description}</p>
        )}
      </div>

      {action && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-secondary underline-offset-4 hover:underline"
        >
          {action.label}
          <ArrowRight
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      )}
    </div>
  );

  if (variant === "card") {
    return (
      <section className={cn("pt-3 sm:pt-4", className)} {...props}>
        <div className="container-page">
          <div
            className={cn(
              "rounded-xl border border-border bg-surface shadow-xs",
              flush ? "py-5 sm:py-6" : "p-5 sm:p-6",
            )}
          >
            <div className={cn(flush && "px-5 sm:px-6")}>{header}</div>
            {children}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn("section-y", variant === "ink" ? "on-ink bg-background text-foreground" : "bg-surface", className)}
      {...props}
    >
      <div className="container-page">
        {header}
        {children}
      </div>
    </section>
  );
}
