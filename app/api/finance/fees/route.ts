import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { createFeeHead, createFeePlan, getFeeOverview } from "@/services/fee-service";

export async function GET() {
  const access = await requireApiSession("finance.view");
  if ("response" in access) return access.response;
  const { session } = access;
  const overview = await getFeeOverview(session.user.institutionId);
  return NextResponse.json(overview);
}

export async function POST(request: Request) {
  const access = await requireApiSession("finance.manage");
  if ("response" in access) return access.response;
  const { session } = access;
  if (!session.user.institutionId) return NextResponse.json({ error: "Institution required" }, { status: 400 });
  const body = await request.json();
  const result = body.kind === "plan"
    ? await createFeePlan({ institutionId: session.user.institutionId, name: body.name, totalAmount: String(body.totalAmount ?? 0), courseId: body.courseId, batchId: body.batchId, subjectId: body.subjectId })
    : await createFeeHead({ institutionId: session.user.institutionId, name: body.name, type: body.type ?? "CUSTOM", description: body.description });
  return NextResponse.json({ result }, { status: 201 });
}
