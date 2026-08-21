import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

/**
 * The brand lockup. A single component so the mark stays identical in the
 * header, footer, mobile menu and auth screens.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-display font-semibold tracking-tight text-foreground",
        className,
      )}
    >
      {siteConfig.name}
      <span className="text-accent">.</span>
    </span>
  );
}
