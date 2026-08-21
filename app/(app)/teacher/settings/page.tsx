import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { TeacherUnifiedSettings } from "@/features/platform-integration/components/teacher-unified-settings";
import { getTeacherSettings } from "@/services/teacher-settings-service";

export default async function TeacherSettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const session=await auth();
  const data=await getTeacherSettings(session?.user.id, session?.user.institutionId);
  if(!data) notFound();
  const query = await searchParams;
  return <TeacherUnifiedSettings data={data} saved={query.saved === "1"}/>;
}
