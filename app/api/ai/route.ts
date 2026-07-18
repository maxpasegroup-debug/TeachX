import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { requireApiSession } from "@/lib/api-auth";
import { getClientKey, rateLimit } from "@/lib/security";
import { runAI } from "@/services/ai-service";

const aiRequestSchema = z.object({
  scope: z.enum(["TEACHER", "STUDENT", "ADMISSIONS", "DIRECTOR", "FINANCE", "SEARCH", "SYSTEM"]).optional(),
  feature: z.string().trim().min(1).max(80).optional(),
  prompt: z.string().trim().min(1).max(8000),
  context: z.unknown().optional()
});

export async function POST(request: Request) {
  const limited = rateLimit(`ai:${getClientKey(request, "ai")}`, 20, 60_000);
  if (limited) return limited;
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  const parsed = aiRequestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid AI request." }, { status: 400 });
  const body = parsed.data;
  const result = await runAI({
    institutionId: access.session.user.institutionId,
    userId: access.session.user.id,
    scope: body.scope ?? "SYSTEM",
    feature: body.feature ?? "general",
    prompt: body.prompt,
    context: body.context as Prisma.InputJsonValue | undefined
  });
  return NextResponse.json(result);
}
