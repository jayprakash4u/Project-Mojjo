"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Fires once the last box is filled, so the form can submit itself. */
  onComplete?: (value: string) => void;
  length?: number;
  error?: boolean;
  label?: string;
  autoFocus?: boolean;
}

/**
 * Segmented one-time-code field.
 *
 * The boxes are real inputs so password managers and SMS autofill work, but
 * they behave as one control: typing advances, backspace on an empty box steps
 * back, and pasting a full code fills every box at once.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  error = false,
  label = "One-time code",
  autoFocus = false,
}: OtpInputProps) {
  const inputsRef = React.useRef<(HTMLInputElement | null)[]>([]);
  const groupId = React.useId();

  const focusBox = (index: number) => {
    inputsRef.current[Math.max(0, Math.min(index, length - 1))]?.focus();
  };

  const commit = (next: string) => {
    onChange(next);
    if (next.length === length) onComplete?.(next);
  };

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return;

    // Writing into the middle replaces from that position onwards.
    const next = (value.slice(0, index) + digits).slice(0, length);
    commit(next);
    focusBox(index + digits.length);
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (value[index]) {
        commit(value.slice(0, index) + value.slice(index + 1));
      } else if (index > 0) {
        commit(value.slice(0, index - 1));
        focusBox(index - 1);
      }
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusBox(index + 1);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!digits) return;
    commit(digits);
    focusBox(digits.length);
  };

  return (
    <div role="group" aria-labelledby={groupId} className="flex flex-col gap-2">
      <span id={groupId} className="text-sm font-medium text-foreground">
        {label}
      </span>

      <div className="flex gap-2">
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(element) => {
              inputsRef.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            // Only the first box carries the autofill hint, or browsers try to
            // put the whole code into every box.
            autoComplete={index === 0 ? "one-time-code" : "off"}
            autoFocus={autoFocus && index === 0}
            maxLength={length}
            value={value[index] ?? ""}
            aria-label={`Digit ${index + 1} of ${length}`}
            aria-invalid={error || undefined}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            onFocus={(event) => event.target.select()}
            className={cn(
              "h-12 w-full min-w-0 rounded-lg border bg-surface text-center text-lg font-semibold text-foreground",
              "transition-[border-color,box-shadow] duration-200",
              "focus-visible:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/35",
              error ? "border-error" : "border-border hover:border-border-strong",
            )}
            data-numeric
          />
        ))}
      </div>
    </div>
  );
}
