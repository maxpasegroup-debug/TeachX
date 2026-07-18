import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { createPayroll, getPayrollOverview } from "@/services/payroll-service";

export async function GET() {
  const access = await requireApiSession("staff.view");
  if ("response" in access) return access.response;
  const { session } = access;
  return NextResponse.json(await getPayrollOverview(session.user.institutionId));
}

export async function POST(request: Request) {
  const access = await requireApiSession("staff.manage");
  if ("response" in access) return access.response;
  const { session } = access;
  if (!session.user.institutionId) return NextResponse.json({ error: "Institution required" }, { status: 400 });
  const body = await request.json();
  const payroll = await createPayroll({ institutionId: session.user.institutionId, name: body.name, month: Number(body.month), year: Number(body.year) });
  return NextResponse.json({ payroll }, { status: 201 });
}
