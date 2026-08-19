import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { LoginForm } from "@/features/auth/components/login-form";

export default function StaffLoginPage() {
  return (
    <AuthFormShell journey="login" title="Staff Access" subtitle="Authorized TeachX staff and legacy accounts only.">
      <LoginForm audience="teachx" callbackUrl="/dashboard" />
    </AuthFormShell>
  );
}
