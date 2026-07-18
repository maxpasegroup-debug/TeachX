import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getClassroomForUser } from "@/services/classroom-service";
import { getMaterialsForClassroom } from "@/services/material-service";

export async function GET(request: Request, { params }: { params: Promise<{ classroomId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classroomId } = await params;
  const classroom = await getClassroomForUser(classroomId, session.user.id, session.user.institutionId, session.user.roles);
  if (!classroom) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const search = new URL(request.url).searchParams.get("search") ?? undefined;
  const materials = await getMaterialsForClassroom(classroomId, search);
  return NextResponse.json({ materials });
}
