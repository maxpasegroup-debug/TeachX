import { auth } from "@/auth";
import { userHasPermission } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { getDirectorAiIntelligence } from "@/services/director-ai-service";
import { AiExecutiveCommandCenter } from "./workspace";

export default async function DirectorAiPage() { const session = await auth(); if (!session?.user || !userHasPermission(session.user.roles, "director.view")) redirect("/access-denied"); return <AiExecutiveCommandCenter data={await getDirectorAiIntelligence({ institutionId: session.user.institutionId })} />; }
