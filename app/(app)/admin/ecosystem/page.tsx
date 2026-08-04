import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { EcosystemCommandCenter } from "@/features/adminx/components/ecosystem-command-center";
import { getAdminEcosystemData } from "@/services/admin-ecosystem-service";
export default async function EcosystemPage(){const session=await auth();if(!session?.user.roles.includes("ADMIN"))redirect("/dashboard");return <EcosystemCommandCenter data={await getAdminEcosystemData(session.user.id)}/>}
