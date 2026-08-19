import { NextResponse } from "next/server";

import { completeFirstRunSetup, hasCompletedFirstRun } from "@/services/setup-service";
import { getClientKey, rateLimit, secureSecretMatch } from "@/lib/security";

export async function GET() {
  return NextResponse.json({ completed: await hasCompletedFirstRun() });
}

export async function POST(request: Request) {
  const limited = await rateLimit(`setup:${getClientKey(request, "setup")}`, 5, 60_000);
  if (limited) return limited;
  if (await hasCompletedFirstRun()) return NextResponse.json({ error: "Setup is already complete." }, { status: 409 });
  const body = await request.json();
  if (!secureSecretMatch(body?.setupSecret, process.env.SETUP_SECRET)) return NextResponse.json({ error: "Invalid setup secret." }, { status: 403 });
  const result = await completeFirstRunSetup(body);
  return NextResponse.json({ institutionId: result.institution.id }, { status: 201 });
}
