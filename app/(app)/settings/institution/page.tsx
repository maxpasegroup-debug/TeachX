import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { InstitutionSettingsForm } from "@/features/settings/components/institution-settings-form";
import { getInstitutionSettings } from "@/services/institution-service";
import { getWhiteLabelConfig } from "@/services/white-label-service";

export default async function InstitutionSettingsPage() {
  const session = await auth();
  const [institution, whiteLabel] = await Promise.all([getInstitutionSettings(session?.user.institutionId), getWhiteLabelConfig(session?.user.institutionId)]);

  return (
    <>
      <PageHeader description="Manage the identity, colors, contact details, timezone, academic year, and currency used across the platform." eyebrow="Settings" title="Institution settings" />
      <InstitutionSettingsForm institution={institution} whiteLabel={whiteLabel} />
    </>
  );
}
