import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

import { verifyResendWebhook } from "@/lib/email/provider";
import { recordEmailEvent } from "@/services/transactional-email-service";

export async function POST(request: Request) {
  const rawBody = await request.text();
  let event;
  try {
    event = verifyResendWebhook(rawBody, request.headers);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }
  const providerEventId = request.headers.get("svix-id");
  const data = event.data as { email_id?: string; created_at?: string };
  if (!providerEventId || !data.email_id) return NextResponse.json({ error: "Invalid event." }, { status: 400 });
  try {
    await recordEmailEvent({ providerEventId, type: event.type, providerMessageId: data.email_id, payloadHash: createHash("sha256").update(rawBody).digest("hex"), providerCreatedAt: data.created_at ? new Date(data.created_at) : undefined });
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Event processing failed." }, { status: 500 });
  }
}
