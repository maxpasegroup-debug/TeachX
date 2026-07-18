import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getLeaderboard } from "@/services/leaderboard-service";

export async function GET(_: Request, { params }: { params: Promise<{ examId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { examId } = await params;
  const leaderboard = await getLeaderboard(examId);
  return NextResponse.json({ leaderboard });
}
