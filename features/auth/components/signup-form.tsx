"use client";

import { useActionState } from "react";
import Link from "next/link";

import { signupAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeacherPhoneSignupForm } from "@/features/auth/components/teacher-phone-signup-form";

type SignupFormProps = {
  userType: "teacher" | "student";
};

export function SignupForm({ userType }: SignupFormProps) {
  const [error, action, pending] = useActionState(signupAction, undefined);
  if (userType === "teacher") return <TeacherPhoneSignupForm />;

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="userType" value={userType} />
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input className="rounded-2xl bg-white/85 transition duration-brand ease-brand focus:border-brand-blue focus:shadow-brand-soft" id="name" name="name" autoComplete="name" placeholder="Rohan Mehta" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input className="rounded-2xl bg-white/85 transition duration-brand ease-brand focus:border-brand-blue focus:shadow-brand-soft" id="email" name="email" type="email" autoComplete="email" placeholder="student@learnx.guru" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input className="rounded-2xl bg-white/85 transition duration-brand ease-brand focus:border-brand-blue focus:shadow-brand-soft" id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+91 90000 00000" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="goal">Learning goal</Label>
        <Input className="rounded-2xl bg-white/85 transition duration-brand ease-brand focus:border-brand-blue focus:shadow-brand-soft" id="goal" name="goal" placeholder="Prepare for exams with AI practice" />
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
        <span>
          I agree to use LearnX Guru responsibly and accept the{" "}
          <Link className="font-semibold text-foreground underline" href="/privacy">Privacy Policy</Link>,{" "}
          <Link className="font-semibold text-foreground underline" href="/terms">Terms</Link>, and{" "}
          <Link className="font-semibold text-foreground underline" href="/cookies">Cookie Policy</Link>.
        </span>
      </label>
      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <Button className="premium-button h-13 w-full rounded-2xl shadow-brand transition duration-brand ease-brand" disabled={pending} type="submit">
        {pending ? "Creating account" : "Create Account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link className="font-semibold text-foreground transition hover:text-brand-blue" href="/login/student">
          Login
        </Link>
      </p>
    </form>
  );
}
