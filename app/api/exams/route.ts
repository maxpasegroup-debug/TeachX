import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getAvailableStudentExams, getExamsForInstitution } from "@/services/exam-service";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const exams = session.user.roles.includes("STUDENT")
    ? await getAvailableStudentExams(session.user.id)
    : await getExamsForInstitution(session.user.institutionId);
  return NextResponse.json({ exams });
}
