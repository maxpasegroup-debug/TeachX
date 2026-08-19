import { z } from "zod";

import { prisma } from "@/lib/db";
import { getOperationsConfig } from "@/lib/operations/config";

const components = ["Website", "Teacher workspace", "AI creation", "Billing", "Account email", "File storage", "Support"] as const;
const statuses = ["INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"] as const;

export const createIncidentSchema = z.object({
  title: z.string().trim().min(5).max(120),
  summary: z.string().trim().min(10).max(500),
  severity: z.enum(["SEV1", "SEV2", "SEV3"]),
  affectedComponents: z.array(z.enum(components)).min(1).max(7),
  publicVisible: z.boolean().default(true),
  isDrill: z.boolean().default(false),
  commanderId: z.string().trim().min(1).max(100),
  publicMessage: z.string().trim().min(10).max(500).optional()
});

export const updateIncidentSchema = z.object({
  status: z.enum(statuses),
  internalNote: z.string().trim().min(5).max(2_000),
  publicMessage: z.string().trim().min(10).max(500).optional(),
  commanderId: z.string().trim().min(1).max(100).optional(),
  publicVisible: z.boolean().optional()
});

export const maintenanceSchema = z.object({
  enabled: z.boolean(),
  message: z.string().trim().min(10).max(300).nullable().optional(),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional()
}).superRefine((value, context) => {
  if (value.enabled && !value.message) context.addIssue({ code: "custom", path: ["message"], message: "A public maintenance message is required." });
  if (value.startsAt && value.endsAt && new Date(value.endsAt) <= new Date(value.startsAt)) {
    context.addIssue({ code: "custom", path: ["endsAt"], message: "Maintenance must end after it starts." });
  }
});

const transitions: Record<(typeof statuses)[number], (typeof statuses)[number][]> = {
  INVESTIGATING: ["IDENTIFIED", "MONITORING", "RESOLVED"],
  IDENTIFIED: ["MONITORING", "RESOLVED"],
  MONITORING: ["RESOLVED"],
  RESOLVED: []
};

export async function getOperationsCommandData() {
  const [incidents, control] = await Promise.all([
    prisma.operationalIncident.findMany({
      orderBy: { startedAt: "desc" },
      take: 50,
      include: { updates: { orderBy: { createdAt: "desc" } } }
    }),
    prisma.platformOperationalControl.findUnique({ where: { id: "global" } })
  ]);
  return { config: getOperationsConfig(), incidents, control, components };
}

export async function createOperationalIncident(input: unknown, actorId: string) {
  const data = createIncidentSchema.parse(input);
  const now = new Date();
  const publicMessage = data.publicVisible ? data.publicMessage ?? data.summary : null;
  return prisma.$transaction(async (tx) => {
    const incident = await tx.operationalIncident.create({
      data: {
        title: data.title,
        summary: data.summary,
        severity: data.severity,
        affectedComponents: data.affectedComponents,
        publicVisible: data.publicVisible,
        isDrill: data.isDrill,
        commanderId: data.commanderId,
        createdById: actorId,
        acknowledgedAt: now,
        updates: { create: { status: "INVESTIGATING", internalNote: data.summary, publicMessage, authorId: actorId } }
      },
      include: { updates: true }
    });
    await tx.auditLog.create({ data: { actorId, action: "CREATE", entity: "OperationalIncident", entityId: incident.id, message: `${data.severity} incident opened${data.isDrill ? " as a drill" : ""}` } });
    return incident;
  });
}

export async function updateOperationalIncident(id: string, input: unknown, actorId: string) {
  const data = updateIncidentSchema.parse(input);
  return prisma.$transaction(async (tx) => {
    const incident = await tx.operationalIncident.findUnique({ where: { id } });
    if (!incident) throw new Error("INCIDENT_NOT_FOUND");
    if (data.status !== incident.status && !transitions[incident.status].includes(data.status)) throw new Error("INVALID_INCIDENT_TRANSITION");
    if (incident.publicVisible && data.publicVisible !== false && !data.publicMessage) throw new Error("PUBLIC_UPDATE_REQUIRED");
    const now = new Date();
    const result = await tx.operationalIncident.update({
      where: { id },
      data: {
        status: data.status,
        commanderId: data.commanderId,
        publicVisible: data.publicVisible,
        identifiedAt: data.status === "IDENTIFIED" && !incident.identifiedAt ? now : undefined,
        monitoringAt: data.status === "MONITORING" && !incident.monitoringAt ? now : undefined,
        resolvedAt: data.status === "RESOLVED" ? now : undefined,
        updates: { create: { status: data.status, internalNote: data.internalNote, publicMessage: data.publicMessage, authorId: actorId } }
      },
      include: { updates: { orderBy: { createdAt: "desc" } } }
    });
    await tx.auditLog.create({ data: { actorId, action: "UPDATE", entity: "OperationalIncident", entityId: id, message: `Incident moved from ${incident.status} to ${data.status}` } });
    return result;
  });
}

export async function setMaintenanceControl(input: unknown, actorId: string) {
  const data = maintenanceSchema.parse(input);
  const values = {
    maintenanceEnabled: data.enabled,
    maintenanceMessage: data.enabled ? data.message : null,
    maintenanceStartsAt: data.enabled && data.startsAt ? new Date(data.startsAt) : null,
    maintenanceEndsAt: data.enabled && data.endsAt ? new Date(data.endsAt) : null,
    updatedById: actorId
  };
  return prisma.$transaction(async (tx) => {
    const control = await tx.platformOperationalControl.upsert({ where: { id: "global" }, create: { id: "global", ...values }, update: values });
    await tx.auditLog.create({ data: { actorId, action: "UPDATE", entity: "PlatformOperationalControl", entityId: "global", message: data.enabled ? "Public maintenance notice enabled" : "Public maintenance notice disabled" } });
    return control;
  });
}

export async function getPublicOperations() {
  try {
    const [incidents, maintenance] = await Promise.all([
      prisma.operationalIncident.findMany({
        where: { publicVisible: true },
        orderBy: { startedAt: "desc" },
        take: 10,
        select: {
          id: true, title: true, severity: true, status: true, affectedComponents: true, startedAt: true, resolvedAt: true,
          updates: { where: { publicMessage: { not: null } }, orderBy: { createdAt: "desc" }, select: { status: true, publicMessage: true, createdAt: true } }
        }
      }),
      prisma.platformOperationalControl.findUnique({ where: { id: "global" }, select: { maintenanceEnabled: true, maintenanceMessage: true, maintenanceStartsAt: true, maintenanceEndsAt: true } })
    ]);
    return { incidents, maintenance };
  } catch {
    return { incidents: [], maintenance: null };
  }
}
