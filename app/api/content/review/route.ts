import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { approveContent, getApprovalQueues, reviewContent } from "@/services/review-service";

export async function GET() {
  const access = await requireApiSession("content.manage");
  if ("response" in access) return access.response;
  const { session } = access;
  return NextResponse.json(await getApprovalQueues(session.user.institutionId));
}

export async function POST(request: Request) {
  const access = await requireApiSession("content.manage");
  if ("response" in access) return access.response;
  const { session } = access;
  const body = await request.json();
  const result = body.stage === "ACADEMIC_APPROVAL"
    ? await approveContent({ itemId: body.itemId, approverId: session.user.id, decision: body.decision, notes: body.notes })
    : await reviewContent({ itemId: body.itemId, reviewerId: session.user.id, decision: body.decision, notes: body.notes });
  return NextResponse.json({ result });
}
