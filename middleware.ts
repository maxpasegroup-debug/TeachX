import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import type { PermissionKey, RoleKey } from "@/lib/constants/roles";
import { rolePermissions } from "@/lib/constants/roles";
import { getRoutePermission, publicRoutes } from "@/lib/constants/route-permissions";

function hasPermission(roles: RoleKey[] = [], permission: PermissionKey) {
  return roles.some((role) => rolePermissions[role]?.includes(permission));
}

export default async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const isLandingPage = nextUrl.pathname === "/";
  const isPublicRoute = isLandingPage || publicRoutes.some((route) => nextUrl.pathname === route || nextUrl.pathname.startsWith(`${route}/`));
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET
  });
  const isAuthenticated = Boolean(token);

  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && ["/login", "/forgot-password"].includes(nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  const requiredPermission = getRoutePermission(nextUrl.pathname);
  const roles = (token?.roles ?? []) as RoleKey[];

  if (requiredPermission && !hasPermission(roles, requiredPermission)) {
    return NextResponse.redirect(new URL("/access-denied", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
