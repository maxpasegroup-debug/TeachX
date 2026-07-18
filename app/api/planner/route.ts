import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getPlannerData } from "@/services/planner-service";

export async function GET() {
  const session = await auth();
  if (!session?.user.institutionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const planner = await getPlannerData(session.user.institutionId);
  return NextResponse.json(planner);
}
