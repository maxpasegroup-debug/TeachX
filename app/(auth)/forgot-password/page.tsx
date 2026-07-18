import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthFormShell title="Reset password" subtitle="Enter your email. We will prepare a secure reset link.">
      <ForgotPasswordForm />
    </AuthFormShell>
  );
}
