import { headers } from "next/headers";

import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { LoginForm } from "@/features/auth/components/login-form";
import { isLearnXHost } from "@/lib/host";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const params = await searchParams;
  const learnX = isLearnXHost((await headers()).get("host"));

  return (
    <AuthFormShell
      journey={learnX ? "student" : "login"}
      title={learnX ? "Welcome back to LearnX Guru" : "Welcome Back"}
      subtitle={learnX ? "Continue your learning journey with everything you've saved in one place." : "Continue your learning journey."}
    >
      <LoginForm callbackUrl={params.callbackUrl} audience={learnX ? "learnx" : "teachx"} />
    </AuthFormShell>
  );
}
