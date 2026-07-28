import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { TeacherUnifiedSettings } from "@/features/platform-integration/components/teacher-unified-settings";
import { getTeacherSettings } from "@/services/teacher-settings-service";

export default async function TeacherSettingsPage() {
  const session=await auth();
  const data=await getTeacherSettings(session?.user.id);
  if(!data) notFound();
  return <TeacherUnifiedSettings data={data}/>;
}
