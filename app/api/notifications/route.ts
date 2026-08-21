import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.institutionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id, institutionId: session.user.institutionId },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  return NextResponse.json({ notifications });
}
