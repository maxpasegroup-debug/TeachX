import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { StudentFoundationPage } from "@/features/student-foundation/components/student-foundation-page";
import { getStudentFoundation } from "@/services/student-foundation-service";

const modules = ["onboarding", "profile", "goals", "connections", "personalization", "settings"] as const;
export default async function StudentFoundationRoute({ params }: { params: Promise<{ foundation: string }> }) {
  const session = await auth();
  if (!session?.user.id) redirect("/login");
  const { foundation } = await params;
  if (!modules.includes(foundation as (typeof modules)[number])) notFound();
  const data = await getStudentFoundation(session.user.id);
  if (!data) notFound();
  return <StudentFoundationPage data={data} module={foundation as (typeof modules)[number]} />;
}
