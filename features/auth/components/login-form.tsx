"use client";

import { useActionState } from "react";
import Link from "next/link";

import { loginAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [error, action, pending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@teachx.ai" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter password" required />
      </div>
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-muted-foreground">
          <input name="remember" type="checkbox" className="h-4 w-4 rounded border-border" />
          Remember me
        </label>
        <Link className="font-medium text-foreground hover:underline" href="/forgot-password">
          Forgot password
        </Link>
      </div>
      {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Signing in" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        New to TeachX?{" "}
        <Link className="font-medium text-foreground hover:underline" href="/welcome">
          Get started
        </Link>
      </p>
    </form>
  );
}
