import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { StudentClassroomPage } from "@/features/learning/components/student-classroom";
import { getStudentClassroom } from "@/services/learning-service";

export default async function StudentLearningClassroomPage({ params }: { params: Promise<{ classroomId: string }> }) {
  const session = await auth();
  const { classroomId } = await params;
  const classroom = await getStudentClassroom(classroomId, session?.user.id, session?.user.institutionId);

  if (!classroom) notFound();

  return <StudentClassroomPage classroom={classroom} />;
}
