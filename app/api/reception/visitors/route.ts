import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { createVisitor, getReceptionOverview } from "@/services/reception-service";

export async function GET() {
  const access = await requireApiSession("reception.view");
  if ("response" in access) return access.response;
  const { session } = access;
  const overview = await getReceptionOverview(session.user.institutionId);
  return NextResponse.json({ visitors: overview.visitors });
}

export async function POST(request: Request) {
  const access = await requireApiSession("reception.manage");
  if ("response" in access) return access.response;
  const { session } = access;
  if (!session.user.institutionId) return NextResponse.json({ error: "Institution required" }, { status: 400 });
  const body = await request.json();
  const visitor = await createVisitor({ institutionId: session.user.institutionId, name: body.name, phone: body.phone, purpose: body.purpose, remarks: body.remarks });
  return NextResponse.json({ visitor }, { status: 201 });
}
