import type { Metadata } from "next";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { AccountPageHeading } from "@/components/account/page-heading";
import { FaqAccordion } from "@/components/account/faq-accordion";
import { AGE_NOTICE } from "@/config/site";

export const metadata: Metadata = {
  title: "Help & support",
  description: "Answers to common questions about ordering, delivery and payment on Mojjo.",
};

const channels = [
  {
    icon: Phone,
    label: "Call us",
    detail: "+977 1 4000000",
    href: "tel:+97714000000",
    note: "9am – 11pm, every day",
  },
  {
    icon: MessageCircle,
    label: "Chat",
    detail: "Start a chat",
    href: "#",
    note: "Typical reply under 5 minutes",
  },
  {
    icon: Mail,
    label: "Email",
    detail: "help@mojjo.example",
    href: "mailto:help@mojjo.example",
    note: "We reply within one working day",
  },
];

export default function HelpPage() {
  return (
    <div>
      <AccountPageHeading
        title="Help & support"
        description="Most questions are answered below. If not, we're a call away."
      />

      <ul className="mb-10 grid gap-3 sm:grid-cols-3">
        {channels.map(({ icon: Icon, label, detail, href, note }) => (
          <li key={label}>
            <a
              href={href}
              className="flex h-full flex-col gap-1 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-secondary"
            >
              <Icon className="mb-1 size-5 text-secondary" aria-hidden="true" />
              <span className="text-sm font-medium text-foreground">{label}</span>
              <span className="text-sm text-secondary">{detail}</span>
              <span className="text-xs text-subtle">{note}</span>
            </a>
          </li>
        ))}
      </ul>

      <FaqAccordion />

      <p className="mt-10 rounded-lg bg-warning-soft px-4 py-3 text-xs leading-relaxed text-warning">
        {AGE_NOTICE}
      </p>
    </div>
  );
}
