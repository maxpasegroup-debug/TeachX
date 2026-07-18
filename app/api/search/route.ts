import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { universalSearch } from "@/services/search-service";

export async function GET(request: Request) {
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  const { session } = access;
  if (!session.user.institutionId) return NextResponse.json({ results: [] });
  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query) return NextResponse.json({ results: [] });
  return NextResponse.json({ results: await universalSearch(session.user.institutionId, query, session.user.id) });
}
