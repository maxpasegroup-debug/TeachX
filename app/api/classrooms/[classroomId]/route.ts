import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getClassroomForUser } from "@/services/classroom-service";

export async function GET(_: Request, { params }: { params: Promise<{ classroomId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classroomId } = await params;
  const classroom = await getClassroomForUser(classroomId, session.user.id, session.user.institutionId, session.user.roles);
  if (!classroom) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ classroom });
}
