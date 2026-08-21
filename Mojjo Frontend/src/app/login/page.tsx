import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { PhoneAuthForm } from "@/components/auth/phone-auth-form";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthLayout
      panelTitle="Welcome back"
      panelSubtitle="Log in with your mobile number to track orders and spend your Mojjo coins."
    >
      <PhoneAuthForm mode="login" />
    </AuthLayout>
  );
}
