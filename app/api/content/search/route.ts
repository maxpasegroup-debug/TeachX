import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { searchContent } from "@/services/content-service";

export async function GET(request: Request) {
  const access = await requireApiSession("content.view");
  if ("response" in access) return access.response;
  const { session } = access;
  if (!session.user.institutionId) return NextResponse.json({ items: [] });
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  if (!query) return NextResponse.json({ items: [] });
  return NextResponse.json({ items: await searchContent(session.user.institutionId, query, session.user.id, session.user.roles.includes("STUDENT")) });
}
