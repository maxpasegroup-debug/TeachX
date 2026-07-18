"use client";

import { useActionState } from "react";

import { resetPasswordAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm({ token }: { token: string }) {
  const [message, action, pending] = useActionState(resetPasswordAction, undefined);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input className="rounded-2xl bg-white/85 transition duration-brand ease-brand focus:border-brand-blue focus:shadow-brand-soft" id="password" name="password" type="password" autoComplete="new-password" placeholder="Minimum 8 characters" required />
      </div>
      {message ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p> : null}
      <Button className="h-13 w-full rounded-2xl shadow-brand transition duration-brand ease-brand hover:-translate-y-0.5" disabled={pending} type="submit">
        {pending ? "Updating" : "Reset password"}
      </Button>
    </form>
  );
}
