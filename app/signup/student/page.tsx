import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { SignupForm } from "@/features/auth/components/signup-form";

export default function StudentSignupPage() {
  return (
    <AuthFormShell title="Student signup" subtitle="Create your TeachX student workspace for learning, practice, teachers, and AI guidance.">
      <SignupForm userType="student" />
    </AuthFormShell>
  );
}
