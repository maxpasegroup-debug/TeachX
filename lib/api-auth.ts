import { NextResponse } from "next/server";

import { auth } from "@/auth";
import type { PermissionKey } from "@/lib/constants/roles";
import { userHasPermission } from "@/lib/rbac";

export async function requireApiSession(permission?: PermissionKey) {
  const session = await auth();
  if (!session?.user) return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (permission && !userHasPermission(session.user.roles, permission)) {
    return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { session };
}
