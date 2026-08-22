import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import type { PermissionKey, RoleKey } from "@/lib/constants/roles";
import { rolePermissions } from "@/lib/constants/roles";
import { getRoutePermission, isPublicApiRoute, publicRoutes } from "@/lib/constants/route-permissions";
import { prisma } from "@/lib/db";

const MAX_API_BODY_BYTES = 1024 * 1024;
const WRITE_FREEZE_EXEMPT_PREFIXES = ["/api/auth", "/api/email/webhooks", "/api/payments/webhooks"];
const WRITE_FREEZE_EXACT = ["/api/health", "/api/ready", "/api/status", "/api/version"];

function hasPermission(roles: RoleKey[] = [], permission: PermissionKey) {
  return roles.some((role) => rolePermissions[role]?.includes(permission));
}

function withRequestId(response: NextResponse, requestId: string) {
  response.headers.set("X-Request-Id", requestId);
  return response;
}

function nextResponse(request: NextRequest, requestId: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);
  return withRequestId(NextResponse.next({ request: { headers: requestHeaders } }), requestId);
}

function unauthorizedApi(requestId: string) {
  return withRequestId(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), requestId);
}

export default async function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const isApi = nextUrl.pathname.startsWith("/api/");
  const isLandingPage = nextUrl.pathname === "/";
  const isPublicRoute = isLandingPage || publicRoutes.some((route) => nextUrl.pathname === route || nextUrl.pathname.startsWith(`${route}/`));
  const publicApi = isApi && isPublicApiRoute(nextUrl.pathname);
  const contentLength = Number(request.headers.get("content-length") || 0);
  const incomingRequestId = request.headers.get("x-request-id") || "";
  const requestId = /^[A-Za-z0-9_-]{8,80}$/.test(incomingRequestId) ? incomingRequestId : crypto.randomUUID();

  if (isApi && contentLength > MAX_API_BODY_BYTES) {
    return withRequestId(NextResponse.json({ error: "Request body is too large." }, { status: 413 }), requestId);
  }

  const isMutation = !["GET", "HEAD", "OPTIONS"].includes(request.method);
  const writeFreezeExempt = WRITE_FREEZE_EXACT.includes(nextUrl.pathname)
    || WRITE_FREEZE_EXEMPT_PREFIXES.some((route) => nextUrl.pathname === route || nextUrl.pathname.startsWith(`${route}/`));
  if (isApi && isMutation && process.env.OPERATIONS_WRITE_FREEZE === "true" && !writeFreezeExempt) {
    return withRequestId(NextResponse.json({ error: "TeachX is temporarily read-only while service is restored.", code: "WRITE_FREEZE" }, {
      status: 503,
      headers: { "Retry-After": "60" }
    }), requestId);
  }

  if (publicApi) {
    return nextResponse(request, requestId);
  }

  let token = null;
  try {
    // `getToken` is the Auth.js-supported request reader for Next middleware.
    // Keep the cookie name identical to auth.ts so Railway's internal HTTP
    // connection cannot cause the reader to select a different cookie name.
    token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      cookieName: "authjs.session-token",
      secureCookie: process.env.NODE_ENV === "production"
    });
  } catch {
    return isApi ? unauthorizedApi(requestId) : withRequestId(NextResponse.redirect(new URL("/login", nextUrl)), requestId);
  }

  const userId = typeof token?.id === "string" ? token.id : null;
  const rawSessionVersion = token?.authSessionVersion;
  const authSessionVersion = typeof rawSessionVersion === "number"
    ? rawSessionVersion
    : typeof rawSessionVersion === "string" && /^\d+$/.test(rawSessionVersion)
      ? Number(rawSessionVersion)
      : null;
  let isAuthenticated = Boolean(userId);
  let roles: RoleKey[] = [];
  if (userId) {
    const account = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        authSessionVersion: true,
        status: true,
        roles: { select: { role: { select: { key: true } } } }
      }
    }).catch(() => null);
    // Always read roles from the active account. Older valid JWTs may not
    // have the session-version claim, and treating them as role-less sends
    // teachers to /access-denied even though their account is active.
    // New tokens still receive strict version invalidation after a reset.
    isAuthenticated = account?.status === "ACTIVE"
      && (authSessionVersion === null || account.authSessionVersion === authSessionVersion);
    roles = account?.roles.map(({ role }) => role.key as RoleKey) ?? [];
  }

  if (isApi && !isAuthenticated) return unauthorizedApi(requestId);

  const requiredPermission = getRoutePermission(nextUrl.pathname);

  if (!isApi && !isAuthenticated && !isPublicRoute) {
    if (!requiredPermission) return nextResponse(request, requestId);
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return withRequestId(NextResponse.redirect(loginUrl), requestId);
  }

  if (!isApi && isAuthenticated && ["/login", "/forgot-password"].includes(nextUrl.pathname)) {
    return withRequestId(NextResponse.redirect(new URL("/dashboard", nextUrl)), requestId);
  }

  if (!isApi && requiredPermission && !hasPermission(roles, requiredPermission)) {
    return withRequestId(NextResponse.redirect(new URL("/access-denied", nextUrl)), requestId);
  }

  return nextResponse(request, requestId);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
