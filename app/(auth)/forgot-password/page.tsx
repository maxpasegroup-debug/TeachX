import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthFormShell journey="recovery" title="Reset Password" subtitle="Enter your email and continue securely.">
      <ForgotPasswordForm />
    </AuthFormShell>
  );
}
