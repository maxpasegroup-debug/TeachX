import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { LoginForm } from "@/features/auth/components/login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const params = await searchParams;

  return (
    <AuthFormShell title="Welcome back" subtitle="Sign in to TeachX and continue learning, teaching, or building your education business.">
      <LoginForm callbackUrl={params.callbackUrl} />
    </AuthFormShell>
  );
}
