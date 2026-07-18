import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getStudentClassroom } from "@/services/learning-service";
import { getVideoProgressForStudent } from "@/services/video-progress-service";

export async function GET(_: Request, { params }: { params: Promise<{ classroomId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classroomId } = await params;
  const classroom = await getStudentClassroom(classroomId, session.user.id, session.user.institutionId);
  if (!classroom) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const videoProgress = await getVideoProgressForStudent(session.user.id, classroomId);
  return NextResponse.json({ videoProgress });
}
