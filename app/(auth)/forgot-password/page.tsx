import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { PinResetForm } from "@/features/auth/components/pin-reset-form";

export default function ForgotPasswordPage() {
  return (
    <AuthFormShell journey="recovery" title="Reset Your PIN" subtitle="Verify your registered mobile number to choose a new PIN.">
      <PinResetForm />
    </AuthFormShell>
  );
}
