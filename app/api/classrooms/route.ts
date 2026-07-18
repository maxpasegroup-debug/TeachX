import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getClassroomsForUser } from "@/services/classroom-service";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const classrooms = await getClassroomsForUser(session.user.id, session.user.institutionId, session.user.roles);
  return NextResponse.json({ classrooms });
}
