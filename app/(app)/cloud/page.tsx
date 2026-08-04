import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { EduXCloudWorkspace } from "@/features/edux-cloud/components/edux-cloud-workspace";
import { getEduXCloudData } from "@/services/edux-cloud-service";

export default async function EduXCloudPage() {
  const session = await auth();
  if (!session?.user.id) redirect("/login");
  return <EduXCloudWorkspace data={await getEduXCloudData({ userId: session.user.id, institutionId: session.user.institutionId })} />;
}
