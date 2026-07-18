import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { ClassroomPage } from "@/features/classrooms/components/classroom-page";
import { getClassroomForUser } from "@/services/classroom-service";

export default async function ClassroomDetailPage({ params }: { params: Promise<{ classroomId: string }> }) {
  const session = await auth();
  const { classroomId } = await params;
  const classroom = await getClassroomForUser(classroomId, session?.user.id, session?.user.institutionId, session?.user.roles);

  if (!classroom) notFound();

  return <ClassroomPage classroom={classroom} />;
}
