import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getLeadsForInstitution } from "@/services/lead-service";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user.institutionId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const search = new URL(request.url).searchParams.get("search") ?? undefined;
  const leads = await getLeadsForInstitution(session.user.institutionId, search);
  return NextResponse.json({ leads });
}
