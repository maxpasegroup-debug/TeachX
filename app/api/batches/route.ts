import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getBatchesForInstitution } from "@/services/batch-service";

export async function GET() {
  const session = await auth();
  if (!session?.user.institutionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const batches = await getBatchesForInstitution(session.user.institutionId);
  return NextResponse.json({ batches });
}
