"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeTeacherPhoneSignupAction } from "@/features/auth/actions";
import { PhoneNumberFields } from "@/features/auth/components/phone-number-fields";

/** Teacher signup uses a mobile number and PIN. OTP is reserved for PIN recovery. */
export function TeacherPhoneSignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    const form = new FormData(event.currentTarget);
    const country = String(form.get("country") || "IN") as import("libphonenumber-js").CountryCode;

    startTransition(async () => {
      try {
        const { parsePhoneNumberFromString } = await import("libphonenumber-js");
        const phone = parsePhoneNumberFromString(String(form.get("phone") || ""), country);
        if (!phone?.isValid()) {
          setError("Enter a valid mobile number.");
          return;
        }

        const created = await completeTeacherPhoneSignupAction(form);
        if (!created.ok) {
          setError(created.message ?? "Your account could not be created.");
          return;
        }

        const destination = "/entry?mode=signup&next=%2Fteacher";
        const result = await signIn("teacher-pin", {
          phone: phone.number,
          pin: String(form.get("pin") || ""),
          redirect: false,
          callbackUrl: destination
        });
        if (!result?.ok) {
          setError("Your account was created, but automatic sign-in failed. Please log in with your mobile number and PIN.");
          return;
        }

        router.replace(destination);
        router.refresh();
      } catch {
        setError("TeachX could not complete the request. Check your connection and try again.");
      }
    });
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <div className="space-y-2"><Label htmlFor="name">Full name</Label><Input autoComplete="name" id="name" name="name" placeholder="Anika Rao" required /></div>
      <div className="space-y-2"><Label htmlFor="email">Email <span className="font-normal text-muted-foreground">(optional)</span></Label><Input autoComplete="email" id="email" name="email" placeholder="teacher@example.com" type="email" /></div>
      <PhoneNumberFields disabled={pending} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="pin">Create 6-digit PIN</Label><Input autoComplete="new-password" id="pin" inputMode="numeric" maxLength={6} name="pin" pattern="[0-9]{6}" placeholder="6 numbers" required type="password" /></div>
        <div className="space-y-2"><Label htmlFor="confirmPin">Re-enter PIN</Label><Input autoComplete="new-password" id="confirmPin" inputMode="numeric" maxLength={6} name="confirmPin" pattern="[0-9]{6}" placeholder="Repeat PIN" required type="password" /></div>
      </div>
      <p className="text-sm text-muted-foreground">We only send an SMS code if you need to reset your PIN.</p>
      <label className="flex items-start gap-3 rounded-md border border-border bg-white/60 px-4 py-3 text-sm leading-6 text-muted-foreground">
        <input className="mt-1 h-4 w-4" name="agreement" required type="checkbox" />
        <span>I accept the <Link className="font-semibold text-foreground underline" href="/privacy">Privacy Policy</Link>, <Link className="font-semibold text-foreground underline" href="/terms">Terms</Link>, and <Link className="font-semibold text-foreground underline" href="/cookies">Cookie Policy</Link>.</span>
      </label>
      {error ? <p aria-live="polite" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <Button className="h-12 w-full" disabled={pending} type="submit"><CheckCircle2 className="mr-2 h-4 w-4" />{pending ? "Creating your workspace" : "Create teacher account"}</Button>
      <p className="text-center text-sm text-muted-foreground">Already registered? <Link className="font-semibold text-foreground underline" href="/login">Log in</Link></p>
    </form>
  );
}
