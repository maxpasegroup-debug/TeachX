import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { TeacherEnjoyMorePage } from "@/features/teacher-life/components/teacher-life-destinations";
import { getTeacherLifeData } from "@/services/teacher-life-service";

export default async function TeacherEnjoyMoreRoute() {
  const session = await auth();
  const data = await getTeacherLifeData(session?.user.id, session?.user.institutionId);
  if (!data) notFound();
  return <TeacherEnjoyMorePage />;
}
