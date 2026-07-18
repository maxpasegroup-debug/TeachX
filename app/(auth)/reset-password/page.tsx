import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;

  return (
    <AuthFormShell journey="recovery" title="New Password" subtitle="Choose a strong password for your TeachX Guru account.">
      <ResetPasswordForm token={params.token ?? ""} />
    </AuthFormShell>
  );
}
