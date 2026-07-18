import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { getReceiptsForInstitution } from "@/services/receipt-service";

export async function GET() {
  const access = await requireApiSession("finance.view");
  if ("response" in access) return access.response;
  const { session } = access;
  return NextResponse.json({ receipts: await getReceiptsForInstitution(session.user.institutionId) });
}
