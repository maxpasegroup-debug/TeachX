import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { TeacherLearnMorePage } from "@/features/teacher-life/components/teacher-life-destinations";
import { getTeacherLifeData } from "@/services/teacher-life-service";

export default async function TeacherLearnMoreRoute() {
  const session = await auth();
  const data = await getTeacherLifeData(session?.user.id, session?.user.institutionId);
  if (!data) notFound();
  return <TeacherLearnMorePage data={data} />;
}
