import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GamificationWorkspace } from "@/features/student-gamification/components/gamification-workspace";
import { getStudentGamification } from "@/services/student-gamification-service";
export default async function Page({searchParams}:{searchParams:Promise<{window?:string}>}){const session=await auth();if(!session?.user.id||!session.user.roles.includes("STUDENT"))redirect("/entry");const window=(await searchParams).window==="month"?"month":"week";return <GamificationWorkspace data={await getStudentGamification(session.user.id,window)}/>}
