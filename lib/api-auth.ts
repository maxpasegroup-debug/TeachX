import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import type { PermissionKey } from "@/lib/constants/roles";
import { userHasPermission } from "@/lib/rbac";

export async function requireApiSession(permission?: PermissionKey) {
  const user = await getCurrentUser();
  if (!user) return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (permission && !userHasPermission(user.roles, permission)) {
    return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { session: { user } };
}
