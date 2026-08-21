"use client";

import * as React from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { AccountPageHeading } from "@/components/account/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/common/empty-state";
import { useToast } from "@/components/ui/toast";
import { savedAddresses, type SavedAddress } from "@/data/mock/user";
import { currentUser } from "@/data/mock/user";

export function AddressBook() {
  const { toast } = useToast();
  const [addresses, setAddresses] = React.useState<SavedAddress[]>(savedAddresses);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [label, setLabel] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [error, setError] = React.useState<string>();

  const addAddress = () => {
    if (!address.trim()) {
      setError("Enter the address.");
      return;
    }

    setAddresses((current) => [
      ...current,
      {
        id: `addr-${Date.now()}`,
        label: label.trim() || "Other",
        fullName: currentUser.fullName,
        phone: currentUser.phone,
        address: address.trim(),
        isDefault: current.length === 0,
      },
    ]);

    setLabel("");
    setAddress("");
    setError(undefined);
    setDialogOpen(false);
    toast({ title: "Address saved", variant: "success" });
  };

  const removeAddress = (id: string) => {
    setAddresses((current) => current.filter((item) => item.id !== id));
    toast({ title: "Address removed" });
  };

  const makeDefault = (id: string) => {
    setAddresses((current) => current.map((item) => ({ ...item, isDefault: item.id === id })));
    toast({ title: "Default address updated", variant: "success" });
  };

  return (
    <div>
      <AccountPageHeading
        title="Saved addresses"
        description="Where we deliver. The default is pre-selected at checkout."
        action={
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus aria-hidden="true" />
            Add address
          </Button>
        }
      />

      {addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses"
          description="Add one and it will be ready the next time you check out."
          action={<Button onClick={() => setDialogOpen(true)}>Add address</Button>}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {addresses.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">{item.label}</h2>
                {item.isDefault && (
                  <Badge variant="secondary" size="sm">
                    Default
                  </Badge>
                )}
              </div>

              <address className="flex flex-col gap-0.5 text-sm not-italic text-muted">
                <span>{item.address}</span>
                {item.landmark && <span className="text-subtle">{item.landmark}</span>}
                <span className="text-subtle">{item.phone}</span>
              </address>

              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                {!item.isDefault && (
                  <Button variant="ghost" size="sm" onClick={() => makeDefault(item.id)}>
                    Make default
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-error hover:bg-error-soft"
                  onClick={() => removeAddress(item.id)}
                >
                  <Trash2 aria-hidden="true" />
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Add an address"
        description="Saved to this device until the backend is connected."
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addAddress}>Save address</Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Label"
            placeholder="Home, Office, Parents'"
            value={label}
            onValueChange={setLabel}
          />
          <Textarea
            label="Address"
            placeholder="Street, house number, area"
            value={address}
            onChange={(event) => {
              setAddress(event.target.value);
              setError(undefined);
            }}
            error={error}
          />
        </div>
      </Dialog>
    </div>
  );
}
