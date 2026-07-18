"use client";

import { useActionState } from "react";
import type { Institution } from "@prisma/client";

import { saveInstitutionSettings } from "@/features/settings/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WhiteLabelConfig } from "@/services/white-label-service";

export function InstitutionSettingsForm({ institution, whiteLabel }: { institution: Institution | null; whiteLabel: WhiteLabelConfig }) {
  const [message, action, pending] = useActionState(saveInstitutionSettings, undefined);

  return (
    <form action={action}>
      <Card className="grid gap-6 p-6 md:grid-cols-2">
        <Field defaultValue={institution?.name ?? ""} label="Institution Name" name="name" required />
        <Field defaultValue={institution?.logoUrl ?? ""} label="Logo URL" name="logoUrl" />
        <Field defaultValue={institution?.primaryColor ?? "#111827"} label="Primary Color" name="primaryColor" type="color" />
        <Field defaultValue={institution?.secondaryColor ?? "#64748b"} label="Secondary Color" name="secondaryColor" type="color" />
        <Field defaultValue={whiteLabel.accentColor} label="Accent Color" name="accentColor" type="color" />
        <Field defaultValue={whiteLabel.faviconUrl ?? ""} label="Favicon URL" name="faviconUrl" />
        <Field defaultValue={whiteLabel.applicationTitle} label="Application Title" name="applicationTitle" />
        <Field defaultValue={whiteLabel.browserTitle} label="Browser Title" name="browserTitle" />
        <Field defaultValue={institution?.address ?? ""} label="Address" name="address" />
        <Field defaultValue={institution?.phone ?? ""} label="Phone" name="phone" />
        <Field defaultValue={institution?.email ?? ""} label="Email" name="email" type="email" />
        <Field defaultValue={institution?.website ?? ""} label="Website" name="website" />
        <Field defaultValue={institution?.timezone ?? "Asia/Kolkata"} label="Timezone" name="timezone" />
        <Field defaultValue={institution?.academicYear ?? ""} label="Academic Year" name="academicYear" />
        <Field defaultValue={institution?.currency ?? "INR"} label="Currency" name="currency" />
        <Field defaultValue={whiteLabel.footerText ?? ""} label="Footer" name="footerText" />
        <Field defaultValue={whiteLabel.emailTemplate ?? ""} label="Email Template" name="emailTemplate" />
        <Field defaultValue={whiteLabel.certificateTemplate ?? ""} label="Certificate Template" name="certificateTemplate" />
        <Field defaultValue={whiteLabel.invoiceTemplate ?? ""} label="Invoice Template" name="invoiceTemplate" />
        <Field defaultValue={whiteLabel.pdfBranding.footerNote ?? ""} label="PDF Footer Note" name="pdfFooterNote" />
        <label className="flex items-center gap-3 text-sm font-medium"><input defaultChecked={whiteLabel.pdfBranding.showLogo} name="pdfShowLogo" type="checkbox" /> Show logo on PDFs</label>
        <label className="flex items-center gap-3 text-sm font-medium"><input defaultChecked={whiteLabel.pdfBranding.showAddress} name="pdfShowAddress" type="checkbox" /> Show address on PDFs</label>
        <div className="flex items-end gap-4">
          <Button disabled={pending} type="submit">
            {pending ? "Saving" : "Save settings"}
          </Button>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </div>
      </Card>
    </form>
  );
}

function Field({ label, name, defaultValue, type = "text", required = false }: { label: string; name: string; defaultValue: string; type?: string; required?: boolean }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input defaultValue={defaultValue} id={name} name={name} required={required} type={type} />
    </div>
  );
}
