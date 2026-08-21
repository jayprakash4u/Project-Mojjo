"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import type { DeliveryMethod, Order, OrderAddress, PaymentMethod } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioItem } from "@/components/ui/radio-group";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import { FreeDeliveryProgress } from "@/components/cart/free-delivery-progress";
import { useCart } from "@/components/cart/cart-context";
import { useToast } from "@/components/ui/toast";
import {
  DELIVERY_METHODS,
  PAYMENT_METHODS,
  deliveryFeeFor,
  generateOrderId,
  savePlacedOrder,
} from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { AGE_NOTICE } from "@/config/site";
import { validateName, validatePhone } from "@/lib/validation";

type FormErrors = Partial<Record<keyof OrderAddress, string>>;

function validate(address: OrderAddress): FormErrors {
  const errors: FormErrors = {};

  const nameError = validateName(address.fullName);
  if (nameError) errors.fullName = nameError;

  const phoneError = validatePhone(address.phone);
  if (phoneError) errors.phone = phoneError;

  if (!address.address.trim()) errors.address = "Enter the delivery address.";
  else if (address.address.trim().length < 8) errors.address = "Add a little more detail.";

  return errors;
}

function Fieldset({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 sm:p-6">
      <h2 className="flex items-center gap-3 text-lg font-semibold text-foreground">
        <span
          className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary-soft text-xs font-bold text-secondary"
          aria-hidden="true"
        >
          {step}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function CheckoutForm() {
  const router = useRouter();
  const { items, itemCount, subtotal, earnedCoins, clearCart } = useCart();
  const { toast } = useToast();

  const [address, setAddress] = React.useState<OrderAddress>({
    fullName: "",
    phone: "",
    address: "",
    landmark: "",
  });
  const [delivery, setDelivery] = React.useState<DeliveryMethod>("standard");
  const [payment, setPayment] = React.useState<PaymentMethod>("cod");
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitting, setSubmitting] = React.useState(false);

  const deliveryFee = deliveryFeeFor(delivery, subtotal);
  const total = subtotal + deliveryFee;

  const updateField = (field: keyof OrderAddress) => (value: string) => {
    setAddress((current) => ({ ...current, [field]: value }));
    // Clear the error as soon as the shopper starts fixing the field.
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors = validate(address);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      // Move focus to the first problem so the error is announced.
      const firstField = Object.keys(nextErrors)[0];
      document.getElementById(`checkout-${firstField}`)?.focus();
      return;
    }

    setSubmitting(true);

    const order: Order = {
      id: generateOrderId(),
      status: "confirmed",
      items: items.map(({ product, quantity }) => ({
        id: product.id,
        slug: product.slug,
        title: product.title,
        price: product.price,
        quantity,
        image: product.image,
      })),
      address,
      deliveryMethod: delivery,
      paymentMethod: payment,
      subtotal,
      deliveryFee,
      total,
      earnedCoins,
      createdAt: new Date().toISOString(),
      estimatedArrival: new Date(
        Date.now() + (delivery === "express" ? 30 : 60) * 60_000,
      ).toISOString(),
    };

    // Stands in for POST /api/orders once the .NET backend exists.
    await new Promise((resolve) => setTimeout(resolve, 900));

    savePlacedOrder(order);
    clearCart();
    toast({ title: "Order placed", description: `Order ${order.id} is confirmed.`, variant: "success" });
    router.push(`/order/success?orderId=${order.id}`);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8 lg:flex-row lg:gap-10">
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <Fieldset step={1} title="Delivery address">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="checkout-fullName"
              label="Full name"
              placeholder="Aarav Sharma"
              autoComplete="name"
              value={address.fullName}
              onValueChange={updateField("fullName")}
              error={errors.fullName}
            />
            <Input
              id="checkout-phone"
              label="Phone number"
              type="tel"
              inputMode="numeric"
              placeholder="98XXXXXXXX"
              autoComplete="tel"
              value={address.phone}
              onValueChange={updateField("phone")}
              error={errors.phone}
              helperText="The rider will call this number on arrival."
            />
          </div>

          <Textarea
            id="checkout-address"
            label="Address"
            placeholder="Street, house number, area"
            autoComplete="street-address"
            value={address.address}
            onChange={(event) => updateField("address")(event.target.value)}
            error={errors.address}
          />

          <Input
            label="Landmark (optional)"
            placeholder="Beside the pharmacy, blue gate"
            value={address.landmark ?? ""}
            onValueChange={updateField("landmark")}
          />
        </Fieldset>

        <Fieldset step={2} title="Delivery method">
          <RadioGroup
            label="Delivery method"
            value={delivery}
            onValueChange={(value) => setDelivery(value as DeliveryMethod)}
          >
            {DELIVERY_METHODS.map((method) => (
              <RadioItem
                key={method.value}
                value={method.value}
                label={method.label}
                description={method.description}
                meta={
                  deliveryFeeFor(method.value, subtotal) === 0
                    ? "Free"
                    : formatPrice(deliveryFeeFor(method.value, subtotal))
                }
                variant="card"
              />
            ))}
          </RadioGroup>
        </Fieldset>

        <Fieldset step={3} title="Payment">
          <RadioGroup
            label="Payment method"
            value={payment}
            onValueChange={(value) => setPayment(value as PaymentMethod)}
          >
            {PAYMENT_METHODS.map((method) => (
              <RadioItem
                key={method.value}
                value={method.value}
                label={method.label}
                description={method.description}
                variant="card"
              />
            ))}
          </RadioGroup>
        </Fieldset>
      </div>

      <aside className="w-full shrink-0 lg:w-96">
        <div className="flex flex-col gap-4 lg:sticky lg:top-32">
          <FreeDeliveryProgress subtotal={subtotal} />
          <CheckoutSummary deliveryFee={deliveryFee} />

          <Button type="submit" size="lg" full loading={submitting} disabled={itemCount === 0}>
            {submitting ? "Placing order…" : `Place order · ${formatPrice(total)}`}
          </Button>

          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted">
            <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            {AGE_NOTICE}
          </p>
        </div>
      </aside>
    </form>
  );
}
