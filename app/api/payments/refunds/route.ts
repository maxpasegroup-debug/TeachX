import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiSession } from "@/lib/api-auth";
import { getRequestId } from "@/lib/observability/request-context";
import { requestFullRefund } from "@/services/payment-service";

const schema = z.object({ orderId: z.string().min(10).max(100), confirmation: z.literal("FULL_REFUND") }).strict();

export async function POST(request: Request) {
  const access = await requireApiSession("finance.manage");
  if ("response" in access) return access.response;
  if (!access.session.user.institutionId) return NextResponse.json({ error: "Institution required." }, { status: 400 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "A confirmed full refund is required." }, { status: 400 });
  const requestId = await getRequestId();
  try {
    const result = await requestFullRefund({ orderId: parsed.data.orderId, institutionId: access.session.user.institutionId });
    return NextResponse.json({ accepted: true, ...result, requestId }, { status: 202 });
  } catch {
    return NextResponse.json({ error: "Refund could not be submitted.", requestId }, { status: 409 });
  }
}

