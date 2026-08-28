import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { TeacherEarnMorePage } from "@/features/teacher-life/components/teacher-life-destinations";
import { getTeacherBusinessData } from "@/services/teacher-business-service";

export default async function TeacherEarnMoreRoute() {
  const session = await auth();
  const data = await getTeacherBusinessData(session?.user.id, session?.user.institutionId);
  if (!data) notFound();
  return <TeacherEarnMorePage data={data} />;
}
