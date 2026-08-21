export const CURRENCY = "NPR" as const;
export const LOCALE = "en-NP" as const;

const priceFormatter = new Intl.NumberFormat(LOCALE, {
  maximumFractionDigits: 0,
});

/** `NPR 8,500` — the single place prices get rendered. */
export function formatPrice(amount: number): string {
  return `${CURRENCY} ${priceFormatter.format(amount)}`;
}

const compactFormatter = new Intl.NumberFormat(LOCALE, {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCount(value: number): string {
  return value >= 10_000 ? compactFormatter.format(value) : priceFormatter.format(value);
}

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

export function formatDate(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return Number.isNaN(date.getTime()) ? "" : dateFormatter.format(date);
}

export function formatDateTime(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return Number.isNaN(date.getTime()) ? "" : dateTimeFormatter.format(date);
}

/** `1 item` / `3 items` — avoids the `s` ternary repeated across the app. */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
