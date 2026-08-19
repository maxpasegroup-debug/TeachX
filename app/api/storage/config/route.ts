import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { getStorageConfig } from "@/lib/storage/config";

export async function GET() {
  const access = await requireApiSession("content.manage");
  if ("response" in access) return access.response;
  const config = getStorageConfig();
  return NextResponse.json({ maxFileBytes: config.maxFileBytes, multipartThresholdBytes: config.multipartThresholdBytes, multipartPartBytes: config.multipartPartBytes, resumableTtlHours: config.resumableTtlHours });
}
