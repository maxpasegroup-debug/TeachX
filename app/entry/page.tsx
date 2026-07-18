import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { EcosystemEntryTransition } from "@/features/auth/components/ecosystem-entry-transition";

const allowedTargets = ["/dashboard", "/teacher", "/student", "/admin", "/learning", "/marketplace", "/resources", "/teacher/ai-studio", "/student/ask-ai"];

function safeNextPath(next?: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  return allowedTargets.some((target) => next === target || next.startsWith(`${target}/`)) ? next : "/dashboard";
}

function inferJourney(nextPath: string, roles: string[] = []) {
  if (nextPath.startsWith("/teacher")) return "teacher";
  if (nextPath.startsWith("/student")) return "student";
  if (roles.includes("STUDENT")) return "student";
  if (roles.includes("ACADEMIC_FACULTY")) return "teacher";
  return "dashboard";
}

export default async function EntryPage({ searchParams }: { searchParams: Promise<{ next?: string; mode?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const nextPath = safeNextPath(params.next);
  const journey = inferJourney(nextPath, session.user.roles);
  const mode = params.mode === "signup" ? "signup" : "login";

  return <EcosystemEntryTransition journey={journey} mode={mode} name={session.user.name} nextPath={nextPath} />;
}
