"use client";

import { useActionState } from "react";
import { MailWarning } from "lucide-react";

import { resendVerificationAction } from "@/features/auth/actions";

export function EmailVerificationReminder() {
  const [message, action, pending] = useActionState(resendVerificationAction, undefined);
  return (
    <form action={action}>
      <button className="inline-flex h-10 items-center gap-2 border border-amber-300 bg-amber-50 px-3 text-sm font-medium text-amber-900 focus:outline-none focus:ring-2 focus:ring-primary" disabled={pending} title={message || "Resend email verification"} type="submit">
        <MailWarning className="h-4 w-4" /><span className="hidden lg:inline">{pending ? "Sending" : "Verify email"}</span>
      </button>
      <span className="sr-only" role="status">{message}</span>
    </form>
  );
}
