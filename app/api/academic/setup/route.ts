import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getAcademicSetup } from "@/services/academic-setup-service";

export async function GET() {
  const session = await auth();
  if (!session?.user.institutionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const setup = await getAcademicSetup(session.user.institutionId);
  return NextResponse.json(setup);
}
