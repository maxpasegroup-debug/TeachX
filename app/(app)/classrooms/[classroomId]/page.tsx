import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { ClassroomPage } from "@/features/classrooms/components/classroom-page";
import { getClassroomForUser } from "@/services/classroom-service";
import { isPersonalTeacherWorkspace } from "@/services/standalone-teacher-service";

export default async function ClassroomDetailPage({ params }: { params: Promise<{ classroomId: string }> }) {
  const session = await auth();
  const { classroomId } = await params;
  const classroom = await getClassroomForUser(classroomId, session?.user.id, session?.user.institutionId, session?.user.roles);

  if (!classroom) notFound();
  const canManageRoster = Boolean(session?.user.id && session.user.institutionId && await isPersonalTeacherWorkspace(session.user.id, session.user.institutionId));

  return <ClassroomPage classroom={classroom} canManageRoster={canManageRoster} />;
}
