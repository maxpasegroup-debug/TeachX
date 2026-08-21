import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { TeacherCommunityPage } from "@/features/teacher-community/components/teacher-community-page";
import { getTeacherCommunityData, teacherCommunityModules } from "@/services/teacher-community-service";

export default async function TeacherCommunityModulePage({params,searchParams}:{params:Promise<{module:string}>;searchParams:Promise<{page?:string;conversation?:string}>}){
  const {module}=await params;
  const query=await searchParams;
  const page=Math.max(1,Number.parseInt(query.page??"1",10)||1);
  if(!teacherCommunityModules.includes(module as (typeof teacherCommunityModules)[number]))notFound();
  const session=await auth();
  const data=await getTeacherCommunityData(session?.user.id,session?.user.institutionId,{page});
  if(!data)notFound();
  return <TeacherCommunityPage data={data} initialConversationId={query.conversation} module={module as (typeof teacherCommunityModules)[number]}/>;
}
