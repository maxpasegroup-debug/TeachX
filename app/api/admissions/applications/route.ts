import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getApplicationsForInstitution } from "@/services/admission-service";

export async function GET() {
  const session = await auth();
  if (!session?.user.institutionId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const applications = await getApplicationsForInstitution(session.user.institutionId);
  return NextResponse.json({ applications });
}
