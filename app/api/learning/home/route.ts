import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getStudentHome } from "@/services/learning-service";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const home = await getStudentHome(session.user.id, session.user.institutionId);
  return NextResponse.json(home);
}
