import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.institutionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const notification = await prisma.notification.updateMany({
    where: { id, userId: session.user.id, institutionId: session.user.institutionId },
    data: { status: "READ", readAt: new Date() }
  });
  if (!notification.count) return NextResponse.json({ error: "Notification not found." }, { status: 404 });

  return NextResponse.json({ updated: true });
}
