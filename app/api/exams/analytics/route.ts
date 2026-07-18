import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getStudentExamAnalytics } from "@/services/analytics-service";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const analytics = await getStudentExamAnalytics(session.user.id);
  return NextResponse.json({ analytics });
}
