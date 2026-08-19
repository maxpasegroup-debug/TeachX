import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireApiSession } from "@/lib/api-auth";
import { updateRetentionPolicy } from "@/services/privacy-service";

export async function PUT(request: Request) {
  const access = await requireApiSession("settings.manage");
  if ("response" in access) return access.response;
  if (!access.session.user.roles.includes("ADMIN")) return NextResponse.json({ error: "Platform administrator access required" }, { status: 403 });
  try { return NextResponse.json({ policy: await updateRetentionPolicy(await request.json(), access.session.user.id) }); }
  catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Invalid retention policy", issues: error.flatten() }, { status: 400 });
    throw error;
  }
}
