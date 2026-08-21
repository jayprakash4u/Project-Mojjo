import type { Metadata } from "next";
import { AddressBook } from "@/components/account/address-book";

export const metadata: Metadata = {
  title: "Saved addresses",
  robots: { index: false, follow: false },
};

export default function AddressesPage() {
  return <AddressBook />;
}
