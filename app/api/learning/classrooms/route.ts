import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getStudentClassrooms } from "@/services/learning-service";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const classrooms = await getStudentClassrooms(session.user.id, session.user.institutionId);
  return NextResponse.json({ classrooms });
}
