"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How long does delivery take?",
    answer:
      "Standard delivery arrives in 45 to 90 minutes. Express delivery prioritises your order and typically arrives within 30 minutes, for a NPR 150 fee.",
  },
  {
    question: "Do I need to show ID?",
    answer:
      "Yes, for alcohol and cigarettes. The rider checks a government-issued ID showing you are 18 or over. Without it the age-restricted items go back to the store and are refunded.",
  },
  {
    question: "How do I pay?",
    answer:
      "Cash on delivery, eSewa or Khalti. Card payment through the app is coming with the next release.",
  },
  {
    question: "What are Mojjo coins worth?",
    answer:
      "You earn coins on every order — roughly one coin per NPR 200 spent. Coins convert to money off future orders, they never expire, and there are no tiers.",
  },
  {
    question: "Can I cancel an order?",
    answer:
      "Yes, until the store starts preparing it. After that, contact support and we will do what we can. Cancelled orders are refunded within three working days.",
  },
  {
    question: "Something arrived damaged or wrong.",
    answer:
      "Tell us within 24 hours through the order page or by calling support. We will replace the item or refund it, whichever you prefer.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-foreground">Common questions</h2>

      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          const panelId = `faq-panel-${index}`;
          const buttonId = `faq-button-${index}`;

          return (
            <div key={faq.question}>
              <h3>
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-sunken"
                >
                  <span className="text-sm font-medium text-foreground">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </button>
              </h3>

              <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen}>
                <p className="px-5 pb-4 text-sm leading-relaxed text-muted">{faq.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
