import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { getRequestId } from "@/lib/observability/request-context";
import { createPaymentCheckout } from "@/services/payment-service";

const schema = z.object({ orderId: z.string().min(10).max(100) }).strict();

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
  const requestId = await getRequestId();
  try {
    return NextResponse.json({ ...(await createPaymentCheckout({ orderId: parsed.data.orderId, userId: session.user.id })), requestId });
  } catch {
    return NextResponse.json({ error: "Checkout is currently unavailable.", requestId }, { status: 409 });
  }
}

