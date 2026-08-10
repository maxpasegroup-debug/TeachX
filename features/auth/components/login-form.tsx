"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2, LockKeyhole } from "lucide-react";

import { loginAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormProps = {
  callbackUrl?: string;
  audience?: "learnx" | "teachx";
};

export function LoginForm({ callbackUrl, audience = "teachx" }: LoginFormProps) {
  const [error, action, pending] = useActionState(loginAction, undefined);
  const isLearnX = audience === "learnx";

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input className="rounded-2xl bg-white/85 transition duration-brand ease-brand focus:border-brand-blue focus:shadow-brand-soft" id="email" name="email" type="email" autoComplete="email" placeholder={isLearnX ? "you@learnx.guru" : "you@teachx.guru"} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input className="rounded-2xl bg-white/85 transition duration-brand ease-brand focus:border-brand-blue focus:shadow-brand-soft" id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter password" required />
      </div>
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-muted-foreground">
          <input name="remember" type="checkbox" className="h-4 w-4 rounded border-border text-brand-blue focus:ring-brand-blue" />
          Remember me
        </label>
        <Link className="font-semibold text-foreground transition hover:text-brand-blue" href="/forgot-password">
          Forgot password
        </Link>
      </div>
      {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <Button className="premium-button h-13 w-full rounded-2xl shadow-brand transition duration-brand ease-brand" disabled={pending} type="submit">
        {pending ? "Signing in" : "Sign In"}
      </Button>
      <div className="rounded-2xl border border-white/80 bg-white/60 px-4 py-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <LockKeyhole className="h-4 w-4 text-brand-blue" />
          Secure, privacy-first access to your {isLearnX ? "learning space" : "ecosystem"}.
        </div>
      </div>
      {pending ? (
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-brand-blue">
          <CheckCircle2 className="h-4 w-4 animate-pulse" />
          Preparing your {isLearnX ? "learning space" : "workspace"}
        </div>
      ) : null}
      <p className="text-center text-sm text-muted-foreground">
        New to {isLearnX ? "LearnX Guru" : "TeachX Guru"}?{" "}
        <Link className="font-semibold text-foreground transition hover:text-brand-blue" href={isLearnX ? "/signup/student" : "/welcome"}>
          Create an account
        </Link>
      </p>
    </form>
  );
}
