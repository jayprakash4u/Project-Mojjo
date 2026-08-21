import * as React from "react";
import Link from "next/link";
import { Wordmark } from "@/components/layout/wordmark";
import { AuthIllustration } from "@/components/auth/auth-illustration";
import { siteConfig } from "@/config/site";

export interface AuthLayoutProps {
  /** Headline on the coloured panel, e.g. "Looks like you're new here!". */
  panelTitle: string;
  panelSubtitle: string;
  children: React.ReactNode;
}

/**
 * The split auth card marketplaces use: a coloured brand panel carrying the
 * message, and a deliberately sparse form beside it. Keeping the panel and the
 * form in one component stops login and signup drifting apart.
 */
export function AuthLayout({ panelTitle, panelSubtitle, children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10">
      <Link
        href="/"
        className="mb-6 rounded-sm"
        aria-label={`${siteConfig.name} home`}
      >
        <Wordmark className="text-2xl" />
      </Link>

      <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
        <div className="grid md:grid-cols-[minmax(0,40%)_minmax(0,1fr)]">
          <div className="on-ink flex flex-col justify-between gap-8 bg-background p-8 text-foreground">
            <div className="flex flex-col gap-3">
              <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-foreground text-balance">
                {panelTitle}
              </h1>
              <p className="text-sm leading-relaxed text-muted">{panelSubtitle}</p>
            </div>

            <AuthIllustration className="hidden w-full max-w-[15rem] self-center md:block" />
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
