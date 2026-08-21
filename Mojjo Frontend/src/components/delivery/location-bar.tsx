"use client";

import * as React from "react";
import { ChevronRight, MapPin } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLocation } from "@/components/delivery/location-context";
import { deliveryAreas } from "@/data/mock/areas";
import { cn } from "@/lib/utils";

/**
 * The delivery-area strip above the header. Where the order is going decides
 * the ETA and whether we serve the address at all, so it is the first thing
 * on the page rather than a checkout-time surprise.
 */
export function LocationBar() {
  const { area, hydrated, setAreaId } = useLocation();
  const [open, setOpen] = React.useState(false);
  const [filter, setFilter] = React.useState("");

  const term = filter.trim().toLowerCase();
  const matches = term
    ? deliveryAreas.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(term) ||
          candidate.city.toLowerCase().includes(term),
      )
    : deliveryAreas;

  return (
    <>
      <div className="border-b border-border bg-surface-sunken">
        <div className="container-page flex h-9 items-center justify-center gap-2 text-xs">
          <MapPin className="size-3.5 shrink-0 text-muted" aria-hidden="true" />

          {/* The unset state is what most visitors see, so it is also the
              server render — only returning visitors see the text swap. */}
          {hydrated && area ? (
            <span className="truncate text-muted">
              Delivering to{" "}
              <span className="font-medium text-foreground">
                {area.name}, {area.city}
              </span>
            </span>
          ) : (
            <span className="text-muted">Location not set</span>
          )}

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex shrink-0 items-center gap-0.5 font-semibold text-secondary underline-offset-4 hover:underline"
          >
            {area ? "Change" : "Select delivery location"}
            <ChevronRight className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Where are we delivering?"
        description="Pick your area to see accurate delivery times."
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <Input
            type="search"
            label="Search areas"
            hideLabel
            placeholder="Search area or city…"
            value={filter}
            onValueChange={setFilter}
            autoFocus
          />

          {matches.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              We don&apos;t deliver to “{filter}” yet.
            </p>
          ) : (
            <ul className="-mx-1 max-h-72 overflow-y-auto">
              {matches.map((candidate) => {
                const isCurrent = candidate.id === area?.id;
                return (
                  <li key={candidate.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setAreaId(candidate.id);
                        setOpen(false);
                        setFilter("");
                      }}
                      aria-current={isCurrent}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left transition-colors",
                        isCurrent ? "bg-secondary-soft" : "hover:bg-surface-sunken",
                      )}
                    >
                      <span className="min-w-0">
                        <span
                          className={cn(
                            "block truncate text-sm font-medium",
                            isCurrent ? "text-secondary" : "text-foreground",
                          )}
                        >
                          {candidate.name}
                        </span>
                        <span className="block text-xs text-muted">{candidate.city}</span>
                      </span>

                      <span className="shrink-0 text-xs font-medium text-success" data-numeric>
                        {candidate.etaMinutes} min
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Dialog>
    </>
  );
}
