import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

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
    token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      cookieName: "authjs.session-token"
    });
  } catch {
    return isApi ? unauthorizedApi(requestId) : withRequestId(NextResponse.redirect(new URL("/login", nextUrl)), requestId);
  }

  let isAuthenticated = Boolean(token);
  if (token?.id && typeof token.authSessionVersion === "number") {
    const account = await prisma.user.findUnique({
      where: { id: token.id as string },
      select: { authSessionVersion: true, status: true }
    }).catch(() => null);
    isAuthenticated = account?.status === "ACTIVE" && account.authSessionVersion === token.authSessionVersion;
  }

  if (isApi && !isAuthenticated) return unauthorizedApi(requestId);

  if (!isApi && !isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return withRequestId(NextResponse.redirect(loginUrl), requestId);
  }

  if (!isApi && isAuthenticated && ["/login", "/forgot-password"].includes(nextUrl.pathname)) {
    return withRequestId(NextResponse.redirect(new URL("/dashboard", nextUrl)), requestId);
  }

  const requiredPermission = getRoutePermission(nextUrl.pathname);
  const roles = (token?.roles ?? []) as RoleKey[];

  if (!isApi && requiredPermission && !hasPermission(roles, requiredPermission)) {
    return withRequestId(NextResponse.redirect(new URL("/access-denied", nextUrl)), requestId);
  }

  return nextResponse(request, requestId);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
