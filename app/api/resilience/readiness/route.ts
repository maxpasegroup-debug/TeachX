import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { getRequestId } from "@/lib/observability/request-context";
import { getResilienceConfig } from "@/lib/resilience/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await requireApiSession("content.manage");
  if ("response" in access) return access.response;
  const institutionId = access.session.user.institutionId;
  if (!institutionId) return NextResponse.json({ error: "Institution required." }, { status: 400 });
  const since = new Date(Date.now() - 30 * 86_400_000);
  const [resumableActive, resumablePending, stalePending, completedParts, interruptedUploads] = await Promise.all([
    prisma.storageObject.count({ where: { institutionId, status: "ACTIVE", multipartUploadId: { not: null } } }),
    prisma.storageObject.count({ where: { institutionId, status: "PENDING", multipartUploadId: { not: null }, uploadExpiresAt: { gt: new Date() } } }),
    prisma.storageObject.count({ where: { institutionId, status: "PENDING", multipartUploadId: { not: null }, uploadExpiresAt: { lte: new Date() } } }),
    prisma.storageUploadPart.count({ where: { object: { institutionId }, completedAt: { gte: since } } }),
    prisma.storageTransferEvent.count({ where: { object: { institutionId }, kind: "MULTIPART_ABORTED", createdAt: { gte: since } } })
  ]);
  const config = getResilienceConfig();
  return NextResponse.json({ ok: config.live && stalePending === 0, controls: config.controls, evidence: { ...config.evidence, resumableActive, resumablePending, stalePending, completedParts, interruptedUploads }, requestId: await getRequestId() });
}
