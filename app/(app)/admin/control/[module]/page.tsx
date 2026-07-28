import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { PlatformAdminPage } from "@/features/platform-admin/components/platform-admin-page";
import { getPlatformAdminData, platformAdminModules } from "@/services/platform-admin-service";

export default async function PlatformAdminControlPage({params}:{params:Promise<{module:string}>}){
  const {module}=await params;
  if(!platformAdminModules.includes(module as (typeof platformAdminModules)[number])) notFound();
  const session=await auth();
  if(!session?.user.roles.includes("ADMIN")) notFound();
  return <PlatformAdminPage data={await getPlatformAdminData()} module={module as (typeof platformAdminModules)[number]}/>;
}
