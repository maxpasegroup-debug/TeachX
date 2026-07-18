import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getCampaignSetup } from "@/services/campaign-service";

export async function GET() {
  const session = await auth();
  if (!session?.user.institutionId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const setup = await getCampaignSetup(session.user.institutionId);
  return NextResponse.json(setup);
}
