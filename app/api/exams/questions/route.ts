import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getQuestionBank } from "@/services/question-service";

export async function GET() {
  const session = await auth();
  if (!session?.user.institutionId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const questions = await getQuestionBank(session.user.institutionId);
  return NextResponse.json({ questions });
}
