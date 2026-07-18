import {
  BookOpen,
  Bot,
  Compass,
  GraduationCap,
  LayoutDashboard,
  LibraryBig,
  LucideIcon,
  MessageCircle,
  PanelTop,
  Search,
  Settings,
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

export const teachXNavigation: Record<NavigationWorkspace, NavigationItem[]> = {
  teacher: [
    { label: "Home", href: "/teacher", icon: LayoutDashboard },
    { label: "AI Studio", href: "/teacher/ai-studio", icon: Sparkles },
    { label: "AI Chat", href: "/teacher/ai-studio/chat", icon: Bot },
    { label: "AI History", href: "/teacher/ai-studio/history", icon: Search },
    { label: "Resources", href: "/teacher/resources", icon: LibraryBig },
    { label: "Marketplace", href: "/teacher/marketplace", icon: Store },
    { label: "Community", href: "/communication", icon: MessageCircle },
    { label: "Wallet", href: "/teacher/wallet", icon: WalletCards },
    { label: "Settings", href: "/teacher/settings", icon: Settings }
  ],
  student: [
    { label: "Home", href: "/student", icon: LayoutDashboard },
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
    { label: "Teachers", href: "/admin/teachers", icon: UsersRound },
    { label: "Students", href: "/admin/students", icon: GraduationCap },
    { label: "Growth", href: "/admin/platform-analytics", icon: PanelTop },
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
