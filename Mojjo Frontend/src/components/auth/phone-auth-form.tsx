"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/auth/otp-input";
import { useToast } from "@/components/ui/toast";
import { validatePhone } from "@/lib/validation";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export interface PhoneAuthFormProps {
  mode: "signup" | "login";
}

/**
 * Mobile number, then a one-time code. One component behind both screens —
 * the flow is identical and only the wording and the cross-link differ.
 */
export function PhoneAuthForm({ mode }: PhoneAuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = React.useState<"phone" | "otp">("phone");
  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string>();
  const [pending, setPending] = React.useState(false);
  const [secondsLeft, setSecondsLeft] = React.useState(0);

  // Resend cooldown.
  React.useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const sendCode = async () => {
    const phoneError = validatePhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setError(undefined);
    setPending(true);
    // Stands in for POST /api/auth/otp against the .NET backend.
    await new Promise((resolve) => setTimeout(resolve, 700));
    setPending(false);

    setStep("otp");
    setSecondsLeft(RESEND_SECONDS);
    toast({
      title: "Code sent",
      description: `We texted a ${OTP_LENGTH}-digit code to ${phone}.`,
      variant: "success",
    });
  };

  const verifyCode = async (submitted: string) => {
    if (submitted.length < OTP_LENGTH) {
      setError(`Enter all ${OTP_LENGTH} digits.`);
      return;
    }

    setError(undefined);
    setPending(true);
    // Stands in for POST /api/auth/verify against the .NET backend.
    await new Promise((resolve) => setTimeout(resolve, 700));
    setPending(false);

    router.push("/account");
  };

  if (step === "phone") {
    return (
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void sendCode();
        }}
        className="flex flex-col gap-5"
      >
        <Input
          label="Enter mobile number"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="98XXXXXXXX"
          autoFocus
          value={phone}
          onValueChange={(next) => {
            // Keep it to digits so the field can't drift from what we validate.
            setPhone(next.replace(/\D/g, "").slice(0, 10));
            setError(undefined);
          }}
          error={error}
        />

        <p className="text-xs leading-relaxed text-muted">
          By continuing, you agree to Mojjo&apos;s{" "}
          <Link href="/account/help" className="text-secondary hover:underline">
            Terms of Use
          </Link>{" "}
          and{" "}
          <Link href="/account/help" className="text-secondary hover:underline">
            Privacy Policy
          </Link>
          . You must be 18 or over to order.
        </p>

        <Button type="submit" size="lg" full loading={pending}>
          Continue
        </Button>

        <Link
          href={mode === "signup" ? "/login" : "/signup"}
          className="rounded-md border border-border py-3 text-center text-sm font-semibold text-secondary transition-colors hover:bg-surface-sunken"
        >
          {mode === "signup" ? "Existing user? Log in" : "New to Mojjo? Sign up"}
        </Link>
      </form>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void verifyCode(code);
      }}
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => {
            setStep("phone");
            setCode("");
            setError(undefined);
          }}
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-secondary hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Change number
        </button>
        <p className="text-sm text-muted">
          Code sent to <span className="font-medium text-foreground">{phone}</span>
        </p>
      </div>

      <OtpInput
        value={code}
        onChange={(next) => {
          setCode(next);
          setError(undefined);
        }}
        onComplete={(next) => void verifyCode(next)}
        length={OTP_LENGTH}
        error={Boolean(error)}
        autoFocus
      />

      {error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" full loading={pending}>
        Verify and continue
      </Button>

      <button
        type="button"
        disabled={secondsLeft > 0}
        onClick={() => {
          setSecondsLeft(RESEND_SECONDS);
          toast({ title: "Code resent", description: `Sent again to ${phone}.` });
        }}
        className="text-sm text-muted disabled:cursor-not-allowed"
      >
        {secondsLeft > 0 ? (
          <>
            Resend code in <span data-numeric>{secondsLeft}s</span>
          </>
        ) : (
          <span className="font-medium text-secondary hover:underline">Resend code</span>
        )}
      </button>
    </form>
  );
}
