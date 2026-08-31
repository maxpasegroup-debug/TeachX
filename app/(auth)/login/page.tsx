import { headers } from "next/headers";
import type { Metadata } from "next";

import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { LoginForm } from "@/features/auth/components/login-form";
import { TeacherPinLoginForm } from "@/features/auth/components/teacher-pin-login-form";
import { isLearnXHost } from "@/lib/host";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your TeachX Guru teacher workspace.",
  alternates: { canonical: "/login" }
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const params = await searchParams;
  const learnX = isLearnXHost((await headers()).get("host"));

  return (
    <AuthFormShell
      journey={learnX ? "student" : "login"}
      title={learnX ? "Welcome back to LearnX Guru" : "Welcome Back"}
      subtitle={learnX ? "Continue your learning journey with everything you've saved in one place." : "Continue your learning journey."}
    >
      {learnX ? <LoginForm callbackUrl={params.callbackUrl} audience="learnx" /> : <TeacherPinLoginForm callbackUrl={params.callbackUrl} />}
    </AuthFormShell>
  );
}
