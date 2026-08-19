import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { getEmailConfig } from "@/lib/email/config";
import { getRequestId } from "@/lib/observability/request-context";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await requireApiSession("settings.manage");
  if ("response" in access) return access.response;
  const institutionId = access.session.user.institutionId;
  if (!institutionId) return NextResponse.json({ error: "Institution required." }, { status: 400 });
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [accepted, delivered, failed, delayed] = await Promise.all([
    prisma.transactionalEmail.count({ where: { institutionId, status: "ACCEPTED", createdAt: { gte: since } } }),
    prisma.transactionalEmail.count({ where: { institutionId, status: "DELIVERED", createdAt: { gte: since } } }),
    prisma.transactionalEmail.count({ where: { institutionId, status: { in: ["BOUNCED", "COMPLAINED", "SUPPRESSED", "FAILED"] }, createdAt: { gte: since } } }),
    prisma.transactionalEmail.count({ where: { institutionId, status: "DELAYED", createdAt: { gte: since } } })
  ]);
  const config = getEmailConfig();
  return NextResponse.json({ ok: config.live && failed === 0, provider: config.provider, controls: { configured: config.configured, domainVerified: config.domainVerified, dmarcReady: config.dmarcReady, transactionalReady: config.transactionalReady }, evidence: { accepted, delivered, delayed, failed }, requestId: await getRequestId() });
}
