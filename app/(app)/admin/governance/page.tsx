import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { GovernanceCommandCenter } from "@/features/adminx/components/governance-command-center";
import { getAdminGovernanceData } from "@/services/admin-governance-service";

export default async function GovernancePage() {
  const session = await auth();
  if (!session?.user.roles.includes("ADMIN")) redirect("/dashboard");
  return <GovernanceCommandCenter data={await getAdminGovernanceData()} />;
}
