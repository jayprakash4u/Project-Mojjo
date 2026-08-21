"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AccountPageHeading } from "@/components/account/page-heading";
import { useToast } from "@/components/ui/toast";
import { currentUser } from "@/data/mock/user";
import { validateName, validatePhone } from "@/lib/validation";

export function ProfileForm() {
  const { toast } = useToast();

  const [fullName, setFullName] = React.useState(currentUser.fullName);
  const [phone, setPhone] = React.useState(currentUser.phone);
  const [errors, setErrors] = React.useState<{ fullName?: string; phone?: string }>({});
  const [saving, setSaving] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors: typeof errors = {};
    const nameError = validateName(fullName);
    if (nameError) nextErrors.fullName = nameError;
    const phoneError = validatePhone(phone);
    if (phoneError) nextErrors.phone = phoneError;

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setSaving(false);

    toast({ title: "Profile updated", variant: "success" });
  };

  return (
    <div>
      <AccountPageHeading
        title="Profile"
        description="How we address you, and how the rider reaches you."
      />

      <form onSubmit={handleSubmit} noValidate className="flex max-w-lg flex-col gap-4">
        <Input
          label="Full name"
          autoComplete="name"
          value={fullName}
          onValueChange={(value) => {
            setFullName(value);
            setErrors((current) => ({ ...current, fullName: undefined }));
          }}
          error={errors.fullName}
        />

        <Input
          label="Phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          value={phone}
          onValueChange={(value) => {
            setPhone(value);
            setErrors((current) => ({ ...current, phone: undefined }));
          }}
          error={errors.phone}
        />

        <Input
          label="Email"
          type="email"
          value={currentUser.email}
          readOnly
          disabled
          helperText="Contact support to change the email on your account."
        />

        <Button type="submit" loading={saving} className="self-start">
          Save changes
        </Button>
      </form>
    </div>
  );
}
