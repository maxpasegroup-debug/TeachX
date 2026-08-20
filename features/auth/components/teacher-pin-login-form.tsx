"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneNumberFields } from "@/features/auth/components/phone-number-fields";

export function TeacherPinLoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const nextPath = callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/teacher";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    const form = new FormData(event.currentTarget);
    const country = String(form.get("country") || "IN") as CountryCode;
    const parsedPhone = parsePhoneNumberFromString(String(form.get("phone") || ""), country);
    if (!parsedPhone?.isValid()) {
      setError("Enter a valid mobile number.");
      return;
    }
    setPending(true);
    const destination = `/entry?mode=login&next=${encodeURIComponent(nextPath)}`;
    const result = await signIn("teacher-pin", { phone: parsedPhone.number, pin: String(form.get("pin") || ""), redirect: false, callbackUrl: destination });
    setPending(false);
    if (!result?.ok) {
      setError("Mobile number or PIN is incorrect. A temporarily locked account can be recovered by resetting the PIN.");
      return;
    }
    window.location.assign(destination);
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <PhoneNumberFields disabled={pending} />
      <div className="space-y-2"><Label htmlFor="pin">6-digit PIN</Label><Input autoComplete="current-password" id="pin" inputMode="numeric" maxLength={6} name="pin" pattern="[0-9]{6}" placeholder="Enter your PIN" required type="password" /></div>
      <div className="flex items-center justify-end text-sm"><Link className="font-semibold text-foreground underline" href="/forgot-password">Forgot PIN?</Link></div>
      {error ? <p aria-live="polite" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <Button className="h-12 w-full" disabled={pending} type="submit"><LogIn className="mr-2 h-4 w-4" />{pending ? "Opening TeachX" : "Log in"}</Button>
      <p className="text-center text-sm text-muted-foreground">New to TeachX? <Link className="font-semibold text-foreground underline" href="/signup/teacher">Create a teacher account</Link></p>
    </form>
  );
}
