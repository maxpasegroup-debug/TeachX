import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getPartnersForInstitution } from "@/services/partner-service";

export async function GET() {
  const session = await auth();
  if (!session?.user.institutionId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const partners = await getPartnersForInstitution(session.user.institutionId);
  return NextResponse.json({ partners });
}
