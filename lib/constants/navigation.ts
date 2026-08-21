import {
  BookOpen,
  Bot,
  Building2,
  Compass,
  GraduationCap,
  Gauge,
  LayoutDashboard,
  LifeBuoy,
  LibraryBig,
  CalendarDays,
  Brain,
  CircleDollarSign,
  Clock3,
  CircleAlert,
  Bell,
  History,
  Heart,
  FileText,
  Map,
  LucideIcon,
  MessageCircle,
  PanelTop,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
  UsersRound,
  WalletCards
} from "lucide-react";

import type { RoleKey } from "@/lib/constants/roles";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  group?: string;
};

export type NavigationWorkspace = "teacher" | "student" | "parent" | "director" | "campus" | "admin";

// Shared Platform: workspace navigation remains role-aware because future
// frontends reuse the same auth, RBAC, and shell primitives.
export const teachXNavigation: Record<NavigationWorkspace, NavigationItem[]> = {
  teacher: [
    { label: "Home", href: "/teacher", icon: LayoutDashboard, group: "Home" },
    { label: "Save Time", href: "/teacher/life/save-time", icon: Clock3, group: "Teacher Life" },
    { label: "Earn More", href: "/teacher/life/earn-more", icon: CircleDollarSign, group: "Teacher Life" },
    { label: "Learn More", href: "/teacher/life/learn-more", icon: Brain, group: "Teacher Life" },
    { label: "Enjoy More", href: "/teacher/life/enjoy-more", icon: Heart, group: "Teacher Life" },
    { label: "TARA", href: "/tara", icon: Bot, group: "TARA" },
    { label: "Notifications", href: "/teacher/workspace/notifications", icon: Bell, group: "Account" },
    { label: "Profile", href: "/teacher/business/profile", icon: UsersRound, group: "Account" },
    { label: "Settings", href: "/teacher/settings", icon: Settings, group: "Support" }
  ],
  student: [
    { label: "Home", href: "/student", icon: LayoutDashboard },
    { label: "My Journey", href: "/student/journey", icon: Map },
    { label: "My Learning Map", href: "/student/onboarding", icon: Sparkles },
    { label: "Profile", href: "/profile", icon: GraduationCap },
    { label: "Goals", href: "/student/goals", icon: Gauge },
    { label: "Connections", href: "/student/connections", icon: UsersRound },
    { label: "AI Preferences", href: "/student/personalization", icon: Bot },
    { label: "AI Tutor", href: "/student/ask-ai", icon: Bot },
    { label: "Practice", href: "/student/practice", icon: GraduationCap },
    { label: "Flashcards", href: "/student/flashcards", icon: BookOpen },
    { label: "Progress", href: "/student/progress", icon: Search },
    { label: "Teachers", href: "/student/teachers", icon: UsersRound },
    { label: "Resources", href: "/student/resources", icon: LibraryBig },
    { label: "Purchases", href: "/student/purchases", icon: WalletCards },
    { label: "Community", href: "/communication", icon: MessageCircle },
    { label: "Bookmarks", href: "/student/bookmarks", icon: LibraryBig },
    { label: "Command Center", href: "/student/search", icon: Search },
    { label: "Notifications", href: "/student/notifications", icon: Bell },
    { label: "Timeline", href: "/student/timeline", icon: History },
    { label: "Files", href: "/student/files", icon: FileText },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Privacy", href: "/privacy-center", icon: ShieldCheck }
  ],
  parent: [
    { label: "Family Home", href: "/parent", icon: LayoutDashboard },
    { label: "Child Progress", href: "/parent?section=progress", icon: GraduationCap },
    { label: "Attendance & Calendar", href: "/parent?section=activity", icon: CalendarDays },
    { label: "Messages", href: "/parent?section=communication", icon: MessageCircle },
    { label: "Reports", href: "/parent?section=reports", icon: FileText },
    { label: "Settings", href: "/settings", icon: Settings }
  ],
  director: [
    { label: "Executive Home", href: "/director", icon: LayoutDashboard },
    { label: "Academic Intelligence", href: "/director/intelligence", icon: GraduationCap },
    { label: "Reports", href: "/director/reports", icon: FileText },
    { label: "Operations", href: "/director/operations", icon: Building2 },
    { label: "AI Intelligence", href: "/director/ai", icon: Bot },
    { label: "Settings", href: "/settings", icon: Settings }
  ],
  campus: [
    { label: "Campus Home", href: "/campus", icon: LayoutDashboard },
    { label: "Attendance", href: "/campus?module=attendance", icon: UsersRound },
    { label: "Visitors", href: "/campus?module=visitors", icon: Building2 },
    { label: "Operations", href: "/campus", icon: Gauge },
    { label: "Alerts", href: "/campus?module=security", icon: ShieldCheck },
    { label: "Settings", href: "/settings", icon: Settings }
  ],  admin: [
    { label: "Overview", href: "/admin", icon: PanelTop },
    { label: "Launch", href: "/admin/launch", icon: Rocket },
    { label: "Incidents", href: "/admin/incidents", icon: CircleAlert },
    { label: "Privacy", href: "/admin/privacy", icon: ShieldCheck },
    { label: "Control Center", href: "/admin/control/dashboard", icon: Gauge },
    { label: "Institution", href: "/institution/dashboard", icon: Building2 },
    { label: "Teachers", href: "/admin/teachers", icon: UsersRound },
    { label: "Students", href: "/admin/students", icon: GraduationCap },
    { label: "Growth", href: "/admin/platform-analytics", icon: PanelTop },
    { label: "Customer Success", href: "/admin/customer-success", icon: LifeBuoy },
    { label: "Governance", href: "/admin/governance", icon: ShieldCheck },
    { label: "Platform Brain", href: "/admin/platform-brain", icon: Bot },
    { label: "AI Platform", href: "/admin/ai-platform", icon: Bot },
    { label: "Ecosystem", href: "/admin/ecosystem", icon: Gauge },
    { label: "Business", href: "/admin/business", icon: WalletCards },
    { label: "Marketplace", href: "/admin/marketplace", icon: Store },
    { label: "Subscriptions", href: "/admin/subscriptions", icon: WalletCards },
    { label: "Orders", href: "/admin/orders", icon: WalletCards },
    { label: "Community", href: "/admin/announcements", icon: MessageCircle },
    { label: "Support", href: "/admin/support", icon: LifeBuoy },
    { label: "Settings", href: "/settings", icon: Settings }
  ]
};

const teacherRoles: RoleKey[] = ["ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR", "ACADEMIC_HEAD"];

export function resolveNavigationWorkspace(roles: RoleKey[] = []): NavigationWorkspace {
  if (roles.includes("STUDENT")) return "student";
  if (roles.includes("PARENT")) return "parent";
  if (roles.includes("DIRECTOR")) return "director";
  if (roles.includes("RECEPTION") || roles.includes("ACCOUNTS")) return "campus";
  if (roles.some((role) => teacherRoles.includes(role))) return "teacher";
  return "admin";
}

export function getNavigationForRoles(roles: RoleKey[] = []) {
  const workspace = resolveNavigationWorkspace(roles);

  return {
    workspace,
    items: teachXNavigation[workspace],
    switcher: [
      { label: "TeachX Home", href: "/dashboard", icon: Compass },
      { label: "Teacher", href: "/teacher", icon: Sparkles },
      { label: "Student", href: "/student", icon: BookOpen },
      { label: "Admin", href: "/admin", icon: PanelTop }
    ]
  };
}
