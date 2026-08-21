import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { TeacherLifePage } from "@/features/teacher-life/components/teacher-life-page";
import { getTeacherLifeData, teacherLifePillars, type TeacherLifePillar } from "@/services/teacher-life-service";

export default async function TeacherLifePillarPage({ params }: { params: Promise<{ pillar: string }> }) {
  const { pillar } = await params;
  if (!teacherLifePillars.includes(pillar as TeacherLifePillar)) notFound();
  const session = await auth();
  const data = await getTeacherLifeData(session?.user.id, session?.user.institutionId);
  if (!data) notFound();
  return <TeacherLifePage data={data} pillar={pillar as TeacherLifePillar} />;
}
