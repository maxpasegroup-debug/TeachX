import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { createLeaveApplication, getLeaveOverview } from "@/services/leave-service";

export async function GET() {
  const access = await requireApiSession("leave.view");
  if ("response" in access) return access.response;
  const { session } = access;
  return NextResponse.json(await getLeaveOverview(session.user.institutionId));
}

export async function POST(request: Request) {
  const access = await requireApiSession("leave.manage");
  if ("response" in access) return access.response;
  const { session } = access;
  const body = await request.json();
  const leave = await createLeaveApplication({ applicantId: session.user.id, fromDate: new Date(body.fromDate), toDate: new Date(body.toDate), reason: body.reason });
  return NextResponse.json({ leave }, { status: 201 });
}
