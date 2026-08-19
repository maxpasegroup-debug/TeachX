import { BadgeCheck, CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { verifyEmailAction } from "@/features/auth/actions";
import { AuthFormShell } from "@/features/auth/components/auth-form-shell";

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string; invalid?: string }> }) {
  const params = await searchParams;
  const invalid = params.invalid === "1" || !params.token;
  return (
    <AuthFormShell journey="recovery" title="Verify Email" subtitle="Confirm your address to protect account recovery and important receipts.">
      {invalid ? (
        <div className="flex gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert"><CircleAlert className="h-5 w-5 shrink-0" /><p>This verification link is invalid or expired. Sign in and request a new verification email from account settings.</p></div>
      ) : (
        <form action={verifyEmailAction} className="space-y-5">
          <input name="token" type="hidden" value={params.token} />
          <div className="flex gap-3 border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><BadgeCheck className="h-5 w-5 shrink-0" /><p>Verification is one-time. Confirm only if you created or updated this TeachX account.</p></div>
          <Button className="w-full" type="submit"><BadgeCheck className="mr-2 h-4 w-4" />Confirm email</Button>
        </form>
      )}
    </AuthFormShell>
  );
}
