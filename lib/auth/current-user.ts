import { auth } from "@/auth";
import type { PermissionKey, RoleKey } from "@/lib/constants/roles";
import { prisma } from "@/lib/db";
import { userHasPermission } from "@/lib/rbac";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  institutionId: string | null;
  roles: RoleKey[];
  authSessionVersion: number;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  const sessionVersion = session?.user.authSessionVersion;
  if (!session?.user.id || !Number.isInteger(sessionVersion)) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      institutionId: true,
      status: true,
      authSessionVersion: true,
      roles: { select: { role: { select: { key: true } } } }
    }
  });
  if (!user || user.status !== "ACTIVE" || user.authSessionVersion !== sessionVersion) return null;
  if ((session.user.institutionId ?? null) !== user.institutionId) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    institutionId: user.institutionId,
    authSessionVersion: user.authSessionVersion,
    roles: user.roles.map(({ role }) => role.key as RoleKey)
  };
}

export async function requireCurrentUser(permission?: PermissionKey) {
  const user = await getCurrentUser();
  if (!user) throw new Error("AUTHORIZATION_REQUIRED");
  if (permission && !userHasPermission(user.roles, permission)) throw new Error("PERMISSION_REQUIRED");
  return user;
}
