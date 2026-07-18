import type { PermissionKey, RoleKey } from "@/lib/constants/roles";
import { rolePermissions } from "@/lib/constants/roles";

export function roleHasPermission(role: RoleKey, permission: PermissionKey) {
  return rolePermissions[role].includes(permission);
}

export function userHasPermission(roles: RoleKey[] = [], permission: PermissionKey) {
  return roles.some((role) => roleHasPermission(role, permission));
}

export function requirePermission(roles: RoleKey[] = [], permission: PermissionKey) {
  if (!userHasPermission(roles, permission)) {
    throw new Error(`Missing permission: ${permission}`);
  }
}
