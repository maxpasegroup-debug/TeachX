import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { SignupForm } from "@/features/auth/components/signup-form";

// Future ClassTutor Frontend: retained for the student product split.
// TeachX Guru public navigation no longer links to this route.
export default function StudentSignupPage() {
  return (
    <AuthFormShell journey="student" title="Create Your TeachX Guru Account" subtitle="Start your student journey with learning, practice, teachers, and AI guidance in one ecosystem.">
      <SignupForm userType="student" />
    </AuthFormShell>
  );
}
