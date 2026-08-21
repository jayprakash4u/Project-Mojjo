"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryParams } from "@/hooks/use-query-params";
import { cn } from "@/lib/utils";

export interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
}

/** Builds `1 … 4 5 6 … 12` with no duplicates and no stray ellipses. */
function pageItems(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages = new Set<number>([1, total, current]);
  if (current - 1 > 1) pages.add(current - 1);
  if (current + 1 < total) pages.add(current + 1);
  if (current <= 3) pages.add(2).add(3).add(4);
  if (current >= total - 2) pages.add(total - 1).add(total - 2).add(total - 3);

  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);

  return sorted.flatMap((page, index) =>
    index > 0 && page - sorted[index - 1] > 1 ? ["gap" as const, page] : [page],
  );
}

export function ProductPagination({ currentPage, totalPages }: ProductPaginationProps) {
  const { setParams } = useQueryParams();

  if (totalPages <= 1) return null;

  const goTo = (page: number) => {
    setParams({ page: page === 1 ? undefined : String(page) }, { resetPage: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft aria-hidden="true" />
      </Button>

      <ul className="hidden items-center gap-1 sm:flex">
        {pageItems(currentPage, totalPages).map((item, index) =>
          item === "gap" ? (
            <li key={`gap-${index}`} aria-hidden="true" className="px-1.5 text-sm text-subtle">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                onClick={() => goTo(item)}
                aria-current={item === currentPage ? "page" : undefined}
                aria-label={`Page ${item}`}
                className={cn(
                  "grid size-9 place-items-center rounded-md text-sm font-medium transition-colors",
                  item === currentPage
                    ? "bg-secondary text-on-secondary"
                    : "text-foreground hover:bg-surface-sunken",
                )}
                data-numeric
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>

      <span className="px-2 text-sm text-muted sm:hidden" data-numeric>
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight aria-hidden="true" />
      </Button>
    </nav>
  );
}
