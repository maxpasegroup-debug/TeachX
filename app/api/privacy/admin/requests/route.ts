import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireApiSession } from "@/lib/api-auth";
import { getPrivacyAdministration, updatePrivacyRequest } from "@/services/privacy-service";

export async function GET() {
  const access = await requireApiSession("settings.manage");
  if ("response" in access) return access.response;
  if (!access.session.user.roles.includes("ADMIN")) return NextResponse.json({ error: "Platform administrator access required" }, { status: 403 });
  return NextResponse.json(await getPrivacyAdministration());
}

export async function PATCH(request: Request) {
  const access = await requireApiSession("settings.manage");
  if ("response" in access) return access.response;
  if (!access.session.user.roles.includes("ADMIN")) return NextResponse.json({ error: "Platform administrator access required" }, { status: 403 });
  try { return NextResponse.json({ request: await updatePrivacyRequest(await request.json(), access.session.user.id) }); }
  catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Invalid privacy request update", issues: error.flatten() }, { status: 400 });
    if (error instanceof Error && error.message === "PRIVACY_REQUEST_NOT_FOUND") return NextResponse.json({ error: "Request not found" }, { status: 404 });
    if (error instanceof Error && error.message === "INVALID_PRIVACY_TRANSITION") return NextResponse.json({ error: "Privacy request states cannot move backwards or reopen." }, { status: 409 });
    if (error instanceof Error && error.message === "LEGAL_HOLD_BLOCKS_FULFILMENT") return NextResponse.json({ error: "Release the legal hold or reject the deletion with a documented lawful reason." }, { status: 409 });
    throw error;
  }
}
