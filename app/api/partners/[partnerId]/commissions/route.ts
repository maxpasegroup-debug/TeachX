import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getCommissionsForPartner } from "@/services/commission-service";

export async function GET(_: Request, { params }: { params: Promise<{ partnerId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { partnerId } = await params;
  const commissions = await getCommissionsForPartner(partnerId);
  return NextResponse.json({ commissions });
}
