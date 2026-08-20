"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeTeacherPhoneSignupAction } from "@/features/auth/actions";
import { PhoneNumberFields } from "@/features/auth/components/phone-number-fields";

/** Teacher signup uses a mobile number and PIN. OTP is reserved for PIN recovery. */
export function TeacherPhoneSignupForm() {
  const [error, action, pending] = useActionState(completeTeacherPhoneSignupAction, undefined);

  return (
    <form action={action} className="space-y-5">
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
