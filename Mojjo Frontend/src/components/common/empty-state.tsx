import * as React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  tone?: "neutral" | "error";
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "neutral",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border px-6 py-16 text-center",
        className,
      )}
    >
      {Icon && (
        <span
          className={cn(
            "grid size-14 place-items-center rounded-full",
            tone === "error" ? "bg-error-soft text-error" : "bg-surface-sunken text-subtle",
          )}
        >
          <Icon className="size-6" aria-hidden="true" />
        </span>
      )}

      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="max-w-sm text-sm leading-relaxed text-muted">{description}</p>
        )}
      </div>

      {action}
    </div>
  );
}
