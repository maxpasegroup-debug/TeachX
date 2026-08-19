import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireApiSession } from "@/lib/api-auth";
import { updateOperationalIncident } from "@/services/operations-service";

export async function PATCH(request: Request, { params }: { params: Promise<{ incidentId: string }> }) {
  const access = await requireApiSession("settings.manage");
  if ("response" in access) return access.response;
  try {
    const { incidentId } = await params;
    return NextResponse.json({ incident: await updateOperationalIncident(incidentId, await request.json(), access.session.user.id) });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Invalid update", issues: error.flatten() }, { status: 400 });
    if (error instanceof Error && error.message === "INCIDENT_NOT_FOUND") return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    if (error instanceof Error && error.message === "INVALID_INCIDENT_TRANSITION") return NextResponse.json({ error: "Incident status cannot move backwards or reopen." }, { status: 409 });
    if (error instanceof Error && error.message === "PUBLIC_UPDATE_REQUIRED") return NextResponse.json({ error: "Public incidents require a public update." }, { status: 400 });
    throw error;
  }
}
