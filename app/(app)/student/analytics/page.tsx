import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AnalyticsWorkspace } from "@/features/student-learning-analytics/components/analytics-workspace";
import { getStudentLearningAnalytics,type AnalyticsPeriod } from "@/services/student-learning-analytics-service";
export default async function Page({searchParams}:{searchParams:Promise<{period?:string}>}){const s=await auth();if(!s?.user.id||!s.user.roles.includes("STUDENT"))redirect("/entry");const p=(await searchParams).period,period:AnalyticsPeriod=p==="7"||p==="90"||p==="all"?p:"30";return <AnalyticsWorkspace data={await getStudentLearningAnalytics(s.user.id,period)}/>}
