import type { AutomationTrigger, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { dispatchNotification } from "@/services/notification-dispatch-service";

export async function getAutomationRules(institutionId?: string | null) {
  if (!institutionId) return [];
  return prisma.automationRule.findMany({ where: { institutionId }, include: { executions: { orderBy: { createdAt: "desc" }, take: 5 } }, orderBy: { updatedAt: "desc" } });
}

export async function createAutomationRule(input: { institutionId: string; name: string; trigger: AutomationTrigger; actions: Prisma.InputJsonValue; conditions?: Prisma.InputJsonValue }) {
  return prisma.automationRule.create({ data: { ...input, status: "DRAFT" } });
}

export async function executeAutomation(input: { institutionId: string; trigger: AutomationTrigger; actorId?: string; entity?: string; entityId?: string }) {
  const rules = await prisma.automationRule.findMany({ where: { institutionId: input.institutionId, trigger: input.trigger, status: "ACTIVE" } });
  const executions = [];

  for (const rule of rules) {
    const execution = await prisma.automationExecution.create({ data: { ruleId: rule.id, actorId: input.actorId, entity: input.entity, entityId: input.entityId, status: "PENDING" } });
    await dispatchNotification({ institutionId: input.institutionId, actorId: input.actorId, type: "SYSTEM", title: `Automation ready: ${rule.name}`, body: input.trigger.replaceAll("_", " "), link: "/dashboard" });
    executions.push(await prisma.automationExecution.update({ where: { id: execution.id }, data: { status: "COMPLETED", completedAt: new Date(), result: { simulated: true } } }));
  }

  return executions;
}
