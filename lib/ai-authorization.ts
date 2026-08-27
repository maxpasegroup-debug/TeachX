import type { AIConversationScope } from "@prisma/client";

import type { RoleKey } from "@/lib/constants/roles";
import { userHasPermission } from "@/lib/rbac";

const teacherRoles: RoleKey[] = ["ACADEMIC_HEAD", "ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"];

export function allowedAIScopes(roles: RoleKey[]): AIConversationScope[] {
  const scopes = new Set<AIConversationScope>();
  if (roles.includes("STUDENT")) scopes.add("STUDENT");
  if (roles.some((role) => teacherRoles.includes(role))) scopes.add("TEACHER");
  if (userHasPermission(roles, "director.view")) scopes.add("DIRECTOR");
  if (userHasPermission(roles, "finance.view")) scopes.add("FINANCE");
  if (userHasPermission(roles, "people.view")) scopes.add("SEARCH");
  if (roles.includes("ADMIN")) scopes.add("SYSTEM");
  return [...scopes];
}

export function authorizeAIScope(roles: RoleKey[], requested?: AIConversationScope) {
  const allowed = allowedAIScopes(roles);
  if (requested && allowed.includes(requested)) return requested;
  if (requested) throw new Error("AI_SCOPE_FORBIDDEN");
  for (const scope of ["TEACHER", "STUDENT", "DIRECTOR", "FINANCE", "SEARCH", "SYSTEM"] as AIConversationScope[]) {
    if (allowed.includes(scope)) return scope;
  }
  throw new Error("AI_SCOPE_FORBIDDEN");
}
