import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { TeacherBusinessPage } from "@/features/teacher-business/components/teacher-business-page";
import { getTeacherBusinessData, teacherBusinessModules } from "@/services/teacher-business-service";

export default async function TeacherBusinessModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  if (!teacherBusinessModules.includes(module as (typeof teacherBusinessModules)[number])) notFound();
  const session = await auth();
  const data = await getTeacherBusinessData(session?.user.id, session?.user.institutionId);
  if (!data) notFound();
  return <TeacherBusinessPage data={data} module={module as (typeof teacherBusinessModules)[number]} />;
}
