import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { searchOperations } from "@/services/operations-report-service";

export async function GET(request: Request) {
  const access = await requireApiSession("operations.view");
  if ("response" in access) return access.response;
  const { session } = access;
  if (!session.user.institutionId) return NextResponse.json({ error: "Institution required" }, { status: 400 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  if (!query) return NextResponse.json({ students: [], receipts: [], invoices: [], expenses: [], employees: [] });

  return NextResponse.json(await searchOperations(session.user.institutionId, query));
}
