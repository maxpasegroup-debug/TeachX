"use server";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { GAMIFICATION_KEYS,type GamificationSettings } from "@/services/student-gamification-service";
async function student(){const s=await auth();if(!s?.user.id||!s.user.roles.includes("STUDENT"))throw new Error("Student access required");return s.user.id}
async function save(userId:string,key:string,value:Prisma.InputJsonValue){await prisma.userPreference.upsert({where:{userId_key:{userId,key}},create:{userId,key,value},update:{value}})}
export async function saveGamificationSettingsAction(form:FormData){const userId=await student(),reward=form.get("rewardPreference"),value:GamificationSettings={challenges:form.get("challenges")==="on",notifications:form.get("notifications")==="on",leaderboard:form.get("leaderboard")==="on",achievements:form.get("achievements")==="on",celebrations:form.get("celebrations")==="on",rewardPreference:reward==="academic"||reward==="consistency"?reward:"balanced"};await save(userId,GAMIFICATION_KEYS.settings,value as unknown as Prisma.InputJsonValue);revalidatePath("/student/gamification")}
