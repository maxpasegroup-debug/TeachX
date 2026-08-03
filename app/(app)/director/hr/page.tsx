import { auth } from "@/auth";
import { userHasPermission } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { getDirectorHrIntelligence } from "@/services/director-hr-service";
import { HrCommandCenter } from "./workspace";
export default async function DirectorHrPage(){const session=await auth();if(!session?.user||!userHasPermission(session.user.roles,"director.view"))redirect("/access-denied");return <HrCommandCenter data={await getDirectorHrIntelligence({institutionId:session.user.institutionId})}/>}
