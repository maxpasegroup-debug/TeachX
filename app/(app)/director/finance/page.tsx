import { auth } from "@/auth";
import { userHasPermission } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { getDirectorFinanceIntelligence } from "@/services/director-finance-service";
import { FinanceCommandCenter } from "./workspace";
export default async function DirectorFinancePage(){const session=await auth();if(!session?.user||!userHasPermission(session.user.roles,"director.view"))redirect("/access-denied");return <FinanceCommandCenter data={await getDirectorFinanceIntelligence({institutionId:session.user.institutionId})}/>}
