import { BadgeCheck, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Section } from "@/components/common/section";

const reasons = [
  {
    icon: Truck,
    title: "45-minute delivery",
    description: "Riders leave the moment your order is confirmed, from the store nearest you.",
  },
  {
    icon: BadgeCheck,
    title: "Licensed stores only",
    description: "Every partner is a licensed retailer, so what arrives is what you ordered.",
  },
  {
    icon: ShieldCheck,
    title: "Verified at the door",
    description: "ID is checked on delivery for age-restricted items — no exceptions.",
  },
  {
    icon: Sparkles,
    title: "Coins on every order",
    description: "Earn Mojjo coins as you shop and put them straight towards the next round.",
  },
];

export function WhyMojjo() {
  return (
    <Section
      align="center"
      title="Why people order with Mojjo"
      description="A short list, and we hold ourselves to all four."
    >
      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map(({ icon: Icon, title, description }) => (
          <li key={title} className="flex flex-col items-center gap-4 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-secondary-soft text-secondary">
              <Icon className="size-7" strokeWidth={1.5} aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted">{description}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
