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
  Bell,
  History,
  Map,
  NotebookPen,
  LucideIcon,
  MessageCircle,
  PanelTop,
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
};

export type NavigationWorkspace = "teacher" | "student" | "admin";

// Shared Platform: workspace navigation remains role-aware because future
// frontends reuse the same auth, RBAC, and shell primitives.
export const teachXNavigation: Record<NavigationWorkspace, NavigationItem[]> = {
  teacher: [
    { label: "Home", href: "/teacher", icon: LayoutDashboard },
    { label: "My Classroom", href: "/teacher/workspace/classrooms", icon: UsersRound },
    { label: "Lessons", href: "/teacher/workspace/lessons", icon: BookOpen },
    { label: "Resources", href: "/teacher/workspace/resources", icon: LibraryBig },
    { label: "Planner", href: "/teacher/workspace/planner", icon: CalendarDays },
    { label: "Notes", href: "/teacher/workspace/notes", icon: NotebookPen },
    { label: "Saved AI", href: "/teacher/workspace/saved-ai", icon: Sparkles },
    { label: "Activity", href: "/teacher/workspace/activity", icon: History },
    { label: "Notifications", href: "/teacher/workspace/notifications", icon: Bell },
    { label: "Search", href: "/teacher/workspace/search", icon: Search },
    { label: "AI Studio", href: "/teacher/ai-studio", icon: Sparkles },
    { label: "AI Chat", href: "/teacher/ai-studio/chat", icon: Bot },
    { label: "AI History", href: "/teacher/ai-studio/history", icon: Search },
    { label: "Business Profile", href: "/teacher/business/profile", icon: Store },
    { label: "Portfolio", href: "/teacher/business/portfolio", icon: BookOpen },
    { label: "Publishing", href: "/teacher/business/publishing", icon: LibraryBig },
    { label: "Marketplace", href: "/teacher/business/marketplace", icon: Store },
    { label: "Earnings", href: "/teacher/business/earnings", icon: WalletCards },
    { label: "Orders", href: "/teacher/business/orders", icon: LibraryBig },
    { label: "Analytics", href: "/teacher/business/analytics", icon: Search },
    { label: "Community", href: "/teacher/community/home", icon: MessageCircle },
    { label: "Discussions", href: "/teacher/community/discussions", icon: MessageCircle },
    { label: "Teacher Groups", href: "/teacher/community/groups", icon: UsersRound },
    { label: "Network", href: "/teacher/community/network", icon: UsersRound },
    { label: "Messages", href: "/teacher/community/messages", icon: MessageCircle },
    { label: "Collaboration", href: "/teacher/community/collaboration", icon: LibraryBig },
    { label: "Wallet", href: "/teacher/business/wallet", icon: WalletCards },
    { label: "Subscription", href: "/teacher/business/subscription", icon: WalletCards },
    { label: "Settings", href: "/teacher/settings", icon: Settings }
  ],
  student: [
    { label: "Home", href: "/student", icon: LayoutDashboard },
    { label: "My Journey", href: "/student/journey", icon: Map },
    { label: "My Learning Map", href: "/student/onboarding", icon: Sparkles },
    { label: "Profile", href: "/student/profile", icon: GraduationCap },
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
    { label: "Settings", href: "/student/settings", icon: Settings }
  ],
  admin: [
    { label: "Overview", href: "/admin", icon: PanelTop },
    { label: "Control Center", href: "/admin/control/dashboard", icon: Gauge },
    { label: "Institution", href: "/institution/dashboard", icon: Building2 },
    { label: "Teachers", href: "/admin/teachers", icon: UsersRound },
    { label: "Students", href: "/admin/students", icon: GraduationCap },
    { label: "Growth", href: "/admin/platform-analytics", icon: PanelTop },
    { label: "Customer Success", href: "/admin/customer-success", icon: LifeBuoy },
    { label: "Governance", href: "/admin/governance", icon: ShieldCheck },
    { label: "AI Platform", href: "/admin/ai-platform", icon: Bot },
    { label: "Ecosystem", href: "/admin/ecosystem", icon: Gauge },
    { label: "Business", href: "/admin/business", icon: WalletCards },
    { label: "Marketplace", href: "/admin/marketplace", icon: Store },
    { label: "Subscriptions", href: "/admin/subscriptions", icon: WalletCards },
    { label: "Orders", href: "/admin/orders", icon: WalletCards },
    { label: "Community", href: "/admin/announcements", icon: MessageCircle },
    { label: "Settings", href: "/admin/settings", icon: Settings }
  ]
};

const teacherRoles: RoleKey[] = ["ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR", "ACADEMIC_HEAD"];

export function resolveNavigationWorkspace(roles: RoleKey[] = []): NavigationWorkspace {
  if (roles.includes("STUDENT")) return "student";
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
