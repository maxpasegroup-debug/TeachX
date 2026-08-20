import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/auth";
import { getClientKey, rateLimit } from "@/lib/security";
import { getUserPrivacyCenter, recordPrivacyConsent } from "@/services/privacy-service";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getUserPrivacyCenter(session.user.id));
}

export async function POST(request: Request) {
  const limited = await rateLimit(`privacy-consent:${getClientKey(request, "anonymous")}`, 12, 60_000);
  if (limited) return limited;
  const origin = request.headers.get("origin");
  // The shared app is served from TeachX and LearnX. Validate the request
  // against its own host instead of a single configured public URL.
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  try {
    const session = await auth();
    const result = await recordPrivacyConsent(await request.json(), session?.user.id);
    return NextResponse.json({ recorded: result.count }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Invalid privacy choices", issues: error.flatten() }, { status: 400 });
    if (error instanceof Error && error.message === "CONSENT_SUBJECT_REQUIRED") return NextResponse.json({ error: "Consent subject is required" }, { status: 400 });
    throw error;
  }
}
