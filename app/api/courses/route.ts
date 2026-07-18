import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getCoursesForInstitution } from "@/services/course-service";

export async function GET() {
  const session = await auth();
  if (!session?.user.institutionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const courses = await getCoursesForInstitution(session.user.institutionId);
  return NextResponse.json({ courses });
}
