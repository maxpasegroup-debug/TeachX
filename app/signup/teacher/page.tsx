import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { SignupForm } from "@/features/auth/components/signup-form";

export default function TeacherSignupPage() {
  return (
    <AuthFormShell title="Teacher signup" subtitle="Create your TeachX teacher workspace for AI assisted classes, resources, marketplace, and earnings.">
      <SignupForm userType="teacher" />
    </AuthFormShell>
  );
}
