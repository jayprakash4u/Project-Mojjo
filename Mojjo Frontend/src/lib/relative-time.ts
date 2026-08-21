import { LOCALE } from "@/lib/format";

const relativeFormatter = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60_000],
  ["month", 30 * 24 * 60 * 60_000],
  ["week", 7 * 24 * 60 * 60_000],
  ["day", 24 * 60 * 60_000],
  ["hour", 60 * 60_000],
  ["minute", 60_000],
];

/** "5 minutes ago", "yesterday" — via Intl rather than hand-written strings. */
export function formatRelativeTime(input: string | Date, now: Date = new Date()): string {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "";

  const delta = date.getTime() - now.getTime();
  const magnitude = Math.abs(delta);

  for (const [unit, ms] of UNITS) {
    if (magnitude >= ms) {
      return relativeFormatter.format(Math.round(delta / ms), unit);
    }
  }
  return "just now";
}
