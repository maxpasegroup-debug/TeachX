import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { SignupForm } from "@/features/auth/components/signup-form";

export default function StudentSignupPage() {
  return (
    <AuthFormShell journey="student" title="Create Your LearnX Guru Account" subtitle="Set up a personal learning identity that helps your AI companion understand your goals, preferences, and study rhythm.">
      <SignupForm userType="student" />
    </AuthFormShell>
  );
}
