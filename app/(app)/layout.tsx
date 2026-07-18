import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { getInstitutionSettings } from "@/services/institution-service";
import { getWhiteLabelConfig } from "@/services/white-label-service";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [institution, whiteLabel] = await Promise.all([getInstitutionSettings(session.user.institutionId), getWhiteLabelConfig(session.user.institutionId)]);

  return <AppShell institutionName={whiteLabel.institutionName || institution?.name || "TeachX"} roles={session.user.roles} whiteLabel={whiteLabel}>{children}</AppShell>;
}
