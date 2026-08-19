import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { requireApiSession } from "@/lib/api-auth";
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
  const parsed = aiRequestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid AI request." }, { status: 400 });
  const body = parsed.data;
  const requestId = await getRequestId();
  try {
    const result = await runAI({
      institutionId: access.session.user.institutionId,
      userId: access.session.user.id,
      scope: body.scope ?? "SYSTEM",
      feature: body.feature ?? "general",
      prompt: body.prompt,
      context: body.context as Prisma.InputJsonValue | undefined
    });
    return NextResponse.json(result);
  } catch (error) {
    captureOperationalError(error, "ai.request.failed", {
      requestId,
      scope: body.scope ?? "SYSTEM",
      feature: body.feature ?? "general"
    });
    return NextResponse.json({ error: "AI service is temporarily unavailable.", requestId }, { status: 502 });
  }
}
