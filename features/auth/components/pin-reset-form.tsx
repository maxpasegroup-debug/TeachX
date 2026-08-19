"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { KeyRound, MessageSquareText, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  completePinResetAction,
  requestPinResetOtpAction,
  verifyPinResetOtpAction,
  type PhoneAuthActionResult
} from "@/features/auth/actions";
import { PhoneNumberFields } from "@/features/auth/components/phone-number-fields";

export function PinResetForm() {
  const [step, setStep] = useState<"phone" | "code" | "pin">("phone");
  const [request, setRequest] = useState<PhoneAuthActionResult>();
  const [verification, setVerification] = useState<PhoneAuthActionResult>();
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();
  const [resetError, resetAction, resetPending] = useActionState(completePinResetAction, undefined);

  function requestCode(formData: FormData) {
    setMessage(undefined);
    startTransition(async () => {
      const result = await requestPinResetOtpAction(formData);
      setMessage(result.message);
      if (result.ok) { setRequest(result); setStep("code"); }
    });
  }

  function verifyCode(formData: FormData) {
    setMessage(undefined);
    startTransition(async () => {
      const result = await verifyPinResetOtpAction(formData);
      setMessage(result.message);
      if (result.ok) { setVerification(result); setStep("pin"); }
    });
  }

  if (step === "phone") return (
    <form action={requestCode} className="space-y-5">
      <PhoneNumberFields disabled={pending} />
      {message ? <Message error text={message} /> : null}
      <Button className="h-12 w-full" disabled={pending} type="submit"><MessageSquareText className="mr-2 h-4 w-4" />{pending ? "Sending code" : "Send reset code"}</Button>
      <p className="text-center text-sm"><Link className="font-semibold text-foreground underline" href="/login">Return to login</Link></p>
    </form>
  );

  if (step === "code" && request?.challengeId && request.phoneE164) return (
    <form action={verifyCode} className="space-y-5">
      <input name="phone" type="hidden" value={request.phoneE164} />
      <input name="challengeId" type="hidden" value={request.challengeId} />
      <div className="space-y-2"><Label htmlFor="code">SMS verification code</Label><Input autoComplete="one-time-code" className="text-center text-xl tracking-widest" id="code" inputMode="numeric" maxLength={6} name="code" pattern="[0-9]{6}" placeholder="000000" required /></div>
      {request.developmentCode ? <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">Development code: <strong>{request.developmentCode}</strong></p> : null}
      {message ? <Message error={!message.includes("sent")} text={message} /> : null}
      <Button className="h-12 w-full" disabled={pending} type="submit"><ShieldCheck className="mr-2 h-4 w-4" />{pending ? "Checking code" : "Verify code"}</Button>
    </form>
  );

  return (
    <form action={resetAction} className="space-y-5">
      <input name="phone" type="hidden" value={verification?.phoneE164 ?? ""} />
      <input name="challengeId" type="hidden" value={verification?.challengeId ?? ""} />
      <input name="verificationToken" type="hidden" value={verification?.verificationToken ?? ""} />
      <Message text="Mobile number verified" />
      <div className="space-y-2"><Label htmlFor="pin">New 6-digit PIN</Label><Input autoComplete="new-password" id="pin" inputMode="numeric" maxLength={6} name="pin" pattern="[0-9]{6}" required type="password" /></div>
      <div className="space-y-2"><Label htmlFor="confirmPin">Re-enter new PIN</Label><Input autoComplete="new-password" id="confirmPin" inputMode="numeric" maxLength={6} name="confirmPin" pattern="[0-9]{6}" required type="password" /></div>
      {resetError ? <Message error text={resetError} /> : null}
      <Button className="h-12 w-full" disabled={resetPending} type="submit"><KeyRound className="mr-2 h-4 w-4" />{resetPending ? "Updating PIN" : "Set new PIN"}</Button>
    </form>
  );
}

function Message({ error = false, text }: { error?: boolean; text: string }) {
  return <p aria-live="polite" className={`rounded-md px-4 py-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>{text}</p>;
}
