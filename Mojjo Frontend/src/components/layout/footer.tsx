"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { AGE_NOTICE, footerNav, legalNav, siteConfig, socialLinks } from "@/config/site";
import { Wordmark } from "@/components/layout/wordmark";
import { SocialIcon } from "@/components/layout/social-icons";
import { cn } from "@/lib/utils";


export function Footer() {
  const [openSection, setOpenSection] = React.useState<string | null>(null);

  return (
    <footer className="on-ink bg-background text-foreground">
      <div className="container-page">
        <div className="grid gap-10 py-12 lg:grid-cols-12 lg:gap-8 lg:py-16">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block rounded-sm">
              <Wordmark className="text-2xl" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {siteConfig.description}
            </p>

            <ul className="mt-6 flex items-center gap-3">
              {socialLinks.map(({ platform, label, href }) => (
                <li key={platform}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid size-9 place-items-center rounded-full border border-border text-muted transition-colors hover:border-secondary hover:text-secondary"
                  >
                    <SocialIcon platform={platform} className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-8">
            {/* Desktop: three open columns. Mobile: the same data as accordions. */}
            <div className="hidden grid-cols-3 gap-8 lg:grid">
              {footerNav.map((section) => (
                <nav key={section.title} aria-label={section.title}>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-foreground">
                    {section.title}
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {section.links.map((link) => (
                      <li key={`${section.title}-${link.label}`}>
                        <Link
                          href={link.href}
                          className="text-sm text-muted transition-colors hover:text-secondary"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>

            <div className="border-t border-border lg:hidden">
              {footerNav.map((section) => {
                const isOpen = openSection === section.title;
                const panelId = `footer-${section.title.toLowerCase()}`;
                return (
                  <div key={section.title} className="border-b border-border">
                    <h2>
                      <button
                        type="button"
                        onClick={() => setOpenSection(isOpen ? null : section.title)}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        className="flex w-full items-center justify-between py-4 text-left"
                      >
                        <span className="text-xs font-semibold uppercase tracking-widest text-foreground">
                          {section.title}
                        </span>
                        <ChevronDown
                          className={cn(
                            "size-4 text-muted transition-transform duration-200",
                            isOpen && "rotate-180",
                          )}
                          aria-hidden="true"
                        />
                      </button>
                    </h2>
                    <div id={panelId} hidden={!isOpen}>
                      <ul className="space-y-3 pb-4">
                        {section.links.map((link) => (
                          <li key={`${section.title}-${link.label}`}>
                            <Link
                              href={link.href}
                              className="text-sm text-muted transition-colors hover:text-secondary"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <p className="border-t border-border py-6 text-xs leading-relaxed text-muted">
          {AGE_NOTICE}
        </p>

        <div className="flex flex-col gap-4 border-t border-border py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <ul className="flex items-center gap-5">
            {legalNav.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-muted transition-colors hover:text-secondary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
