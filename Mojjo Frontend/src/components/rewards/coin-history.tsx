import type { MojjoCoinTransaction } from "@/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CoinHistory({ transactions }: { transactions: MojjoCoinTransaction[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-foreground">Coin history</h2>

      {transactions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
          No coin activity yet. Coins land here after your first order.
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          {transactions.map((transaction) => (
            <li key={transaction.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {transaction.description}
                </p>
                <time dateTime={transaction.createdAt} className="text-xs text-muted">
                  {formatDate(transaction.createdAt)}
                </time>
              </div>

              <span
                className={cn(
                  "shrink-0 text-sm font-semibold",
                  transaction.amount > 0 ? "text-success" : "text-muted",
                )}
                data-numeric
              >
                {transaction.amount > 0 ? "+" : ""}
                {transaction.amount.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
