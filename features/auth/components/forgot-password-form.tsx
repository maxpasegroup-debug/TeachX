"use client";

import { useActionState } from "react";
import Link from "next/link";

import { forgotPasswordAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [message, action, pending] = useActionState(forgotPasswordAction, undefined);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input className="rounded-2xl bg-white/85 transition duration-brand ease-brand focus:border-brand-blue focus:shadow-brand-soft" id="email" name="email" type="email" autoComplete="email" placeholder="teacher@teachx.guru" required />
      </div>
      {message ? <p className="rounded-2xl border border-brand-blue/10 bg-brand-blue-soft px-4 py-3 text-sm font-medium text-brand-blue">{message}</p> : null}
      <Button className="premium-button h-13 w-full rounded-2xl shadow-brand transition duration-brand ease-brand" disabled={pending} type="submit">
        {pending ? "Checking" : "Continue"}
      </Button>
      <Link className="block text-center text-sm font-semibold text-muted-foreground transition hover:text-brand-blue" href="/login">
        Back to login
      </Link>
    </form>
  );
}
