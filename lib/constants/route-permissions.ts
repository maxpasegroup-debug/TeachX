import type { PermissionKey } from "@/lib/constants/roles";
import apiRoutePolicy from "@/security/api-route-policy.json";

export const publicRoutes = ["/login", "/forgot-password", "/reset-password", "/verify-email", "/guest-portal", "/setup", "/welcome", "/teachers", "/students", "/signup", "/save-time", "/earn-more", "/learn-more", "/enjoy-more", "/tara", "/pricing", "/trust", "/status", "/privacy", "/terms", "/security", "/cookies", "/refund-policy", "/contact", "/marketplace", "/resources", "/manifest.webmanifest", "/robots.txt", "/sitemap.xml", "/sw.js", "/.well-known", "/offline", "/icons", "/brand"] as const;

export function isPublicApiRoute(pathname: string) {
  return apiRoutePolicy.publicExact.includes(pathname)
    || apiRoutePolicy.publicPrefixes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export const routePermissions: Record<string, PermissionKey> = {
  "/dashboard": "dashboard.view",
  "/teacher": "classrooms.view",
  "/student": "exams.attempt",
  "/admin": "settings.manage",
  "/learning": "dashboard.view",
  "/parent": "dashboard.view",
  "/parentx": "dashboard.view",
  "/campus": "operations.view",
  "/cloud": "dashboard.view",
  "/marketx": "dashboard.view",
  "/classrooms": "classrooms.view",
  "/courses": "courses.manage",
  "/batches": "batches.manage",
  "/classes": "planner.view",
  "/exams": "exams.view",
  "/content-studio": "content.view",
  "/communication": "dashboard.view",
  "/people": "people.view",
  "/admissions": "admissions.view",
  "/partners": "partners.view",
  "/finance": "finance.view",
  "/reception": "reception.view",
  "/staff": "staff.view",
  "/director": "director.view",
  "/operations": "operations.view",
  "/reports": "reports.view",
  // Institution configuration remains restricted, while personal settings are
  // available to every signed-in workspace through the canonical router.
  "/settings/institution": "settings.manage",
  "/settings": "dashboard.view",
  "/privacy-center": "dashboard.view"
};

export function getRoutePermission(pathname: string) {
  return Object.entries(routePermissions).find(([route]) => pathname === route || pathname.startsWith(`${route}/`))?.[1];
}
