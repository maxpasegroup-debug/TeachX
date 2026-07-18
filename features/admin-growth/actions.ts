"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { userHasPermission } from "@/lib/rbac";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user.id || !session.user.institutionId) throw new Error("Admin session required.");
  if (!session.user.roles.includes("ADMIN") && !userHasPermission(session.user.roles, "settings.manage")) throw new Error("Admin access required.");
  return session;
}

export async function createSupportTicketAction(formData: FormData) {
  const session = await requireAdmin();
  const subject = value(formData, "subject");
  const body = value(formData, "body");
  if (!subject || !body) return;

  const ticket = await prisma.supportTicket.create({
    data: {
      institutionId: session.user.institutionId,
      requesterId: session.user.id,
      subject,
      body,
      type: (value(formData, "type") || "SUPPORT") as never,
      priority: (value(formData, "priority") || "NORMAL") as never,
      source: "admin-growth-os",
      metadata: { knowledgeBasePlaceholder: true }
    }
  });

  await writeAuditLog({ institutionId: session.user.institutionId, actorId: session.user.id, action: "CREATE", entity: "SupportTicket", entityId: ticket.id, message: `Created support ticket ${ticket.subject}` });
  revalidatePath("/admin/support");
}

export async function updateSupportTicketAction(formData: FormData) {
  const session = await requireAdmin();
  const ticketId = value(formData, "ticketId");
  if (!ticketId) return;

  await prisma.supportTicket.updateMany({
    where: { id: ticketId, institutionId: session.user.institutionId },
    data: {
      status: (value(formData, "status") || "IN_REVIEW") as never,
      priority: (value(formData, "priority") || "NORMAL") as never
    }
  });

  const reply = value(formData, "reply");
  if (reply) {
    await prisma.supportReply.create({ data: { institutionId: session.user.institutionId, ticketId, authorId: session.user.id, body: reply, internal: formData.get("internal") === "on" } });
  }

  await writeAuditLog({ institutionId: session.user.institutionId, actorId: session.user.id, action: "UPDATE", entity: "SupportTicket", entityId: ticketId, message: "Updated support ticket" });
  revalidatePath("/admin/support");
}

export async function saveFeatureFlagAction(formData: FormData) {
  const session = await requireAdmin();
  const institutionId = session.user.institutionId!;
  const key = value(formData, "key");
  if (!key) return;

  const flag = await prisma.featureFlag.upsert({
    where: { institutionId_key: { institutionId, key } },
    update: {
      name: value(formData, "name") || key,
      description: value(formData, "description") || undefined,
      enabled: formData.get("enabled") === "on",
      scope: value(formData, "scope") || "platform",
      metadata: { source: "admin-growth-os" }
    },
    create: {
      institutionId,
      key,
      name: value(formData, "name") || key,
      description: value(formData, "description") || undefined,
      enabled: formData.get("enabled") === "on",
      scope: value(formData, "scope") || "platform",
      metadata: { source: "admin-growth-os" }
    }
  });

  await writeAuditLog({ institutionId, actorId: session.user.id, action: "UPDATE", entity: "FeatureFlag", entityId: flag.id, message: `Feature flag ${flag.key} saved` });
  revalidatePath("/admin/system-settings");
}

export async function saveSystemSettingAction(formData: FormData) {
  const session = await requireAdmin();
  const institutionId = session.user.institutionId!;
  const key = value(formData, "key");
  const settingValue = value(formData, "value");
  if (!key) return;

  await prisma.setting.upsert({
    where: { institutionId_key: { institutionId, key } },
    update: { value: { value: settingValue, category: value(formData, "category") || "platform" } },
    create: { institutionId, key, value: { value: settingValue, category: value(formData, "category") || "platform" } }
  });

  await writeAuditLog({ institutionId, actorId: session.user.id, action: "UPDATE", entity: "Setting", entityId: key, message: `Updated setting ${key}` });
  revalidatePath("/admin/system-settings");
}

export async function recordPlatformMetricAction(formData: FormData) {
  const session = await requireAdmin();
  const key = value(formData, "key");
  const label = value(formData, "label");
  const metricValue = Number(value(formData, "value") || 0);
  if (!key || !label) return;

  await prisma.platformMetric.create({
    data: {
      institutionId: session.user.institutionId,
      key,
      label,
      value: Number.isFinite(metricValue) ? metricValue : 0,
      dimension: value(formData, "dimension") || undefined,
      metadata: { exportReady: true }
    }
  });

  await writeAuditLog({ institutionId: session.user.institutionId, actorId: session.user.id, action: "CREATE", entity: "PlatformMetric", entityId: key, message: `Recorded metric ${label}` });
  revalidatePath("/admin/reports");
}
