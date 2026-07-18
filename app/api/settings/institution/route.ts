import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user.institutionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const institution = await prisma.institution.findUnique({
    where: { id: session.user.institutionId }
  });

  return NextResponse.json({ institution });
}
