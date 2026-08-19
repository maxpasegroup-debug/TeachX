import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireApiSession } from "@/lib/api-auth";
import { createOperationalIncident, getOperationsCommandData } from "@/services/operations-service";

export async function GET() {
  const access = await requireApiSession("settings.manage");
  if ("response" in access) return access.response;
  return NextResponse.json(await getOperationsCommandData());
}

export async function POST(request: Request) {
  const access = await requireApiSession("settings.manage");
  if ("response" in access) return access.response;
  try {
    const incident = await createOperationalIncident(await request.json(), access.session.user.id);
    return NextResponse.json({ incident }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Invalid incident", issues: error.flatten() }, { status: 400 });
    throw error;
  }
}
