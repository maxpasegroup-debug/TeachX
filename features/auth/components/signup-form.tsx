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
        <button className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface text-sm font-medium text-foreground opacity-70" disabled type="button">
          <Mail className="h-4 w-4" />
          Email OTP
        </button>
        <button className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface text-sm font-medium text-foreground opacity-70" disabled type="button">
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </button>
        <button className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface text-sm font-medium text-foreground opacity-70" disabled type="button">
          <Chrome className="h-4 w-4" />
          Google
        </button>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">OTP and Google provider hooks are prepared as authentication architecture placeholders. Password signup is active for Phase 1.</p>
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" autoComplete="name" placeholder={isTeacher ? "Anika Rao" : "Rohan Mehta"} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder={isTeacher ? "teacher@teachx.ai" : "student@teachx.ai"} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+91 90000 00000" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="goal">{isTeacher ? "Teaching focus" : "Learning goal"}</Label>
        <Input id="goal" name="goal" placeholder={isTeacher ? "Launch AI assisted live classes" : "Prepare for exams with AI practice"} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" placeholder="Create a secure password" required />
      </div>
      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <Button className="w-full rounded-xl" disabled={pending} type="submit">
        {pending ? "Creating account" : `Create ${userType} account`}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link className="font-medium text-foreground hover:underline" href="/login">
          Login
        </Link>
      </p>
    </form>
  );
}
