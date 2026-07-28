import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { TeacherCommunityPage } from "@/features/teacher-community/components/teacher-community-page";
import { getTeacherCommunityData, teacherCommunityModules } from "@/services/teacher-community-service";

export default async function TeacherCommunityModulePage({params}:{params:Promise<{module:string}>}){
  const {module}=await params;
  if(!teacherCommunityModules.includes(module as (typeof teacherCommunityModules)[number]))notFound();
  const session=await auth();
  const data=await getTeacherCommunityData(session?.user.id,session?.user.institutionId);
  if(!data)notFound();
  return <TeacherCommunityPage data={data} module={module as (typeof teacherCommunityModules)[number]}/>;
}
