"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, MessageSquareText, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  completeTeacherPhoneSignupAction,
  requestTeacherSignupOtpAction,
  verifyTeacherSignupOtpAction,
  type PhoneAuthActionResult
} from "@/features/auth/actions";
import { PhoneNumberFields } from "@/features/auth/components/phone-number-fields";

type Step = "phone" | "code" | "account";

export function TeacherPhoneSignupForm() {
  const [step, setStep] = useState<Step>("phone");
  const [phoneResult, setPhoneResult] = useState<PhoneAuthActionResult>();
  const [verification, setVerification] = useState<PhoneAuthActionResult>();
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();
  const [signupError, signupAction, signupPending] = useActionState(completeTeacherPhoneSignupAction, undefined);

  function requestCode(formData: FormData) {
    setMessage(undefined);
    startTransition(async () => {
      const result = await requestTeacherSignupOtpAction(formData);
      setMessage(result.message);
      if (result.ok) {
        setPhoneResult(result);
        setStep("code");
      }
    });
  }

  function verifyCode(formData: FormData) {
    setMessage(undefined);
    startTransition(async () => {
      const result = await verifyTeacherSignupOtpAction(formData);
      setMessage(result.message);
      if (result.ok) {
        setVerification(result);
        setStep("account");
      }
    });
  }

  if (step === "phone") {
    return (
      <form action={requestCode} className="space-y-5">
        <PhoneNumberFields disabled={pending} />
        {message ? <StatusMessage ok={false} message={message} /> : null}
        <Button className="h-12 w-full" disabled={pending} type="submit">
          <MessageSquareText className="mr-2 h-4 w-4" />{pending ? "Sending code" : "Send verification code"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">Already registered? <Link className="font-semibold text-foreground underline" href="/login">Log in</Link></p>
      </form>
    );
  }

  if (step === "code" && phoneResult?.challengeId && phoneResult.phoneE164) {
    return (
      <form action={verifyCode} className="space-y-5">
        <input name="phone" type="hidden" value={phoneResult.phoneE164} />
        <input name="challengeId" type="hidden" value={phoneResult.challengeId} />
        <div className="space-y-2">
          <Label htmlFor="code">SMS verification code</Label>
          <Input autoComplete="one-time-code" className="text-center text-xl tracking-widest" id="code" inputMode="numeric" maxLength={6} name="code" pattern="[0-9]{6}" placeholder="000000" required />
        </div>
        {phoneResult.developmentCode ? <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">Development code: <strong>{phoneResult.developmentCode}</strong></p> : null}
        {message ? <StatusMessage ok={message.includes("sent")} message={message} /> : null}
        <Button className="h-12 w-full" disabled={pending} type="submit"><ShieldCheck className="mr-2 h-4 w-4" />{pending ? "Checking code" : "Verify mobile number"}</Button>
        <button className="w-full text-sm font-semibold text-muted-foreground underline" onClick={() => { setStep("phone"); setMessage(undefined); }} type="button">Use a different number</button>
      </form>
    );
  }

  return (
    <form action={signupAction} className="space-y-5">
      <input name="phone" type="hidden" value={verification?.phoneE164 ?? ""} />
      <input name="challengeId" type="hidden" value={verification?.challengeId ?? ""} />
      <input name="verificationToken" type="hidden" value={verification?.verificationToken ?? ""} />
      <StatusMessage ok message="Mobile number verified" />
      <div className="space-y-2"><Label htmlFor="name">Full name</Label><Input autoComplete="name" id="name" name="name" placeholder="Anika Rao" required /></div>
      <div className="space-y-2"><Label htmlFor="email">Email <span className="font-normal text-muted-foreground">(optional)</span></Label><Input autoComplete="email" id="email" name="email" placeholder="teacher@example.com" type="email" /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="pin">Create 6-digit PIN</Label><Input autoComplete="new-password" id="pin" inputMode="numeric" maxLength={6} name="pin" pattern="[0-9]{6}" placeholder="6 numbers" required type="password" /></div>
        <div className="space-y-2"><Label htmlFor="confirmPin">Re-enter PIN</Label><Input autoComplete="new-password" id="confirmPin" inputMode="numeric" maxLength={6} name="confirmPin" pattern="[0-9]{6}" placeholder="Repeat PIN" required type="password" /></div>
      </div>
      <label className="flex items-start gap-3 rounded-md border border-border bg-white/60 px-4 py-3 text-sm leading-6 text-muted-foreground">
        <input className="mt-1 h-4 w-4" name="agreement" required type="checkbox" />
        <span>I accept the <Link className="font-semibold text-foreground underline" href="/privacy">Privacy Policy</Link>, <Link className="font-semibold text-foreground underline" href="/terms">Terms</Link>, and <Link className="font-semibold text-foreground underline" href="/cookies">Cookie Policy</Link>.</span>
      </label>
      {signupError ? <StatusMessage ok={false} message={signupError} /> : null}
      <Button className="h-12 w-full" disabled={signupPending} type="submit"><CheckCircle2 className="mr-2 h-4 w-4" />{signupPending ? "Creating your workspace" : "Create teacher account"}</Button>
    </form>
  );
}

function StatusMessage({ ok, message }: { ok: boolean; message: string }) {
  return <p aria-live="polite" className={`rounded-md px-4 py-3 text-sm ${ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{message}</p>;
}
