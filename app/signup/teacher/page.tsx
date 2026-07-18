import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { SignupForm } from "@/features/auth/components/signup-form";

export default function TeacherSignupPage() {
  return (
    <AuthFormShell journey="teacher" title="Create Your TeachX Guru Account" subtitle="Start your teacher journey with a premium workspace for creating, teaching, growing, and earning.">
      <SignupForm userType="teacher" />
    </AuthFormShell>
  );
}
