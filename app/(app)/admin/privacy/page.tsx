import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PrivacyAdministration } from "@/features/privacy/components/privacy-administration";
import { userHasPermission } from "@/lib/rbac";
import { getPrivacyAdministration } from "@/services/privacy-service";

export const dynamic="force-dynamic";
export default async function AdminPrivacyPage(){const session=await auth();if(!session?.user||!session.user.roles.includes("ADMIN")||!userHasPermission(session.user.roles,"settings.manage"))redirect("/access-denied");return <PrivacyAdministration data={JSON.parse(JSON.stringify(await getPrivacyAdministration()))}/>;}
