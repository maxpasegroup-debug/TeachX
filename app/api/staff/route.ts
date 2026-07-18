import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const access = await requireApiSession("staff.view");
  if ("response" in access) return access.response;
  const { session } = access;
  const staff = await prisma.staffProfile.findMany({ where: { user: { institutionId: session.user.institutionId } }, include: { user: true, salaries: true, leaveBalances: true }, orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ staff });
}

export async function POST(request: Request) {
  const access = await requireApiSession("staff.manage");
  if ("response" in access) return access.response;
  const { session } = access;
  const body = await request.json();
  const user = await prisma.user.findFirst({ where: { id: body.userId, institutionId: session.user.institutionId } });
  if (!user) return NextResponse.json({ error: "Staff user not found" }, { status: 404 });
  const staff = await prisma.staffProfile.upsert({
    where: { userId: body.userId },
    update: { department: body.department, designation: body.designation },
    create: { userId: body.userId, department: body.department, designation: body.designation, joiningDate: body.joiningDate ? new Date(body.joiningDate) : undefined }
  });
  return NextResponse.json({ staff }, { status: 201 });
}
