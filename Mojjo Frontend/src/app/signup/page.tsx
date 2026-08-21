import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { PhoneAuthForm } from "@/components/auth/phone-auth-form";

export const metadata: Metadata = {
  title: "Sign up",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <AuthLayout
      panelTitle="Looks like you're new here!"
      panelSubtitle="Sign up with your mobile number to get started. Orders, tracking and Mojjo coins, all in one place."
    >
      <PhoneAuthForm mode="signup" />
    </AuthLayout>
  );
}
