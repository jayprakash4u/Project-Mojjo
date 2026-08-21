"use client";

import * as React from "react";
import { AccountPageHeading } from "@/components/account/page-heading";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

function SettingRow({ children }: { children: React.ReactNode }) {
  return <div className="border-t border-border py-4 first:border-t-0 first:pt-0">{children}</div>;
}

export function SettingsPanel() {
  const { toast } = useToast();

  const [orderUpdates, setOrderUpdates] = React.useState(true);
  const [offers, setOffers] = React.useState(false);
  const [language, setLanguage] = React.useState("en");
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSaving(false);
    toast({ title: "Settings saved", variant: "success" });
  };

  return (
    <div>
      <AccountPageHeading title="Settings" description="Notifications, language and appearance." />

      <div className="flex max-w-lg flex-col">
        <SettingRow>
          <Switch
            label="Order updates"
            description="Push and SMS alerts when your order status changes."
            checked={orderUpdates}
            onCheckedChange={setOrderUpdates}
          />
        </SettingRow>

        <SettingRow>
          <Switch
            label="Offers and promotions"
            description="Occasional messages about discounts and new arrivals."
            checked={offers}
            onCheckedChange={setOffers}
          />
        </SettingRow>

        <SettingRow>
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">Appearance</span>
              <span className="text-xs text-muted">Light theme.</span>
            </div>
          </div>
        </SettingRow>

        <SettingRow>
          <Select
            label="Language"
            value={language}
            onValueChange={setLanguage}
            options={[
              { value: "en", label: "English" },
              { value: "ne", label: "नेपाली (Nepali)" },
            ]}
          />
        </SettingRow>

        <div className="border-t border-border pt-5">
          <Button onClick={handleSave} loading={saving}>
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
