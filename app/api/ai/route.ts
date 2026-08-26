import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { requireApiSession } from "@/lib/api-auth";
import { authorizeAIScope } from "@/lib/ai-authorization";
import { captureOperationalError } from "@/lib/observability/logger";
import { getRequestId } from "@/lib/observability/request-context";
import { getClientKey, rateLimit } from "@/lib/security";
import { runAI } from "@/services/ai-service";

const aiRequestSchema = z.object({
  scope: z.enum(["TEACHER", "STUDENT", "ADMISSIONS", "DIRECTOR", "FINANCE", "SEARCH", "SYSTEM"]).optional(),
  feature: z.string().trim().min(1).max(80).optional(),
  prompt: z.string().trim().min(1).max(8000),
  context: z.unknown().optional()
});

export async function POST(request: Request) {
  const limited = await rateLimit(`ai:${getClientKey(request, "ai")}`, 20, 60_000);
  if (limited) return limited;
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid AI request." }, { status: 400 });
  }
  const parsed = aiRequestSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: "Invalid AI request." }, { status: 400 });
  const body = parsed.data;
  let scope;
  try {
    scope = authorizeAIScope(access.session.user.roles, body.scope);
  } catch {
    return NextResponse.json({ error: "This AI capability is not available for this account." }, { status: 403 });
  }
  const requestId = await getRequestId();
  try {
    const result = await runAI({
      institutionId: access.session.user.institutionId,
      userId: access.session.user.id,
      scope,
      feature: body.feature ?? "general",
      prompt: body.prompt,
      context: body.context as Prisma.InputJsonValue | undefined
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "AI_SCOPE_FORBIDDEN" || message === "AI_TEACHER_FORBIDDEN") return NextResponse.json({ error: "This AI scope is not available for this account." }, { status: 403 });
    if (message === "Complete workspace setup before using AI Studio.") return NextResponse.json({ error: message }, { status: 403 });
    if (message.startsWith("Your AI credits are used") || message.startsWith("AI access is not active")) return NextResponse.json({ error: message }, { status: 402 });
    captureOperationalError(error, "ai.request.failed", {
      requestId,
      scope,
      feature: body.feature ?? "general"
    });
    return NextResponse.json({ error: "AI service is temporarily unavailable.", requestId }, { status: 502 });
  }
}
