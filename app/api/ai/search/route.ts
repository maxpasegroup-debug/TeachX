import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { globalAISearch } from "@/services/ai-service";

export async function GET(request: Request) {
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  if (!access.session.user.institutionId) return NextResponse.json({ answer: "Institution required.", results: [] });
  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query) return NextResponse.json({ answer: "Ask a question.", results: [] });
  return NextResponse.json(await globalAISearch(access.session.user.institutionId, query));
}
