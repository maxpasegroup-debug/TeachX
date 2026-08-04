import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TaraWorkspace } from "@/features/tara/components/tara-workspace";
import { getTaraData } from "@/services/tara-service";

export default async function TaraPage() {
  const session = await auth(); if (!session?.user.id) redirect("/login");
  return <TaraWorkspace data={await getTaraData({ userId: session.user.id, institutionId: session.user.institutionId, roles: session.user.roles })} />;
}
