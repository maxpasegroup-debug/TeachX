import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LearnXStudentLoginPage() {
  return <AuthFormShell journey="student" title="Welcome back to LearnX Guru" subtitle="Continue with the learning identity, goals, and preferences already connected to your account."><LoginForm callbackUrl="/student"/></AuthFormShell>;
}
