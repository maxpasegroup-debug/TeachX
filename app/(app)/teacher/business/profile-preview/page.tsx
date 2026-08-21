import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { TeacherProfilePreview } from "@/features/teacher-business/components/teacher-business-page";
import { getTeacherBusinessData } from "@/services/teacher-business-service";

export default async function TeacherBusinessProfilePreviewPage() {
  const session = await auth();
  const data = await getTeacherBusinessData(session?.user.id, session?.user.institutionId);
  if (!data) notFound();
  return <TeacherProfilePreview data={data} />;
}
