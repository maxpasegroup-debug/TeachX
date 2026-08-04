import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BusinessCommandCenter } from "@/features/adminx/components/business-command-center";
import { getAdminBusinessData } from "@/services/admin-business-service";
export default async function BusinessPage(){ const session=await auth(); if(!session?.user.roles.includes("ADMIN")) redirect("/dashboard"); return <BusinessCommandCenter data={await getAdminBusinessData(session.user.id)}/>; }
