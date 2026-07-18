"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Mail, MessageCircle, Chrome } from "lucide-react";

import { signupAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SignupFormProps = {
  userType: "teacher" | "student";
};

export function SignupForm({ userType }: SignupFormProps) {
  const [error, action, pending] = useActionState(signupAction, undefined);
  const isTeacher = userType === "teacher";

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="userType" value={userType} />
      <div className="grid gap-3 sm:grid-cols-3">
        <button className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-white/80 text-sm font-semibold text-foreground opacity-70 shadow-sm" disabled type="button">
          <Mail className="h-4 w-4" />
          Email OTP
        </button>
        <button className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-white/80 text-sm font-semibold text-foreground opacity-70 shadow-sm" disabled type="button">
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </button>
        <button className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-white/80 text-sm font-semibold text-foreground opacity-70 shadow-sm" disabled type="button">
          <Chrome className="h-4 w-4" />
          Google
        </button>
      </div>
      <p className="rounded-2xl bg-brand-blue-soft px-4 py-3 text-xs leading-5 text-brand-blue">OTP and Google provider hooks are prepared as authentication architecture placeholders. Password signup is active.</p>
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input className="rounded-2xl bg-white/85 transition duration-brand ease-brand focus:border-brand-blue focus:shadow-brand-soft" id="name" name="name" autoComplete="name" placeholder={isTeacher ? "Anika Rao" : "Rohan Mehta"} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input className="rounded-2xl bg-white/85 transition duration-brand ease-brand focus:border-brand-blue focus:shadow-brand-soft" id="email" name="email" type="email" autoComplete="email" placeholder={isTeacher ? "teacher@teachx.guru" : "student@teachx.guru"} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input className="rounded-2xl bg-white/85 transition duration-brand ease-brand focus:border-brand-blue focus:shadow-brand-soft" id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+91 90000 00000" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="goal">{isTeacher ? "Teaching focus" : "Learning goal"}</Label>
        <Input className="rounded-2xl bg-white/85 transition duration-brand ease-brand focus:border-brand-blue focus:shadow-brand-soft" id="goal" name="goal" placeholder={isTeacher ? "Launch AI assisted classes" : "Prepare for exams with AI practice"} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input className="rounded-2xl bg-white/85 transition duration-brand ease-brand focus:border-brand-blue focus:shadow-brand-soft" id="password" name="password" type="password" autoComplete="new-password" placeholder="Create a secure password" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input className="rounded-2xl bg-white/85 transition duration-brand ease-brand focus:border-brand-blue focus:shadow-brand-soft" id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Re-enter your password" required />
      </div>
      <label className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/60 px-4 py-3 text-sm leading-6 text-muted-foreground">
        <input className="mt-1 h-4 w-4 rounded border-border text-brand-blue focus:ring-brand-blue" name="agreement" required type="checkbox" />
        I agree to use TeachX Guru responsibly and understand that provider integrations may be enabled later by the platform team.
      </label>
      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <Button className="premium-button h-13 w-full rounded-2xl shadow-brand transition duration-brand ease-brand" disabled={pending} type="submit">
        {pending ? "Creating account" : "Create Account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link className="font-semibold text-foreground transition hover:text-brand-blue" href="/login">
          Login
        </Link>
      </p>
    </form>
  );
}
