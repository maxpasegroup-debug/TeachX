import bcrypt from "bcryptjs";
import { z } from "zod";

import { rolePermissions } from "@/lib/constants/roles";
import { prisma } from "@/lib/db";
import { defaultWhiteLabelConfig } from "@/services/white-label-service";

export const setupSchema = z.object({
  institutionName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  academicYear: z.string().min(4),
  academicStartDate: z.string().min(8),
  academicEndDate: z.string().min(8),
  branchName: z.string().min(2),
  branchCode: z.string().min(2),
  courseName: z.string().min(2),
  courseCode: z.string().min(2),
  feeHeadName: z.string().min(2),
  adminName: z.string().min(2),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8)
});

export async function hasCompletedFirstRun() {
  return (await prisma.institution.count()) > 0;
}

export async function completeFirstRunSetup(input: unknown) {
  if (await hasCompletedFirstRun()) {
    throw new Error("First run setup is already complete.");
  }

  const data = setupSchema.parse(input);
  const passwordHash = await bcrypt.hash(data.adminPassword, 12);
  const permissions = await prisma.permission.findMany();

  return prisma.$transaction(async (tx) => {
    const institution = await tx.institution.create({
      data: {
        name: data.institutionName,
        email: data.email,
        phone: data.phone || null,
        website: data.website || null,
        academicYear: data.academicYear
      }
    });

    for (const [roleKey, permissionKeys] of Object.entries(rolePermissions)) {
      const role = await tx.role.upsert({ where: { key: roleKey }, update: {}, create: { key: roleKey, name: roleKey.split("_").join(" ") } });
      for (const permissionKey of permissionKeys) {
        const permission = permissions.find((item) => item.key === permissionKey) ?? (await tx.permission.upsert({ where: { key: permissionKey }, update: {}, create: { key: permissionKey, name: permissionKey } }));
        await tx.rolePermission.upsert({ where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } }, update: {}, create: { roleId: role.id, permissionId: permission.id } });
      }
    }

    const adminRole = await tx.role.findUniqueOrThrow({ where: { key: "ADMIN" } });
    const admin = await tx.user.create({ data: { institutionId: institution.id, name: data.adminName, email: data.adminEmail.toLowerCase(), passwordHash } });
    await tx.userRole.create({ data: { userId: admin.id, roleId: adminRole.id } });
    await tx.academicYear.create({ data: { institutionId: institution.id, name: data.academicYear, startDate: new Date(data.academicStartDate), endDate: new Date(data.academicEndDate), status: "CURRENT", isCurrent: true } });
    const branch = await tx.branch.create({ data: { institutionId: institution.id, name: data.branchName, code: data.branchCode } });
    await tx.course.create({ data: { institutionId: institution.id, branchId: branch.id, name: data.courseName, code: data.courseCode, duration: "To be configured", category: "Foundation" } });
    await tx.feeHead.create({ data: { institutionId: institution.id, name: data.feeHeadName, type: "COURSE", isActive: true } });
    await tx.auditLog.create({ data: { institutionId: institution.id, actorId: admin.id, action: "CREATE", entity: "Institution", entityId: institution.id, message: "First run setup completed." } });
    await tx.setting.create({ data: { institutionId: institution.id, key: "white_label", value: defaultWhiteLabelConfig(institution.name) } });
    return { institution, admin };
  });
}
