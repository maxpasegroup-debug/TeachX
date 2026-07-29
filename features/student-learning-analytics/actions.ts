"use server";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ANALYTICS_SETTINGS_KEY } from "@/services/student-learning-analytics-service";
export async function saveAnalyticsSettingsAction(form:FormData){const s=await auth();if(!s?.user.id||!s.user.roles.includes("STUDENT"))throw new Error("Student access required");const value={reportFormat:form.get("reportFormat")==="json"?"json":"csv",digest:form.get("digest")==="on",trackGoals:form.get("trackGoals")==="on",aiRecommendations:form.get("aiRecommendations")==="on",includeAIActivity:form.get("includeAIActivity")==="on",includeAchievements:form.get("includeAchievements")==="on"};await prisma.userPreference.upsert({where:{userId_key:{userId:s.user.id,key:ANALYTICS_SETTINGS_KEY}},create:{userId:s.user.id,key:ANALYTICS_SETTINGS_KEY,value:value as Prisma.InputJsonValue},update:{value:value as Prisma.InputJsonValue}});revalidatePath("/student/analytics")}
