"use client";

import * as React from "react";

/**
 * Open/close state for a popover anchored to a trigger: closes on outside
 * pointer-down, on Escape, and when focus leaves the container entirely.
 *
 * The search box, the notification bell and the account menu each grew their
 * own copy of this; this is the one implementation they now share.
 */
export function useDismissable<T extends HTMLElement = HTMLDivElement>(
  initial = false,
): {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  close: () => void;
  toggle: () => void;
  containerRef: React.RefObject<T | null>;
} {
  const [open, setOpen] = React.useState(initial);
  const containerRef = React.useRef<T>(null);

  const close = React.useCallback(() => setOpen(false), []);
  const toggle = React.useCallback(() => setOpen((current) => !current), []);

  React.useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      // Return focus to the trigger so the tab order doesn't reset.
      containerRef.current?.querySelector<HTMLElement>("[data-dismissable-trigger]")?.focus();
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, [open]);

  return { open, setOpen, close, toggle, containerRef };
}
