"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

const pad = (value: number) => String(value).padStart(2, "0");

/** Milliseconds until the next local midnight. */
function msUntilEndOfDay(now: Date): number {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

function format(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Counts down to midnight. Rendered only after hydration — the value differs
 * between server and client by definition, so there is nothing useful to
 * prerender, and gating it avoids a hydration mismatch.
 */
export function CountdownPill({ className }: { className?: string }) {
  const hydrated = useHydrated();
  const [remaining, setRemaining] = React.useState(() => msUntilEndOfDay(new Date()));

  React.useEffect(() => {
    const timer = setInterval(() => setRemaining(msUntilEndOfDay(new Date())), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!hydrated) {
    // Reserve the same box so the panel doesn't shift when the timer appears.
    return <span className={cn("block h-7", className)} aria-hidden="true" />;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-foreground",
        className,
      )}
    >
      <Clock className="size-3.5 text-primary" aria-hidden="true" />
      <span className="text-muted">Ends in</span>
      <time className="font-semibold" data-numeric>
        {format(remaining)}
      </time>
    </span>
  );
}
