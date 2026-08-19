import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireApiSession } from "@/lib/api-auth";
import { cancelPrivacyRequest, createPrivacyRequest, getUserPrivacyCenter } from "@/services/privacy-service";

export async function GET() {
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  return NextResponse.json(await getUserPrivacyCenter(access.session.user.id));
}

export async function POST(request: Request) {
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  try {
    const privacyRequest = await createPrivacyRequest(access.session.user, await request.json());
    return NextResponse.json({ request: privacyRequest }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Invalid privacy request", issues: error.flatten() }, { status: 400 });
    if (error instanceof Error && error.message === "DUPLICATE_PRIVACY_REQUEST") return NextResponse.json({ error: "An open request of this type already exists." }, { status: 409 });
    throw error;
  }
}

export async function DELETE(request: Request) {
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
  try { return NextResponse.json({ request: await cancelPrivacyRequest(id, access.session.user.id) }); }
  catch (error) {
    if (error instanceof Error && error.message === "PRIVACY_REQUEST_NOT_FOUND") return NextResponse.json({ error: "Request not found" }, { status: 404 });
    if (error instanceof Error && error.message === "INVALID_PRIVACY_TRANSITION") return NextResponse.json({ error: "This request can no longer be cancelled." }, { status: 409 });
    throw error;
  }
}
