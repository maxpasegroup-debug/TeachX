import type { PermissionKey } from "@/lib/constants/roles";

export const publicRoutes = ["/login", "/forgot-password", "/reset-password", "/guest-portal", "/setup", "/welcome", "/teachers", "/students", "/signup", "/marketplace", "/resources"] as const;

export const routePermissions: Record<string, PermissionKey> = {
  "/dashboard": "dashboard.view",
  "/teacher": "dashboard.view",
  "/student": "dashboard.view",
  "/admin": "dashboard.view",
  "/learning": "dashboard.view",
  "/parent": "dashboard.view",
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
  "/settings": "settings.view"
};

export function getRoutePermission(pathname: string) {
  return Object.entries(routePermissions).find(([route]) => pathname === route || pathname.startsWith(`${route}/`))?.[1];
}
