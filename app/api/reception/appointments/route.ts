import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { createAppointment, getReceptionOverview } from "@/services/reception-service";

export async function GET() {
  const access = await requireApiSession("reception.view");
  if ("response" in access) return access.response;
  const { session } = access;
  const overview = await getReceptionOverview(session.user.institutionId);
  return NextResponse.json({ appointments: overview.appointments });
}

export async function POST(request: Request) {
  const access = await requireApiSession("reception.manage");
  if ("response" in access) return access.response;
  const { session } = access;
  if (!session.user.institutionId) return NextResponse.json({ error: "Institution required" }, { status: 400 });
  const body = await request.json();
  const appointment = await createAppointment({ institutionId: session.user.institutionId, visitorName: body.visitorName, phone: body.phone, purpose: body.purpose, scheduledAt: new Date(body.scheduledAt) });
  return NextResponse.json({ appointment }, { status: 201 });
}
