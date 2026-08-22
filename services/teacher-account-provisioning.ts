import "server-only";

import type { Prisma } from "@prisma/client";

import { roleLabels, rolePermissions } from "@/lib/constants/roles";

const teacherRoleKey = "ACADEMIC_FACULTY" as const;

/** Ensures public teacher signup never depends on a separate seed command. */
export async function ensureTeacherRole(tx: Prisma.TransactionClient) {
  const requiredPermissions = rolePermissions[teacherRoleKey];
  const existing = await tx.role.findUnique({
    where: { key: teacherRoleKey },
    include: { permissions: { include: { permission: true } } }
  });

  const role = existing ?? await tx.role.upsert({
    where: { key: teacherRoleKey },
    update: {},
    create: { key: teacherRoleKey, name: roleLabels[teacherRoleKey] }
  });
  const assigned = new Set(existing?.permissions.map(({ permission }) => permission.key) ?? []);

  for (const permissionKey of requiredPermissions) {
    if (assigned.has(permissionKey)) continue;
    const permission = await tx.permission.upsert({
      where: { key: permissionKey },
      update: {},
      create: { key: permissionKey, name: permissionKey }
    });
    await tx.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
      update: {},
      create: { roleId: role.id, permissionId: permission.id }
    });
  }

  return role;
}
