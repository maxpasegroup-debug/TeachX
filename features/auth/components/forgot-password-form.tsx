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
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="teacher@school.edu" required />
      </div>
      {message ? <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">{message}</p> : null}
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Checking" : "Send reset link"}
      </Button>
      <Link className="block text-center text-sm font-medium text-muted-foreground hover:text-foreground" href="/login">
        Back to login
      </Link>
    </form>
  );
}
