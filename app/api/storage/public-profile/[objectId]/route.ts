import { NextResponse } from "next/server";

import { getClientKey, rateLimit } from "@/lib/security";
import { authorizePublicProfilePhoto } from "@/services/private-storage-service";

export async function GET(request: Request, context: { params: Promise<{ objectId: string }> }) {
  const limited = await rateLimit(`public-profile-photo:${getClientKey(request, "anonymous")}`, 120, 60_000);
  if (limited) return limited;
  const { objectId } = await context.params;
  try {
    const url = await authorizePublicProfilePhoto(objectId);
    return NextResponse.redirect(url, {
      status: 307,
      headers: { "Cache-Control": "public, max-age=300", "Referrer-Policy": "no-referrer" }
    });
  } catch {
    return NextResponse.json({ error: "Profile photo not found." }, { status: 404 });
  }
}
