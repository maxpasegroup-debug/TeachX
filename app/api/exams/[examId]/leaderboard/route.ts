import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getLeaderboard } from "@/services/leaderboard-service";

export async function GET(_: Request, { params }: { params: Promise<{ examId: string }> }) {
  const user = await getCurrentUser();
  if (!user?.institutionId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { examId } = await params;
  const leaderboard = await getLeaderboard(examId, { userId: user.id, institutionId: user.institutionId, roles: user.roles });
  return NextResponse.json({ leaderboard });
}
