import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getBookmarksForStudent } from "@/services/bookmark-service";
import { getStudentClassroom } from "@/services/learning-service";

export async function GET(_: Request, { params }: { params: Promise<{ classroomId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classroomId } = await params;
  const classroom = await getStudentClassroom(classroomId, session.user.id, session.user.institutionId);
  if (!classroom) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const bookmarks = await getBookmarksForStudent(session.user.id, classroomId);
  return NextResponse.json({ bookmarks });
}
