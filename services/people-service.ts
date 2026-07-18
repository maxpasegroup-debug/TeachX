import { prisma } from "@/lib/db";

export async function getPeopleDirectory(institutionId?: string | null) {
  if (!institutionId) return { people: [], counts: [] };

  const people = await prisma.user.findMany({
    where: { institutionId },
    include: { profile: true, roles: { include: { role: true } } },
    orderBy: { name: "asc" },
    take: 80
  });

  const counts = await prisma.userRole.groupBy({
    by: ["roleId"],
    where: { user: { institutionId } },
    _count: { roleId: true }
  });
  const roles = await prisma.role.findMany({ where: { id: { in: counts.map((item) => item.roleId) } } });

  return {
    people,
    counts: counts.map((item) => ({ role: roles.find((role) => role.id === item.roleId)?.name ?? "Role", count: item._count.roleId }))
  };
}
