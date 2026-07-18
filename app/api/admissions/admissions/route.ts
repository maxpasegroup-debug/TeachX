import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getAdmissionsForInstitution } from "@/services/admission-service";

export async function GET() {
  const session = await auth();
  if (!session?.user.institutionId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admissions = await getAdmissionsForInstitution(session.user.institutionId);
  return NextResponse.json({ admissions });
}
