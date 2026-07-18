import type { DashboardWidgetType, Prisma, WorkspaceKind } from "@prisma/client";

import { prisma } from "@/lib/db";

export type WorkspaceWidget = {
  title: string;
  value?: string;
  description?: string;
  type?: DashboardWidgetType;
  href?: string;
  items?: string[];
  progress?: number;
};

export async function getDashboardWidgets(userId: string | undefined, workspace: WorkspaceKind, defaults: WorkspaceWidget[]) {
  if (!userId) return defaults;

  const saved = await prisma.dashboardWidget.findMany({
    where: {
      OR: [{ userId }, { userId: null }],
      workspace,
      isVisible: true
    },
    orderBy: { order: "asc" }
  });

  if (!saved.length) return defaults;

  return saved.map((widget) => ({
    title: widget.title,
    type: widget.type,
    description: typeof widget.config === "object" && widget.config && "description" in widget.config ? String(widget.config.description) : undefined
  }));
}

export async function upsertDashboardWidget(input: {
  userId?: string;
  workspace: WorkspaceKind;
  type: DashboardWidgetType;
  title: string;
  order?: number;
  config?: Prisma.InputJsonValue;
}) {
  return prisma.dashboardWidget.create({
    data: {
      userId: input.userId,
      workspace: input.workspace,
      type: input.type,
      title: input.title,
      order: input.order ?? 1,
      config: input.config
    }
  });
}
