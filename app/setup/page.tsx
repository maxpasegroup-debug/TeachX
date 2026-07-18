import { redirect } from "next/navigation";

import { SetupWizard } from "@/features/setup/components/setup-wizard";
import { hasCompletedFirstRun } from "@/services/setup-service";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  if (await hasCompletedFirstRun()) redirect("/login");
  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <SetupWizard />
    </main>
  );
}
