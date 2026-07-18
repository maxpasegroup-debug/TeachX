import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { LoginForm } from "@/features/auth/components/login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const params = await searchParams;

  return (
    <AuthFormShell journey="login" title="Welcome Back" subtitle="Continue your learning journey.">
      <LoginForm callbackUrl={params.callbackUrl} />
    </AuthFormShell>
  );
}
