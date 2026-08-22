import type { Metadata } from "next";

import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { TaraPublicPage } from "@/components/landing/tara-public-page";
import { TaraWorkspace } from "@/features/tara/components/tara-workspace";
import { rolePermissions, type RoleKey } from "@/lib/constants/roles";
import { getInstitutionSettings } from "@/services/institution-service";
import { getTaraData } from "@/services/tara-service";
import { getWhiteLabelConfig } from "@/services/white-label-service";

export const metadata: Metadata = {
  title: "TARA - Your Professional AI Partner",
  description: "Meet TARA, the one intelligence across TeachX that supports teaching, creation, planning, professional growth and learning.",
  alternates: { canonical: "/tara" },
  openGraph: { title: "One AI. Many ways to help. | TARA", description: "The intelligence inside the TeachX Teacher Life OS.", url: "/tara", type: "website" },
  twitter: { card: "summary_large_image", title: "One AI. Many ways to help. | TARA", description: "The intelligence inside the TeachX Teacher Life OS." },
};

export default async function TaraPage() {
  const session = process.env.AUTH_SECRET ? await auth() : null;
  const canUseWorkspace = session?.user?.id && session.user.roles.some((role) => rolePermissions[role as RoleKey]?.includes("dashboard.view"));
  if (!session?.user?.id || !canUseWorkspace) return <TaraPublicPage />;

  const [data, institution, whiteLabel] = await Promise.all([
    getTaraData({ userId: session.user.id, institutionId: session.user.institutionId, roles: session.user.roles }),
    getInstitutionSettings(session.user.institutionId),
    getWhiteLabelConfig(session.user.institutionId),
  ]);

  return <AppShell institutionName={whiteLabel.institutionName || institution?.name || "TeachX"} roles={session.user.roles} whiteLabel={whiteLabel}><TaraWorkspace data={data} /></AppShell>;
}
