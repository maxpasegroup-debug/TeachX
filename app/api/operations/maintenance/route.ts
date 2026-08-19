import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireApiSession } from "@/lib/api-auth";
import { getOperationsCommandData, setMaintenanceControl } from "@/services/operations-service";

export async function GET() {
  const access = await requireApiSession("settings.manage");
  if ("response" in access) return access.response;
  return NextResponse.json({ control: (await getOperationsCommandData()).control });
}

export async function PUT(request: Request) {
  const access = await requireApiSession("settings.manage");
  if ("response" in access) return access.response;
  try {
    return NextResponse.json({ control: await setMaintenanceControl(await request.json(), access.session.user.id) });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Invalid maintenance window", issues: error.flatten() }, { status: 400 });
    throw error;
  }
}
