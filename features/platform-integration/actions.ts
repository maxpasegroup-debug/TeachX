"use server";

import type { ActivityType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const value=(fd:FormData,key:string)=>String(fd.get(key)??"").trim();
export async function saveUnifiedTeacherSettingsAction(fd:FormData){
  const session=await auth(); if(!session?.user.id) throw new Error("Sign in to update settings.");
  const settings={
    appearance:value(fd,"appearance")||"system",language:value(fd,"language")||"English",privacy:value(fd,"privacy")||"professional",
    securityAlerts:fd.get("securityAlerts")==="on",aiStyle:value(fd,"aiStyle")||"balanced",marketplaceEmails:fd.get("marketplaceEmails")==="on",
    communityDiscovery:fd.get("communityDiscovery")==="on",offlineHints:fd.get("offlineHints")==="on"
  };
  await prisma.userPreference.upsert({where:{userId_key:{userId:session.user.id,key:"teacher.settings"}},create:{userId:session.user.id,key:"teacher.settings",value:settings},update:{value:settings}});
  const types=fd.getAll("notificationTypes").map(String) as ActivityType[];
  await prisma.$transaction((["SYSTEM","CONTENT","ANNOUNCEMENT","ASSIGNMENT","PLANNER"] as ActivityType[]).map(type=>prisma.notificationPreference.upsert({where:{userId_type:{userId:session.user.id,type}},create:{userId:session.user.id,type,enabled:types.includes(type),channels:{inApp:true}},update:{enabled:types.includes(type),channels:{inApp:true}}})));
  revalidatePath("/teacher/settings");
}
