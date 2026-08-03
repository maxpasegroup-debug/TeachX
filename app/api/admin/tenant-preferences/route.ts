import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiSession } from "@/lib/api-auth";
import { prisma } from "@/lib/db";

const schema = z.object({ compact: z.boolean(), exportFormat: z.enum(["json", "csv"]) });

export async function POST(request: Request) {
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  if (!access.session.user.roles.includes("ADMIN")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid tenant preferences" }, { status: 400 });
  await prisma.userPreference.upsert({
    where: { userId_key: { userId: access.session.user.id, key: "adminx.tenant.preferences" } },
    create: { userId: access.session.user.id, key: "adminx.tenant.preferences", value: parsed.data },
    update: { value: parsed.data }
  });
  return NextResponse.json({ ok: true });
}