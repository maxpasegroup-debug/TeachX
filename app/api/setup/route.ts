import { NextResponse } from "next/server";

import { completeFirstRunSetup, hasCompletedFirstRun } from "@/services/setup-service";
import { getClientKey, rateLimit } from "@/lib/security";

export async function GET() {
  return NextResponse.json({ completed: await hasCompletedFirstRun() });
}

export async function POST(request: Request) {
  const limited = rateLimit(`setup:${getClientKey(request, "setup")}`, 5, 60_000);
  if (limited) return limited;
  if (await hasCompletedFirstRun()) return NextResponse.json({ error: "Setup is already complete." }, { status: 409 });
  const result = await completeFirstRunSetup(await request.json());
  return NextResponse.json({ institutionId: result.institution.id }, { status: 201 });
}
