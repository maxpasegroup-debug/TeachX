import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { archiveContent, duplicateContent, publishContent } from "@/services/publishing-service";

export async function POST(request: Request) {
  const access = await requireApiSession("content.manage");
  if ("response" in access) return access.response;
  const { session } = access;
  const body = await request.json();
  const action = body.action ?? "publish";
  const item = action === "archive"
    ? await archiveContent(body.itemId)
    : action === "duplicate"
      ? await duplicateContent(body.itemId, session.user.id)
      : await publishContent(body.itemId);
  return NextResponse.json({ item });
}
